import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Monitoreo de ofertas de Jumbo para los productos que MÁS usamos (derivado del
// consumo real). Guarda un historial de precios observados (manual o por captura
// en navegador) para detectar cuándo algo está en oferta.

export const jumboSearchUrl = (termino: string) =>
  `https://www.jumbo.cl/busqueda?ft=${encodeURIComponent(termino)}`;

// GET → lista de productos más usados con su última oferta observada.
// GET ?producto_id=<id> → historial completo de ese producto.
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productoId = searchParams.get("producto_id");

  if (productoId) {
    const { data: historial } = await supabaseAdmin
      .from("sicra_jumbo_precios")
      .select("*")
      .eq("producto_id", productoId)
      .order("observado_at", { ascending: false })
      .limit(60);
    return NextResponse.json({ historial: historial || [] });
  }

  const limite = Number(searchParams.get("limite")) || 25;

  // 1) Frecuencia de uso por producto (cuántas veces se consumió).
  const { data: consumos } = await supabaseAdmin
    .from("sicra_consumo_reserva")
    .select("producto_id, cantidad");
  const uso: Record<string, { veces: number; cantidad: number }> = {};
  for (const c of consumos || []) {
    if (!c.producto_id) continue;
    const u = uso[c.producto_id] || { veces: 0, cantidad: 0 };
    u.veces += 1;
    u.cantidad += Number(c.cantidad) || 0;
    uso[c.producto_id] = u;
  }
  const topIds = Object.entries(uso)
    .sort((a, b) => b[1].veces - a[1].veces || b[1].cantidad - a[1].cantidad)
    .slice(0, limite)
    .map(([id]) => id);

  if (topIds.length === 0) return NextResponse.json({ productos: [] });

  // 2) Datos de catálogo de esos productos.
  const { data: prods } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, categoria, unidad, precio_compra, termino_busqueda")
    .in("id", topIds);

  // 3) Última observación de precio por producto y por supermercado.
  const { data: precios } = await supabaseAdmin
    .from("sicra_jumbo_precios")
    .select("producto_id, supermercado, precio, precio_normal, en_oferta, url, origen, titulo, observado_at")
    .in("producto_id", topIds)
    .order("observado_at", { ascending: false });
  // ultimaPorSuper[producto_id][supermercado] = fila más reciente
  const ultimaPorSuper: Record<string, Record<string, any>> = {};
  const conteo: Record<string, number> = {};
  for (const p of precios || []) {
    if (!p.producto_id) continue;
    conteo[p.producto_id] = (conteo[p.producto_id] || 0) + 1;
    const sup = p.supermercado || "jumbo";
    (ultimaPorSuper[p.producto_id] ||= {});
    if (!ultimaPorSuper[p.producto_id][sup]) ultimaPorSuper[p.producto_id][sup] = p;
  }

  const productos = topIds.map((id) => {
    const p = (prods || []).find((x: any) => x.id === id);
    const nombre = p?.nombre || "—";
    const termino = (p?.termino_busqueda || nombre).trim();
    const porSuper = ultimaPorSuper[id] || {};
    // "Más barato" SOLO entre precios EXACTOS (boleta/manual, asociados por EAN);
    // los de Knasta son referenciales (emparejados por nombre) y no se comparan duro.
    const exactas = Object.values(porSuper).filter((x: any) => x.precio != null && x.origen !== "knasta");
    const masBarato = exactas.length >= 2
      ? exactas.reduce((a: any, b: any) => (Number(b.precio) < Number(a.precio) ? b : a))
      : null;
    return {
      producto_id: id,
      nombre,
      categoria: p?.categoria || "",
      unidad: p?.unidad || "",
      precio_compra: Number(p?.precio_compra) || null,
      veces_usado: uso[id]?.veces || 0,
      termino_busqueda: p?.termino_busqueda || null,
      jumbo_url: jumboSearchUrl(termino),
      precios_super: porSuper,                 // { jumbo:{...}, lider:{...}, santaisabel:{...} }
      mas_barato: masBarato ? masBarato.supermercado : null,
      ultima_oferta: porSuper["jumbo"] || null, // compat: Jumbo manual
      observaciones: conteo[id] || 0,
    };
  });

  return NextResponse.json({ productos });
}

// POST → registrar un precio/oferta observado (manual o por captura en navegador).
export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  // Fijar el término de búsqueda específico (marca + tamaño) de un producto.
  if (body.set_termino && body.producto_id) {
    const { error } = await supabaseAdmin
      .from("sicra_productos")
      .update({ termino_busqueda: (body.termino_busqueda || "").trim() || null })
      .eq("id", body.producto_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { producto_id, termino, precio, precio_normal, en_oferta, url, origen } = body;
  if (!producto_id && !termino) {
    return NextResponse.json({ error: "producto_id o termino requerido" }, { status: 400 });
  }

  // Si no viene término, usar el nombre del producto.
  let term = termino;
  if (!term && producto_id) {
    const { data: p } = await supabaseAdmin
      .from("sicra_productos").select("nombre").eq("id", producto_id).single();
    term = p?.nombre || "";
  }

  const precioNum = precio != null ? Math.round(Number(precio)) : null;
  const normalNum = precio_normal != null ? Math.round(Number(precio_normal)) : null;
  // Oferta si lo marcaron, o si el precio observado es menor al normal.
  const oferta = en_oferta != null
    ? !!en_oferta
    : (precioNum != null && normalNum != null && precioNum < normalNum);

  const { data, error } = await supabaseAdmin
    .from("sicra_jumbo_precios")
    .insert({
      producto_id: producto_id || null,
      termino: term,
      precio: precioNum,
      precio_normal: normalNum,
      en_oferta: oferta,
      url: url || (term ? jumboSearchUrl(term) : null),
      origen: origen || "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, registro: data });
}
