import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { buscarKnasta } from "@/lib/knasta";

export const maxDuration = 60;

// Espera entre consultas para no abusar de Knasta.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// GET ?termino=azucar → búsqueda en vivo (Líder / Santa Isabel), sin guardar.
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const termino = new URL(request.url).searchParams.get("termino")?.trim();
  if (!termino) return NextResponse.json({ error: "termino requerido" }, { status: 400 });

  try {
    const precios = await buscarKnasta(termino);
    return NextResponse.json({ termino, precios });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error consultando Knasta" }, { status: 502 });
  }
}

// POST → refresca los precios de los productos más usados desde Knasta y los guarda
// en sicra_jumbo_precios (origen 'knasta', una fila por supermercado).
// Body opcional: { producto_id, termino } para refrescar solo uno.
export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  // Lista de productos a refrescar.
  let objetivos: { producto_id: string | null; termino: string }[] = [];

  if (body.termino) {
    objetivos = [{ producto_id: body.producto_id || null, termino: String(body.termino) }];
  } else {
    // Top productos por uso (mismo criterio que el panel).
    const { data: consumos } = await supabaseAdmin
      .from("sicra_consumo_reserva").select("producto_id");
    const veces: Record<string, number> = {};
    for (const c of consumos || []) if (c.producto_id) veces[c.producto_id] = (veces[c.producto_id] || 0) + 1;
    const topIds = Object.entries(veces).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([id]) => id);
    if (topIds.length) {
      const { data: prods } = await supabaseAdmin
        .from("sicra_productos").select("id, nombre, termino_busqueda").in("id", topIds);
      objetivos = topIds.map((id) => {
        const p = (prods || []).find((x: any) => x.id === id);
        // Buscar por el término específico (marca+tamaño) si existe; si no, el nombre.
        return { producto_id: id, termino: (p?.termino_busqueda || p?.nombre || "").trim() };
      }).filter((o) => o.termino);
    }
  }

  let guardados = 0;
  const errores: string[] = [];
  const filas: any[] = [];

  for (const obj of objetivos) {
    try {
      const precios = await buscarKnasta(obj.termino);
      for (const p of precios) {
        filas.push({
          producto_id: obj.producto_id,
          termino: obj.termino,
          titulo: p.titulo,
          supermercado: p.supermercado,
          precio: Math.round(p.precio),
          precio_normal: null,
          en_oferta: p.en_oferta,
          url: p.url,
          origen: "knasta",
        });
      }
    } catch (e: any) {
      errores.push(`${obj.termino}: ${e?.message || "error"}`);
    }
    await sleep(400);
  }

  if (filas.length) {
    const { error } = await supabaseAdmin.from("sicra_jumbo_precios").insert(filas);
    if (error) errores.push(error.message);
    else guardados = filas.length;
  }

  return NextResponse.json({ ok: true, refrescados: objetivos.length, guardados, errores });
}
