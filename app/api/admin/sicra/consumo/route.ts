import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reserva_id = searchParams.get("reserva_id");

  if (reserva_id) {
    const { data, error } = await supabaseAdmin
      .from("sicra_consumo_estadia")
      .select("*, sicra_boleta_items(*, sicra_boletas(fecha, tienda))")
      .eq("reserva_id", reserva_id)
      .order("created_at", { ascending: true });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const total = (data || []).reduce((sum, c) => {
      if (c.boleta_item_id && c.sicra_boleta_items) {
        const item = c.sicra_boleta_items;
        const pricePerUnit =
          item.cantidad > 0 ? item.precio_final / item.cantidad : 0;
        return sum + Math.round(pricePerUnit * c.cantidad);
      }
      if (c.gasto_id && c.monto_unitario) {
        return sum + Math.round(c.monto_unitario * c.cantidad);
      }
      return sum;
    }, 0);

    return NextResponse.json({ consumos: data || [], total });
  }

  // Sin reserva_id: resumen por reserva
  const { data, error } = await supabaseAdmin
    .from("sicra_consumo_estadia")
    .select("reserva_id, cantidad, monto_unitario, gasto_id, boleta_item_id, sicra_boleta_items(precio_final, cantidad)")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const porReserva: Record<string, { items: number; total: number }> = {};
  for (const c of data || []) {
    if (!porReserva[c.reserva_id])
      porReserva[c.reserva_id] = { items: 0, total: 0 };
    porReserva[c.reserva_id].items += 1;

    if (c.boleta_item_id && c.sicra_boleta_items) {
      const item = c.sicra_boleta_items as unknown as { precio_final: number; cantidad: number };
      const pricePerUnit =
        item.cantidad > 0 ? item.precio_final / item.cantidad : 0;
      porReserva[c.reserva_id].total += Math.round(pricePerUnit * c.cantidad);
    } else if (c.gasto_id && c.monto_unitario) {
      porReserva[c.reserva_id].total += Math.round(c.monto_unitario * c.cantidad);
    }
  }

  return NextResponse.json({ porReserva });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  // Bulk: [{reserva_id, boleta_item_id, cantidad}]
  if (Array.isArray(body.items)) {
    const toInsert = body.items.map(
      (i: { reserva_id: string; boleta_item_id?: string; gasto_id?: string; cantidad?: number; nota?: string; concepto?: string; monto_unitario?: number }) => ({
        reserva_id: i.reserva_id,
        boleta_item_id: i.boleta_item_id || null,
        gasto_id: i.gasto_id || null,
        cantidad: i.cantidad || 1,
        nota: i.nota || null,
        concepto: i.concepto || null,
        monto_unitario: i.monto_unitario || null,
        registrado_por: admin.email,
      })
    );

    const { data, error } = await supabaseAdmin
      .from("sicra_consumo_estadia")
      .upsert(toInsert, { onConflict: "reserva_id,boleta_item_id" })
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, consumos: data });
  }

  const { reserva_id, boleta_item_id, gasto_id, cantidad, nota, concepto, monto_unitario } = body;
  if (!reserva_id || (!boleta_item_id && !gasto_id))
    return NextResponse.json(
      { error: "reserva_id y boleta_item_id o gasto_id requeridos" },
      { status: 400 }
    );

  const row: Record<string, unknown> = {
    reserva_id,
    cantidad: cantidad || 1,
    nota: nota || null,
    registrado_por: admin.email,
  };

  if (boleta_item_id) {
    row.boleta_item_id = boleta_item_id;
  } else {
    row.gasto_id = gasto_id;
    row.concepto = concepto || null;
    row.monto_unitario = monto_unitario || null;
  }

  const onConflict = boleta_item_id ? "reserva_id,boleta_item_id" : undefined;

  let query = supabaseAdmin.from("sicra_consumo_estadia");
  if (onConflict) {
    const { data, error } = await query
      .upsert(row, { onConflict })
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, consumo: data });
  }

  // For gasto_id, check if already exists
  const { data: existing } = await supabaseAdmin
    .from("sicra_consumo_estadia")
    .select("id")
    .eq("reserva_id", reserva_id)
    .eq("gasto_id", gasto_id!)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("sicra_consumo_estadia")
      .update({ cantidad: row.cantidad, nota: row.nota, monto_unitario: row.monto_unitario })
      .eq("id", existing.id)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, consumo: data });
  }

  const { data, error } = await supabaseAdmin
    .from("sicra_consumo_estadia")
    .insert(row)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, consumo: data });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id)
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("sicra_consumo_estadia")
    .delete()
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
