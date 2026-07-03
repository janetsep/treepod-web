import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("sicra_productos")
    .select("*")
    .order("categoria")
    .order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Uso/HN derivado del consumo real: cantidad total consumida de cada producto
  // dividida por las huésped-noches de las estadías que tuvieron consumo registrado.
  const usoMap: Record<string, number> = {};
  try {
    const { data: consumos } = await supabaseAdmin
      .from("sicra_consumo_reserva")
      .select("producto_id, cantidad, reserva_id");

    const reservaIds = [...new Set((consumos || []).map((c: any) => c.reserva_id).filter(Boolean))];

    if (reservaIds.length > 0) {
      const { data: reservas } = await supabaseAdmin
        .from("reservas")
        .select("id, fecha_inicio, fecha_fin, adultos")
        .in("id", reservaIds);

      const hnPorReserva: Record<string, number> = {};
      for (const r of reservas || []) {
        const noches = Math.max(1, Math.round(
          (new Date((r as any).fecha_fin).getTime() - new Date((r as any).fecha_inicio).getTime()) / 86400000
        ));
        const huespedes = Number((r as any).adultos) || 2;
        hnPorReserva[(r as any).id] = noches * huespedes;
      }

      // HN total de las estadías con consumo (denominador común)
      const hnTotal = Object.values(hnPorReserva).reduce((s, v) => s + v, 0);

      const cantidadPorProducto: Record<string, number> = {};
      for (const c of consumos || []) {
        if (!c.producto_id) continue;
        cantidadPorProducto[c.producto_id] = (cantidadPorProducto[c.producto_id] || 0) + Number(c.cantidad);
      }

      if (hnTotal > 0) {
        for (const [pid, cant] of Object.entries(cantidadPorProducto)) {
          usoMap[pid] = cant / hnTotal;
        }
      }
    }
  } catch {
    // si falla el cálculo derivado, devolvemos productos sin uso_real_hn
  }

  const productos = (data || []).map((p: any) => ({
    ...p,
    uso_real_hn: usoMap[p.id] ?? null,
  }));

  return NextResponse.json({ productos });
}

export async function POST(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const body = await req.json();
  if (!body.nombre || !body.categoria) {
    return NextResponse.json({ error: "nombre y categoría son obligatorios" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("sicra_productos")
    .insert({
      nombre: body.nombre,
      categoria: body.categoria,
      unidad: body.unidad || "unidad",
      unidad_consumo: body.unidad_consumo || null,
      contenido_por_unidad: Number(body.contenido_por_unidad) || 1,
      precio_referencia: Number(body.precio_referencia) || 0,
      cantidad_por_hn: Number(body.cantidad_por_hn) || 0,
      cantidad_por_dn: Number(body.cantidad_por_dn) || 0,
      presentacion: body.presentacion || null,
      precio_compra: Number(body.precio_compra) || 0,
      stock_actual: Number(body.stock_actual) || 0,
      contenido_por_presentacion: Number(body.contenido_por_presentacion) || 1,
      activo: true,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ producto: data });
}

export async function PUT(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const body = await req.json();
  const { id, ...rest } = body;

  // Construir update solo con los campos presentes en el body
  const update: Record<string, any> = {};
  if (rest.nombre !== undefined) update.nombre = rest.nombre;
  if (rest.categoria !== undefined) update.categoria = rest.categoria;
  if (rest.unidad !== undefined) update.unidad = rest.unidad;
  if (rest.precio_referencia !== undefined) update.precio_referencia = Number(rest.precio_referencia) || 0;
  if (rest.precio_compra !== undefined) update.precio_compra = Number(rest.precio_compra) || 0;
  if (rest.cantidad_por_hn !== undefined) update.cantidad_por_hn = Number(rest.cantidad_por_hn) || 0;
  if (rest.cantidad_por_dn !== undefined) update.cantidad_por_dn = Number(rest.cantidad_por_dn) || 0;
  if (rest.presentacion !== undefined) update.presentacion = rest.presentacion || null;
  if (rest.contenido_por_presentacion !== undefined) update.contenido_por_presentacion = Number(rest.contenido_por_presentacion) || 1;
  if (rest.activo !== undefined) update.activo = rest.activo;
  if (rest.stock_actual !== undefined) update.stock_actual = Number(rest.stock_actual);
  if (rest.unidad_consumo !== undefined) update.unidad_consumo = rest.unidad_consumo || null;
  if (rest.contenido_por_unidad !== undefined) update.contenido_por_unidad = Number(rest.contenido_por_unidad) || 1;

  const { data, error } = await supabaseAdmin
    .from("sicra_productos")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ producto: data });
}

export async function DELETE(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("sicra_productos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
