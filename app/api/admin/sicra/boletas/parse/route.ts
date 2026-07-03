import { NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/admin-auth";

interface ParsedItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
  precio_final: number;
}

function parseBoleta(text: string) {
  const lines = text.split("\n").map((l) => l.trimEnd());

  const boletaMatch = text.match(/BOLETA ELECTRONICA[^\d]*(\d+)/i);
  const numero_boleta = boletaMatch ? boletaMatch[1] : "";

  const fechaMatch = text.match(/(\d{2})\/(\d{2})\/(\d{2})\s+\d{2}:\d{2}/);
  let fecha = "";
  if (fechaMatch) {
    const [, dd, mm, yy] = fechaMatch;
    fecha = `20${yy}-${mm}-${dd}`;
  }

  const subtotalMatch = text.match(/SUB\s*TOTAL\s*\$\s*([\d.]+)/);
  const totalLines = text.match(/^\s*TOTAL\s*\$\s*([\d.,]+)/m);
  const subtotal = subtotalMatch ? parseInt(subtotalMatch[1].replace(/\./g, "")) : 0;
  const total = totalLines ? parseInt(totalLines[1].replace(/\./g, "").replace(",", "")) : 0;

  const tienda = text.includes("JUMBO") ? "Jumbo" : text.includes("LIDER") ? "Lider" : "Otro";

  const items: ParsedItem[] = [];
  let inItems = false;
  let pendingQtyLine: { cantidad: number; precio_unitario: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("- - - - - -")) {
      inItems = true;
      i += 2;
      continue;
    }

    if (line.match(/SUB\s*TOTAL/)) break;
    if (!inItems) continue;

    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("TMP ")) continue;

    const qtyPrefixMatch = trimmed.match(/^(\d+)\s*X\s*\$\s*([\d.,]+)\s*$/);
    if (qtyPrefixMatch) {
      pendingQtyLine = {
        cantidad: parseInt(qtyPrefixMatch[1]),
        precio_unitario: parseInt(qtyPrefixMatch[2].replace(/\./g, "").replace(",", "")),
      };
      continue;
    }

    const weightPrefixMatch = trimmed.match(/^([\d.,]+)\s*KG\s*X\s*\$\s*([\d.,]+)\s*$/);
    if (weightPrefixMatch) {
      pendingQtyLine = {
        cantidad: parseFloat(weightPrefixMatch[1].replace(",", ".")),
        precio_unitario: parseInt(weightPrefixMatch[2].replace(/\./g, "").replace(",", "")),
      };
      continue;
    }

    const productMatch = trimmed.match(/^(\d[\d\s]*\d)\s+(.+?)\s+([\d.,]+)\s*$/);
    if (productMatch) {
      const codigo = productMatch[1].trim();
      const nombre = productMatch[2].trim();
      const linePrice = parseInt(productMatch[3].replace(/\./g, "").replace(",", ""));

      let cantidad = 1;
      let unidad = "unidad";
      let precio_unitario = linePrice;

      if (pendingQtyLine) {
        cantidad = pendingQtyLine.cantidad;
        precio_unitario = pendingQtyLine.precio_unitario;
        unidad = Number.isInteger(cantidad) ? "unidad" : "kg";
        pendingQtyLine = null;
      }

      let descuento = 0;
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]?.trim() || "";
        const discountMatch = nextLine.match(/TMP\s+(?:OFERTA|DESCUENTO|DESCUENTO DEFAU).*?-\s*(?:[A-Z]*-?)?([\d.,]+)/);
        if (discountMatch) {
          descuento = parseInt(discountMatch[1].replace(/\./g, "").replace(",", ""));
        }
      }

      items.push({
        codigo,
        nombre,
        cantidad,
        unidad,
        precio_unitario,
        subtotal: linePrice,
        descuento,
        precio_final: linePrice - descuento,
      });
      continue;
    }

    pendingQtyLine = null;
  }

  return { fecha, tienda, numero_boleta, subtotal, total, items };
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { text } = await request.json();
  if (!text) return NextResponse.json({ error: "Falta texto de boleta" }, { status: 400 });

  const parsed = parseBoleta(text);
  if (!parsed.items.length) {
    return NextResponse.json({ error: "No se encontraron productos en el texto" }, { status: 400 });
  }

  return NextResponse.json(parsed);
}
