import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { precioPromedioPonderado } from "@/lib/sicra-costo";

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { fuente } = body; // "boletas" | "gastos"

  if (fuente === "boletas") {
    return importarDesdeBoletas();
  }
  if (fuente === "gastos") {
    return importarDesdeGastos();
  }

  return NextResponse.json({ error: "fuente debe ser 'boletas' o 'gastos'" }, { status: 400 });
}

async function importarDesdeBoletas() {
  const { data: items, error } = await supabaseAdmin
    .from("sicra_boleta_items")
    .select("id, nombre, cantidad, unidad, precio_unitario, precio_final, boleta_id, producto_id, sicra_boletas(fecha)")
    .order("nombre");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: productos } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, precio_compra, fecha_precio_actual, contenido_por_unidad")
    .eq("activo", true);

  const productoMap = new Map<string, { id: string; nombre: string; precio_compra: number; fecha_precio_actual: string | null; contenido_por_unidad: number }>();
  for (const p of productos || []) {
    productoMap.set(p.nombre.toLowerCase().trim(), p);
  }

  let creados = 0;
  let actualizados = 0;
  let stockSumado = 0;

  // Agrupar items por nombre normalizado para no crear duplicados
  const porNombre = new Map<string, typeof items>();
  for (const item of items || []) {
    if (item.producto_id) continue; // ya vinculado
    const key = item.nombre.toLowerCase().trim();
    if (!porNombre.has(key)) porNombre.set(key, []);
    porNombre.get(key)!.push(item);
  }

  for (const [key, itemGroup] of porNombre) {
    const sample = itemGroup[0];
    const totalCantidad = itemGroup.reduce((s, i) => s + Number(i.cantidad), 0);
    const ultimoItem = itemGroup.sort((a, b) => {
      const fa = (a.sicra_boletas as any)?.fecha || "";
      const fb = (b.sicra_boletas as any)?.fecha || "";
      return fb.localeCompare(fa);
    })[0];
    const precioUnitario = ultimoItem.precio_unitario;
    const fechaBoleta = (ultimoItem.sicra_boletas as any)?.fecha || new Date().toISOString().split("T")[0];

    // Precio unitario representativo del grupo (ponderado por cantidad dentro de la boleta)
    const grupoCosto = itemGroup.reduce((s, i) => s + Number(i.cantidad) * Number(i.precio_unitario), 0);
    const precioGrupo = totalCantidad > 0 ? grupoCosto / totalCantidad : precioUnitario;

    const existente = productoMap.get(key);

    if (existente) {
      const update: Record<string, unknown> = {};

      // Stock actual para promediar y sumar (en unidades de consumo)
      const { data: current } = await supabaseAdmin
        .from("sicra_productos")
        .select("stock_actual")
        .eq("id", existente.id)
        .single();

      const factor = Number(existente.contenido_por_unidad) || 1;
      const stockActual = Number(current?.stock_actual || 0);

      // Precio: PROMEDIO PONDERADO con el stock existente (consistente con "Registrar compra")
      const nuevoPrecio = precioPromedioPonderado({
        stockActualConsumo: stockActual,
        factor,
        precioViejo: Number(existente.precio_compra) || 0,
        qtyCompra: totalCantidad,
        precioNuevo: precioGrupo,
      });
      if (nuevoPrecio !== Number(existente.precio_compra)) {
        update.precio_anterior = existente.precio_compra;
        update.fecha_precio_anterior = existente.fecha_precio_actual;
        update.precio_compra = nuevoPrecio;
        update.fecha_precio_actual = fechaBoleta;
      }

      // Sumar stock (boleta en unidades de compra → × factor para unidades de consumo)
      update.stock_actual = stockActual + totalCantidad * factor;

      await supabaseAdmin
        .from("sicra_productos")
        .update(update)
        .eq("id", existente.id);

      // Vincular items
      const itemIds = itemGroup.map(i => i.id);
      await supabaseAdmin
        .from("sicra_boleta_items")
        .update({ producto_id: existente.id })
        .in("id", itemIds);

      actualizados++;
      stockSumado += totalCantidad;
    } else {
      // Crear producto nuevo
      const { data: nuevo } = await supabaseAdmin
        .from("sicra_productos")
        .insert({
          nombre: sample.nombre,
          categoria: "importado",
          unidad: sample.unidad || "unidad",
          precio_compra: Math.round(precioGrupo),
          fecha_precio_actual: fechaBoleta,
          stock_actual: totalCantidad,
          cantidad_por_hn: 0,
          cantidad_por_dn: 0,
          activo: true,
        })
        .select("id")
        .single();

      if (nuevo) {
        const itemIds = itemGroup.map(i => i.id);
        await supabaseAdmin
          .from("sicra_boleta_items")
          .update({ producto_id: nuevo.id })
          .in("id", itemIds);
        creados++;
        stockSumado += totalCantidad;
      }
    }
  }

  return NextResponse.json({ ok: true, creados, actualizados, stockSumado });
}

async function importarDesdeGastos() {
  const { data: gastos, error } = await supabaseAdmin
    .from("sicra_gastos")
    .select("*")
    .order("fecha", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: productos } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, precio_compra, fecha_precio_actual, stock_actual")
    .eq("activo", true);

  const productoMap = new Map<string, NonNullable<typeof productos>[0]>();
  for (const p of productos || []) {
    productoMap.set(p.nombre.toLowerCase().trim(), p);
  }

  let creados = 0;
  let actualizados = 0;

  for (const g of gastos || []) {
    const desc = (g.descripcion || g.categoria || "").toLowerCase().trim();
    if (!desc) continue;

    const existente = productoMap.get(desc);
    const cantidad = Number(g.cantidad) || 1;
    const precioUnit = Number(g.precio_unitario) || g.monto;

    if (existente) {
      const update: Record<string, unknown> = {};

      if (precioUnit !== Number(existente.precio_compra)) {
        update.precio_anterior = existente.precio_compra;
        update.fecha_precio_anterior = existente.fecha_precio_actual;
        update.precio_compra = precioUnit;
        update.fecha_precio_actual = g.fecha;
      }

      update.stock_actual = Number(existente.stock_actual || 0) + cantidad;

      await supabaseAdmin
        .from("sicra_productos")
        .update(update)
        .eq("id", existente.id);

      actualizados++;
    } else {
      const { data: nuevo } = await supabaseAdmin
        .from("sicra_productos")
        .insert({
          nombre: g.descripcion || g.categoria,
          categoria: "importado",
          unidad: g.unidad || "unidad",
          precio_compra: precioUnit,
          fecha_precio_actual: g.fecha,
          stock_actual: cantidad,
          cantidad_por_hn: 0,
          cantidad_por_dn: 0,
          activo: true,
        })
        .select("id")
        .single();

      if (nuevo) {
        productoMap.set(desc, { ...nuevo, precio_compra: precioUnit, fecha_precio_actual: g.fecha, stock_actual: cantidad, nombre: desc });
        creados++;
      }
    }
  }

  return NextResponse.json({ ok: true, creados, actualizados });
}
