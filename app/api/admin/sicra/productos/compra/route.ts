import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Registrar una compra de un producto: suma stock y recalcula el precio promedio
// ponderado. cantidad y precio_unitario están en UNIDADES DE COMPRA (paquete, kilo…).
export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { producto_id, cantidad, precio_unitario, fecha } = await request.json();
  const qty = Number(cantidad);
  const precioNuevo = Number(precio_unitario);
  if (!producto_id || !(qty > 0) || !(precioNuevo >= 0)) {
    return NextResponse.json({ error: "producto_id, cantidad y precio_unitario requeridos" }, { status: 400 });
  }

  const { data: p } = await supabaseAdmin
    .from("sicra_productos")
    .select("stock_actual, precio_compra, contenido_por_unidad, fecha_precio_actual")
    .eq("id", producto_id)
    .single();
  if (!p) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const factor = Number(p.contenido_por_unidad) || 1;
  // stock_actual está en unidades de consumo → pasar a unidades de compra para promediar
  const existentesCompra = Math.max(0, Number(p.stock_actual) / factor);
  const precioViejo = Number(p.precio_compra) || 0;

  const totalCompra = existentesCompra + qty;
  const precioPromedio = totalCompra > 0
    ? Math.round((existentesCompra * precioViejo + qty * precioNuevo) / totalCompra)
    : Math.round(precioNuevo);

  // El stock nuevo en unidades de consumo: lo existente + lo comprado × factor
  const nuevoStock = Number(p.stock_actual) + qty * factor;
  const fechaCompra = fecha || new Date().toISOString().split("T")[0];

  const { error } = await supabaseAdmin
    .from("sicra_productos")
    .update({
      stock_actual: nuevoStock,
      precio_compra: precioPromedio,
      precio_anterior: precioViejo || null,
      fecha_precio_anterior: p.fecha_precio_actual || null,
      fecha_precio_actual: fechaCompra,
    })
    .eq("id", producto_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    precio_promedio: precioPromedio,
    precio_anterior: precioViejo,
    stock_compra: existentesCompra,
    nuevo_total_compra: totalCompra,
    nuevo_stock_consumo: nuevoStock,
  });
}
