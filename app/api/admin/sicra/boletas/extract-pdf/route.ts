import { NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Extrae el texto de un PDF de boleta reconstruyendo las líneas por posición (Y).
export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let bytes: Uint8Array;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Falta el archivo PDF" }, { status: 400 });
    }
    bytes = new Uint8Array(await (file as File).arrayBuffer());
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 400 });
  }

  try {
    // Import dinámico del build legacy (compatible con Node). El worker se
    // importa explícitamente: en Vercel el bundler no rastrea el import
    // dinámico interno de pdf.worker.mjs y el "fake worker" falla sin esto.
    // @ts-expect-error pdf.worker.mjs no expone tipos; solo registra globalThis.pdfjsWorker
    await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true, isEvalSupported: false }).promise;

    const lineas: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();

      // Agrupar items por coordenada Y (redondeada) para reconstruir renglones
      const filas = new Map<number, { x: number; str: string }[]>();
      for (const item of content.items as any[]) {
        if (!item.str || !item.transform) continue;
        const y = Math.round(item.transform[5]);
        const x = item.transform[4];
        if (!filas.has(y)) filas.set(y, []);
        filas.get(y)!.push({ x, str: item.str });
      }

      // Ordenar renglones de arriba hacia abajo (Y descendente) y dentro de cada uno por X
      const ys = [...filas.keys()].sort((a, b) => b - a);
      for (const y of ys) {
        const partes = filas.get(y)!.sort((a, b) => a.x - b.x);
        const linea = partes.map((p) => p.str).join(" ").replace(/\s+/g, " ").trim();
        if (linea) lineas.push(linea);
      }
    }

    const text = lineas.join("\n");
    if (!text.trim()) {
      return NextResponse.json({ error: "El PDF no contiene texto (¿es una imagen escaneada?)" }, { status: 422 });
    }
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: `Error al procesar el PDF: ${e?.message || e}` }, { status: 500 });
  }
}
