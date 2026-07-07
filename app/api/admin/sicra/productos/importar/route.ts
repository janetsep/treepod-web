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
    .select("id, nombre, codigo, cantidad, unidad, precio_unitario, precio_final, boleta_id, producto_id, sicra_boletas(fecha)")
    .order("nombre");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: productos } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, ean, precio_compra, fecha_precio_actual, contenido_por_unidad, stock_actual")
    .eq("activo", true);

  // Doble índice de identidad: por EAN (llave fuerte) y por nombre (respaldo).
  const porNombre = new Map<string, any>();
  const porEan = new Map<string, any>();
  for (const p of productos || []) {
    porNombre.set((p.nombre || "").toLowerCase().trim(), p);
    if (p.ean && String(p.ean).trim()) porEan.set(String(p.ean).trim(), p);
  }

  let creados = 0;
  let actualizados = 0;
  let stockSumado = 0;

  // Agrupar items NO vinculados por EAN (código de barras) si lo tienen, si no por nombre.
  // Así el mismo producto físico queda como UNO solo aunque el nombre venga distinto.
  const grupos = new Map<string, typeof items>();
  for (const item of items || []) {
    if (item.producto_id) continue; // ya vinculado
    const codigo = item.codigo ? String(item.codigo).trim() : "";
    const key = codigo ? `ean:${codigo}` : `nom:${(item.nombre || "").toLowerCase().trim()}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(item);
  }

  for (const [key, itemGroup] of grupos) {
    const sample = itemGroup[0];
    const codigo = key.startsWith("ean:") ? key.slice(4) : "";
    const totalCantidad = itemGroup.reduce((s, i) => s + Number(i.cantidad), 0);
    const ultimoItem = [...itemGroup].sort((a, b) => {
      const fa = (a.sicra_boletas as any)?.fecha || "";
      const fb = (b.sicra_boletas as any)?.fecha || "";
      return fb.localeCompare(fa);
    })[0];
    const fechaBoleta = (ultimoItem.sicra_boletas as any)?.fecha || new Date().toISOString().split("T")[0];

    // Precio unitario representativo del grupo (ponderado por cantidad).
    const grupoCosto = itemGroup.reduce((s, i) => s + Number(i.cantidad) * Number(i.precio_unitario), 0);
    const precioGrupo = totalCantidad > 0 ? grupoCosto / totalCantidad : Number(ultimoItem.precio_unitario) || 0;

    // Buscar producto existente: por EAN primero, luego por nombre.
    let existente = codigo ? porEan.get(codigo) : undefined;
    if (!existente) existente = porNombre.get((sample.nombre || "").toLowerCase().trim());

    if (existente) {
      const factor = Number(existente.contenido_por_unidad) || 1;
      const stockActual = Number(existente.stock_actual || 0);

      const nuevoPrecio = precioPromedioPonderado({
        stockActualConsumo: stockActual,
        factor,
        precioViejo: Number(existente.precio_compra) || 0,
        qtyCompra: totalCantidad,
        precioNuevo: precioGrupo,
      });

      const nuevoStock = stockActual + totalCantidad * factor; // boleta en unidades de compra → × factor
      const update: Record<string, unknown> = { stock_actual: nuevoStock };
      if (nuevoPrecio !== Number(existente.precio_compra)) {
        update.precio_anterior = existente.precio_compra;
        update.fecha_precio_anterior = existente.fecha_precio_actual;
        update.precio_compra = nuevoPrecio;
        update.fecha_precio_actual = fechaBoleta;
      }
      // Backfill del EAN si el producto no lo tenía → identidad única de aquí en adelante.
      if (codigo && !(existente.ean && String(existente.ean).trim())) update.ean = codigo;

      await supabaseAdmin.from("sicra_productos").update(update).eq("id", existente.id);
      await supabaseAdmin.from("sicra_boleta_items").update({ producto_id: existente.id }).in("id", itemGroup.map(i => i.id));

      // Acumular en memoria (por si otro grupo matchea el mismo producto en esta corrida).
      existente.stock_actual = nuevoStock;
      if (update.precio_compra != null) existente.precio_compra = update.precio_compra;
      if (codigo && !existente.ean) { existente.ean = codigo; porEan.set(codigo, existente); }
      actualizados++;
      stockSumado += totalCantidad;
    } else {
      const { data: nuevo } = await supabaseAdmin
        .from("sicra_productos")
        .insert({
          nombre: sample.nombre,
          categoria: "importado",
          unidad: sample.unidad || "unidad",
          ean: codigo || null, // el producto nuevo nace con su EAN → nunca se duplica
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
        await supabaseAdmin.from("sicra_boleta_items").update({ producto_id: nuevo.id }).in("id", itemGroup.map(i => i.id));
        const nuevoProd = { id: nuevo.id, nombre: (sample.nombre || "").toLowerCase().trim(), ean: codigo || null, precio_compra: Math.round(precioGrupo), fecha_precio_actual: fechaBoleta, contenido_por_unidad: 1, stock_actual: totalCantidad };
        porNombre.set(nuevoProd.nombre, nuevoProd);
        if (codigo) porEan.set(codigo, nuevoProd);
        creados++;
        stockSumado += totalCantidad;
      }
    }
  }

  return NextResponse.json({ ok: true, creados, actualizados, stockSumado });
}

async function importarDesdeGastos() {
  // IDEMPOTENTE: solo gastos que aún no se importaron a un producto. Sin esto, cada
  // corrida re-sumaba el stock de todos los gastos (10 → 20 → 30…).
  const { data: gastos, error } = await supabaseAdmin
    .from("sicra_gastos")
    .select("*")
    .eq("importado", false)
    .order("fecha", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: productos } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, precio_compra, fecha_precio_actual, stock_actual, contenido_por_unidad")
    .eq("activo", true);

  const productoMap = new Map<string, any>();
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
    const precioUnit = Number(g.precio_unitario) || Number(g.monto) || 0;

    let productoId: string | null = null;

    if (existente) {
      const factor = Number(existente.contenido_por_unidad) || 1;
      const stockActual = Number(existente.stock_actual || 0);

      // Precio: promedio ponderado con el stock existente (consistente con boletas/compra).
      const nuevoPrecio = precioPromedioPonderado({
        stockActualConsumo: stockActual,
        factor,
        precioViejo: Number(existente.precio_compra) || 0,
        qtyCompra: cantidad,
        precioNuevo: precioUnit,
      });

      const nuevoStock = stockActual + cantidad * factor; // gasto en unidades de compra → × factor
      const update: Record<string, unknown> = { stock_actual: nuevoStock };
      if (nuevoPrecio !== Number(existente.precio_compra)) {
        update.precio_anterior = existente.precio_compra;
        update.fecha_precio_anterior = existente.fecha_precio_actual;
        update.precio_compra = nuevoPrecio;
        update.fecha_precio_actual = g.fecha;
      }

      await supabaseAdmin.from("sicra_productos").update(update).eq("id", existente.id);

      // Acumular en memoria por si otro gasto de la misma corrida matchea el mismo producto.
      existente.stock_actual = nuevoStock;
      if (update.precio_compra != null) existente.precio_compra = update.precio_compra;
      productoId = existente.id;
      actualizados++;
    } else {
      const { data: nuevo } = await supabaseAdmin
        .from("sicra_productos")
        .insert({
          nombre: g.descripcion || g.categoria,
          categoria: "importado",
          unidad: g.unidad || "unidad",
          precio_compra: Math.round(precioUnit),
          fecha_precio_actual: g.fecha,
          stock_actual: cantidad,
          cantidad_por_hn: 0,
          cantidad_por_dn: 0,
          activo: true,
        })
        .select("id")
        .single();

      if (nuevo) {
        productoMap.set(desc, { id: nuevo.id, nombre: desc, precio_compra: Math.round(precioUnit), fecha_precio_actual: g.fecha, stock_actual: cantidad, contenido_por_unidad: 1 });
        productoId = nuevo.id;
        creados++;
      }
    }

    // Marcar el gasto como importado → nunca se vuelve a sumar (idempotencia).
    if (productoId) {
      await supabaseAdmin.from("sicra_gastos").update({ importado: true, producto_importado_id: productoId }).eq("id", g.id);
    }
  }

  return NextResponse.json({ ok: true, creados, actualizados });
}
