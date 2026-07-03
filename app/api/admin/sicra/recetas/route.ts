import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Costo por unidad de consumo de un producto: precio_compra / contenido_por_unidad
function precioConsumo(p: { precio_compra: number; contenido_por_unidad: number }) {
  const factor = Number(p.contenido_por_unidad) || 1;
  const precio = Number(p.precio_compra) || 0;
  return factor > 1 ? precio / factor : precio;
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: recetas, error } = await supabaseAdmin
    .from("sicra_recetas")
    .select("*")
    .order("categoria")
    .order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cargar items con producto O subreceta
  const { data: items } = await supabaseAdmin
    .from("sicra_receta_items")
    .select("*, sicra_productos(nombre, unidad, unidad_consumo, contenido_por_unidad, precio_compra), sub_receta:sicra_recetas!sub_receta_id(id, nombre)");

  // Mapa de costo_unitario por receta (para calcular costo de subrecetas en siguiente paso)
  const costoPorReceta: Record<string, number> = {};

  const itemsByReceta: Record<string, any[]> = {};
  for (const it of items || []) {
    const prod = (it as any).sicra_productos || null;
    const subReceta = (it as any).sub_receta || null;

    let nombre: string;
    let unidad_consumo: string;
    let costo: number;

    if (prod) {
      nombre = prod.nombre || "?";
      unidad_consumo = prod.unidad_consumo || prod.unidad || "";
      costo = Math.round(Number(it.cantidad) * precioConsumo(prod));
    } else if (subReceta) {
      nombre = subReceta.nombre || "?";
      unidad_consumo = "receta";
      // El costo de la subreceta se calcula después de procesar todos los items
      costo = 0;
    } else {
      nombre = "?";
      unidad_consumo = "";
      costo = 0;
    }

    const enriched = {
      ...it,
      producto_nombre: prod ? nombre : null,
      sub_receta_id: it.sub_receta_id || null,
      sub_receta_nombre: subReceta ? nombre : null,
      unidad_consumo,
      costo,
    };
    (itemsByReceta[it.receta_id] ||= []).push(enriched);
  }

  // Primera pasada: calcular costo_unitario de recetas sin subrecetas
  const recetasOut: any[] = (recetas || []).map((r: any) => {
    const its = itemsByReceta[r.id] || [];
    const costo_unitario = its.reduce((s: number, i: any) => s + i.costo, 0);
    costoPorReceta[r.id] = costo_unitario;
    return { ...r, items: its, costo_unitario };
  });

  // Segunda pasada: actualizar costo de items que son subrecetas
  for (const r of recetasOut) {
    let recalcular = false;
    for (const it of r.items) {
      if (it.sub_receta_id) {
        it.costo = Math.round(Number(it.cantidad) * (costoPorReceta[it.sub_receta_id] || 0));
        recalcular = true;
      }
    }
    if (recalcular) {
      r.costo_unitario = r.items.reduce((s: number, i: any) => s + i.costo, 0);
      costoPorReceta[r.id] = r.costo_unitario;
    }
  }

  return NextResponse.json({ recetas: recetasOut });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  if (action === "create_receta") {
    const { nombre, categoria, escala } = body;
    if (!nombre) return NextResponse.json({ error: "nombre requerido" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("sicra_recetas")
      .insert({ nombre, categoria: categoria || "otros", escala: escala || "unidad" })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, receta: data });
  }

  if (action === "add_item") {
    const { receta_id, producto_id, sub_receta_id, cantidad } = body;
    if (!receta_id || (!producto_id && !sub_receta_id))
      return NextResponse.json({ error: "receta_id y producto_id o sub_receta_id requeridos" }, { status: 400 });
    // Evitar referencia circular directa
    if (sub_receta_id && sub_receta_id === receta_id)
      return NextResponse.json({ error: "Una receta no puede incluirse a sí misma" }, { status: 400 });
    const row: Record<string, unknown> = { receta_id, cantidad: Number(cantidad) || 0 };
    if (producto_id) row.producto_id = producto_id;
    else row.sub_receta_id = sub_receta_id;
    const { error } = await supabaseAdmin.from("sicra_receta_items").insert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Asignar receta a una reserva: expande sus ingredientes a consumos y descuenta stock
  if (action === "asignar") {
    const { reserva_id, receta_id, cantidad, huespedes } = body;
    if (!reserva_id || !receta_id) return NextResponse.json({ error: "reserva_id y receta_id requeridos" }, { status: 400 });

    const { data: receta } = await supabaseAdmin
      .from("sicra_recetas").select("escala, nombre").eq("id", receta_id).single();
    if (!receta) return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 });

    const { data: items } = await supabaseAdmin
      .from("sicra_receta_items").select("producto_id, sub_receta_id, cantidad").eq("receta_id", receta_id);
    if (!items || items.length === 0) return NextResponse.json({ error: "La receta no tiene ingredientes" }, { status: 400 });

    // Multiplicador según escala
    const mult =
      receta.escala === "persona" ? (Number(huespedes) || 1) :
      receta.escala === "estadia" ? 1 :
      (Number(cantidad) || 1); // unidad

    // Expandir items: los de subreceta se expanden a sus ingredientes
    interface ItemExpandido { producto_id: string; cantidad: number; }
    async function expandirItems(its: { producto_id: string | null; sub_receta_id: string | null; cantidad: number }[], factor: number): Promise<ItemExpandido[]> {
      const resultado: ItemExpandido[] = [];
      for (const it of its) {
        const cant = Number(it.cantidad) * factor;
        if (cant <= 0) continue;
        if (it.producto_id) {
          resultado.push({ producto_id: it.producto_id, cantidad: cant });
        } else if (it.sub_receta_id) {
          const { data: subItems } = await supabaseAdmin
            .from("sicra_receta_items").select("producto_id, sub_receta_id, cantidad").eq("receta_id", it.sub_receta_id);
          if (subItems?.length) {
            const sub = await expandirItems(subItems as any, cant);
            resultado.push(...sub);
          }
        }
      }
      return resultado;
    }

    const ingredientes = await expandirItems(items as any, mult);

    // Si no viene fecha (asignación manual desde la pestaña Consumo), se usa hoy en vez
    // de null: así el consumo queda agrupado por día en vez de caer en "Sin fecha asignada".
    const fechaFinal = body.fecha || new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

    let insertados = 0;
    for (const ing of ingredientes) {
      const { data: prod } = await supabaseAdmin
        .from("sicra_productos").select("stock_actual, precio_compra, contenido_por_unidad").eq("id", ing.producto_id).single();
      const precioUnitario = prod ? Math.round(precioConsumo(prod as any)) : null;

      await supabaseAdmin.from("sicra_consumo_reserva").insert({
        reserva_id,
        producto_id: ing.producto_id,
        cantidad: ing.cantidad,
        concepto: receta.nombre,
        receta_id,
        receta_cantidad: mult,
        precio_unitario: precioUnitario,
        registrado_por: admin.email,
        fecha: fechaFinal,
      });

      if (prod) {
        await supabaseAdmin.from("sicra_productos")
          .update({ stock_actual: Math.max(0, Number(prod.stock_actual) - ing.cantidad) })
          .eq("id", ing.producto_id);
      }
      insertados++;
    }

    return NextResponse.json({ ok: true, insertados, multiplicador: mult });
  }

  return NextResponse.json({ error: "action inválida" }, { status: 400 });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { type, id } = body;
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  if (type === "receta") {
    const { nombre, categoria, escala, activo } = body;
    const upd: Record<string, unknown> = {};
    if (nombre !== undefined) upd.nombre = nombre;
    if (categoria !== undefined) upd.categoria = categoria;
    if (escala !== undefined) upd.escala = escala;
    if (activo !== undefined) upd.activo = activo;
    const { error } = await supabaseAdmin.from("sicra_recetas").update(upd).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "item") {
    const { error } = await supabaseAdmin
      .from("sicra_receta_items").update({ cantidad: Number(body.cantidad) || 0 }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type inválido" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { type, id } = await request.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const tabla = type === "item" ? "sicra_receta_items" : "sicra_recetas";
  const { error } = await supabaseAdmin.from(tabla).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
