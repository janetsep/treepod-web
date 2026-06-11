import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("sicra_hh_actividades")
    .select("*")
    .eq("activo", true)
    .order("area")
    .order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ actividades: data });
}

export async function POST(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("sicra_hh_actividades")
    .insert({
      nombre: body.nombre,
      responsable: body.responsable,
      area: body.area,
      horas_por_reserva: Number(body.horas_por_reserva) || 0,
      horas_por_dn: Number(body.horas_por_dn) || 0,
      horas_por_dn_desayuno: Number(body.horas_por_dn_desayuno) || 0,
      horas_por_reserva_tinaja: Number(body.horas_por_reserva_tinaja) || 0,
      costo_hora: Number(body.costo_hora) || 2000,
      activo: true,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ actividad: data });
}

export async function PUT(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const body = await req.json();
  const { id, ...rest } = body;
  const { data, error } = await supabaseAdmin
    .from("sicra_hh_actividades")
    .update({
      nombre: rest.nombre,
      responsable: rest.responsable,
      area: rest.area,
      horas_por_reserva: Number(rest.horas_por_reserva) || 0,
      horas_por_dn: Number(rest.horas_por_dn) || 0,
      horas_por_dn_desayuno: Number(rest.horas_por_dn_desayuno) || 0,
      horas_por_reserva_tinaja: Number(rest.horas_por_reserva_tinaja) || 0,
      costo_hora: Number(rest.costo_hora) || 2000,
      activo: rest.activo ?? true,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ actividad: data });
}

export async function DELETE(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const { id } = await req.json();
  const { error } = await supabaseAdmin
    .from("sicra_hh_actividades")
    .delete()
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
