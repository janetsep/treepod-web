import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha") || new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin
    .from("sicra_checklist")
    .select("*")
    .eq("fecha", fecha)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  // Soporta inserción masiva (generar checklist del día)
  if (Array.isArray(body.items)) {
    const { data, error } = await supabaseAdmin
      .from("sicra_checklist")
      .insert(body.items)
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, items: data });
  }

  const { fecha, tipo, descripcion, reserva_id, domo_id } = body;
  if (!tipo || !descripcion) {
    return NextResponse.json({ error: "Tipo y descripción requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sicra_checklist")
    .insert({
      fecha: fecha || new Date().toISOString().split("T")[0],
      tipo,
      descripcion,
      reserva_id: reserva_id || null,
      domo_id: domo_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, completado } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("sicra_checklist")
    .update({
      completado: !!completado,
      completado_por: completado ? admin.email : null,
      completado_at: completado ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
