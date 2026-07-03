import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const proyecto_id = searchParams.get("proyecto_id");
  if (!proyecto_id) return NextResponse.json({ error: "proyecto_id requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sicra_proyecto_gastos")
    .select("*")
    .eq("proyecto_id", proyecto_id)
    .order("fecha", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ gastos: data || [] });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { proyecto_id, fecha, concepto, monto, proveedor, numero_documento, tipo, nota } = body;

  if (!proyecto_id || !concepto || !monto || monto <= 0) {
    return NextResponse.json({ error: "proyecto_id, concepto y monto son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sicra_proyecto_gastos")
    .insert({
      proyecto_id,
      fecha: fecha || new Date().toISOString().split("T")[0],
      concepto,
      monto: Math.round(monto),
      proveedor: proveedor || null,
      numero_documento: numero_documento || null,
      tipo: tipo || "material",
      nota: nota || null,
      registrado_por: admin.email,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gasto: data });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin.from("sicra_proyecto_gastos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
