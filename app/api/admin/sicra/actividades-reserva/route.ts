import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reserva_id = searchParams.get("reserva_id");

  if (!reserva_id) return NextResponse.json({ error: "reserva_id requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sicra_actividades_reserva")
    .select("*")
    .eq("reserva_id", reserva_id)
    .order("fecha", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const costo_total = (data || []).reduce((s: number, a: any) => s + Number(a.costo_estimado || 0), 0);
  return NextResponse.json({ actividades: data || [], costo_total });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { reserva_id, actividad, fecha, horas, personas, costo_estimado, nota } = await request.json();
  if (!reserva_id || !actividad) return NextResponse.json({ error: "reserva_id y actividad requeridos" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sicra_actividades_reserva")
    .insert({
      reserva_id,
      actividad,
      fecha: fecha || null,
      horas: horas ? Number(horas) : null,
      personas: personas ? Number(personas) : null,
      costo_estimado: costo_estimado ? Math.round(Number(costo_estimado)) : null,
      nota: nota || null,
      registrado_por: admin.email,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, actividad: data });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, actividad, fecha, horas, personas, costo_estimado, nota } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("sicra_actividades_reserva")
    .update({
      actividad,
      fecha: fecha || null,
      horas: horas ? Number(horas) : null,
      personas: personas ? Number(personas) : null,
      costo_estimado: costo_estimado ? Math.round(Number(costo_estimado)) : null,
      nota: nota || null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin.from("sicra_actividades_reserva").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
