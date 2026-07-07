import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Precio por unidad de consumo a partir del producto actual (respaldo).
function precioActualProducto(p: any): number {
  const precio = Number(p?.precio_compra) || 0;
  const factor = Number(p?.contenido_por_unidad) || 1;
  return factor > 1 ? precio / factor : precio;
}

// Precio a usar para costear una fila de consumo: el congelado al asignar,
// o el actual del producto como respaldo si la fila es antigua y no lo tiene.
function precioCongelado(c: any): number {
  if (c.precio_unitario != null) return Number(c.precio_unitario);
  return precioActualProducto(c.sicra_productos);
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reserva_id = searchParams.get("reserva_id");

  if (!reserva_id) return NextResponse.json({ error: "reserva_id requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sicra_consumo_reserva")
    .select("*, sicra_productos(nombre, unidad, unidad_consumo, contenido_por_unidad, precio_compra)")
    .eq("reserva_id", reserva_id)
    .order("fecha", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Usar el precio CONGELADO al asignar (precio_unitario). Si una fila antigua no lo
  // tiene, se calcula desde el precio actual como respaldo. Esto mantiene inmutable
  // el costo de las reservas pasadas aunque cambien los precios en boletas nuevas.
  const total = (data || []).reduce((s: number, c: any) => {
    const precioUnit = precioCongelado(c);
    return s + Math.round(Number(c.cantidad) * precioUnit);
  }, 0);

  return NextResponse.json({ consumos: data || [], total });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { reserva_id, producto_id, fecha, cantidad, concepto, nota } = await request.json();
  if (!reserva_id || !cantidad) return NextResponse.json({ error: "reserva_id y cantidad requeridos" }, { status: 400 });

  // Si no viene fecha (asignación manual desde la pestaña Consumo), se usa hoy en vez
  // de null: así el consumo queda agrupado por día en vez de caer en "Sin fecha asignada".
  const fechaFinal = fecha || new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  // Congelar el precio por unidad de consumo en el momento de asignar.
  let precioUnitario: number | null = null;
  if (producto_id) {
    const { data: prodPrecio } = await supabaseAdmin
      .from("sicra_productos").select("precio_compra, contenido_por_unidad").eq("id", producto_id).single();
    if (prodPrecio) precioUnitario = Math.round(precioActualProducto(prodPrecio));
  }

  const { data, error } = await supabaseAdmin
    .from("sicra_consumo_reserva")
    .insert({ reserva_id, producto_id: producto_id || null, fecha: fechaFinal, cantidad: Number(cantidad), concepto: concepto || null, nota: nota || null, precio_unitario: precioUnitario, registrado_por: admin.email })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Descontar del stock si hay producto vinculado.
  // stock_actual y cantidad están ambos en unidades de consumo → descuento 1:1.
  if (producto_id) {
    const { data: prod } = await supabaseAdmin
      .from("sicra_productos").select("stock_actual").eq("id", producto_id).single();
    if (prod) {
      await supabaseAdmin.from("sicra_productos")
        .update({ stock_actual: Number(prod.stock_actual) - Number(cantidad) })
        .eq("id", producto_id);
    }
  }

  return NextResponse.json({ ok: true, consumo: data });
}

// Editar cantidad de un consumo ya registrado.
//  - { id, cantidad }: cambia una línea suelta (o un ingrediente individual).
//  - { reserva_id, receta_id, porciones }: re-escala TODA una receta a N porciones.
// En ambos casos ajusta el stock por la diferencia (consumir más descuenta, menos repone).
export async function PATCH(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  // Modo receta: re-escalar todos los ingredientes a las nuevas porciones
  if (body.reserva_id && body.receta_id && body.porciones != null) {
    const nuevasPorciones = Number(body.porciones);
    if (!(nuevasPorciones > 0)) return NextResponse.json({ error: "porciones inválidas" }, { status: 400 });

    // Acotar al día (fecha) si viene: la misma receta puede estar en varios días y
    // cada día debe escalarse por separado (si no, editar un día pisa los demás).
    let sel = supabaseAdmin
      .from("sicra_consumo_reserva")
      .select("id, producto_id, cantidad, receta_cantidad")
      .eq("reserva_id", body.reserva_id)
      .eq("receta_id", body.receta_id);
    if (body.fecha !== undefined) {
      sel = body.fecha === null ? sel.is("fecha", null) : sel.eq("fecha", body.fecha);
    }
    const { data: filas, error: errSel } = await sel;
    if (errSel) return NextResponse.json({ error: errSel.message }, { status: 500 });
    if (!filas || filas.length === 0) return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 });

    const porcionesActuales = Number(filas[0].receta_cantidad) || 1;
    if (porcionesActuales === nuevasPorciones) return NextResponse.json({ ok: true });
    const factor = nuevasPorciones / porcionesActuales;

    for (const f of filas) {
      const nuevaCant = Number(f.cantidad) * factor;
      const delta = nuevaCant - Number(f.cantidad);
      await supabaseAdmin
        .from("sicra_consumo_reserva")
        .update({ cantidad: nuevaCant, receta_cantidad: nuevasPorciones })
        .eq("id", f.id);
      if (f.producto_id && delta !== 0) {
        const { data: prod } = await supabaseAdmin
          .from("sicra_productos").select("stock_actual").eq("id", f.producto_id).single();
        if (prod) {
          await supabaseAdmin.from("sicra_productos")
            .update({ stock_actual: Number(prod.stock_actual) - delta })
            .eq("id", f.producto_id);
        }
      }
    }
    return NextResponse.json({ ok: true });
  }

  // Modo línea suelta: cambiar la cantidad de un único consumo
  const { id, cantidad } = body;
  if (!id || cantidad == null || !(Number(cantidad) > 0)) {
    return NextResponse.json({ error: "id y cantidad (> 0) requeridos" }, { status: 400 });
  }

  const { data: actual } = await supabaseAdmin
    .from("sicra_consumo_reserva").select("producto_id, cantidad").eq("id", id).single();
  if (!actual) return NextResponse.json({ error: "Consumo no encontrado" }, { status: 404 });

  const delta = Number(cantidad) - Number(actual.cantidad);
  const { error } = await supabaseAdmin
    .from("sicra_consumo_reserva").update({ cantidad: Number(cantidad) }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (actual.producto_id && delta !== 0) {
    const { data: prod } = await supabaseAdmin
      .from("sicra_productos").select("stock_actual").eq("id", actual.producto_id).single();
    if (prod) {
      await supabaseAdmin.from("sicra_productos")
        .update({ stock_actual: Number(prod.stock_actual) - delta })
        .eq("id", actual.producto_id);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  // Recuperar datos antes de borrar para devolver stock
  const { data: consumo } = await supabaseAdmin
    .from("sicra_consumo_reserva").select("producto_id, cantidad").eq("id", id).single();

  const { error } = await supabaseAdmin.from("sicra_consumo_reserva").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Devolver stock (ambos en unidades de consumo → 1:1)
  if (consumo?.producto_id) {
    const { data: prod } = await supabaseAdmin
      .from("sicra_productos").select("stock_actual").eq("id", consumo.producto_id).single();
    if (prod) {
      await supabaseAdmin.from("sicra_productos")
        .update({ stock_actual: Number(prod.stock_actual) + Number(consumo.cantidad) })
        .eq("id", consumo.producto_id);
    }
  }

  return NextResponse.json({ ok: true });
}
