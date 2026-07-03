import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { alternativasKnasta } from "@/lib/knasta";

export const maxDuration = 30;

// Comparador por producto: tu precio (de boleta, exacto) vs TODAS las opciones del
// mismo producto y tamaño (otras marcas, todas las tiendas) ordenadas por precio,
// con el ahorro respecto a lo que pagas hoy.
//   GET ?producto_id=<id>
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const productoId = new URL(request.url).searchParams.get("producto_id");
  if (!productoId) return NextResponse.json({ error: "producto_id requerido" }, { status: 400 });

  const { data: p } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, termino_busqueda, precio_compra")
    .eq("id", productoId)
    .single();
  if (!p) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const termino = (p.termino_busqueda || p.nombre || "").trim();

  // Tu precio de referencia: la última observación EXACTA (boleta/manual), con tienda.
  const { data: ref } = await supabaseAdmin
    .from("sicra_jumbo_precios")
    .select("precio, supermercado, origen, titulo, observado_at")
    .eq("producto_id", productoId)
    .neq("origen", "knasta")
    .not("precio", "is", null)
    .order("observado_at", { ascending: false })
    .limit(1);
  const tuPrecioRow = ref && ref[0] ? ref[0] : null;
  const tuPrecio = tuPrecioRow ? Number(tuPrecioRow.precio) : (Number(p.precio_compra) || null);

  let alternativas: any[] = [];
  try {
    alternativas = await alternativasKnasta(termino);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error consultando Knasta" }, { status: 502 });
  }

  const masBarato = alternativas.length ? alternativas[0] : null;
  const ahorroUnidad = tuPrecio != null && masBarato ? tuPrecio - masBarato.precio : null;
  const ahorroPct = ahorroUnidad != null && tuPrecio ? Math.round((ahorroUnidad / tuPrecio) * 100) : null;

  return NextResponse.json({
    producto_id: productoId,
    nombre: p.nombre,
    termino,
    tu_precio: tuPrecio,
    tu_precio_tienda: tuPrecioRow?.supermercado || (tuPrecio != null ? "jumbo" : null),
    tu_precio_origen: tuPrecioRow?.origen || (tuPrecio != null ? "compra" : null),
    alternativas,
    mas_barato: masBarato,
    ahorro_unidad: ahorroUnidad != null && ahorroUnidad > 0 ? ahorroUnidad : null,
    ahorro_pct: ahorroPct != null && ahorroPct > 0 ? ahorroPct : null,
  });
}
