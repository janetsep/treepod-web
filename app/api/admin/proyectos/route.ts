import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: proyectos, error } = await supabaseAdmin
    .from("sicra_proyectos")
    .select("*, sicra_proyecto_gastos(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (proyectos || []).map((p) => {
    const gastos = p.sicra_proyecto_gastos || [];
    const totalGastado = gastos.reduce((s: number, g: { monto: number }) => s + g.monto, 0);

    const porConcepto: Record<string, { total: number; count: number }> = {};
    const porTipo: Record<string, { total: number; count: number }> = {};
    for (const g of gastos) {
      if (!porConcepto[g.concepto]) porConcepto[g.concepto] = { total: 0, count: 0 };
      porConcepto[g.concepto].total += g.monto;
      porConcepto[g.concepto].count += 1;

      if (!porTipo[g.tipo]) porTipo[g.tipo] = { total: 0, count: 0 };
      porTipo[g.tipo].total += g.monto;
      porTipo[g.tipo].count += 1;
    }

    return {
      ...p,
      totalGastado,
      porConcepto,
      porTipo,
      gastosCount: gastos.length,
    };
  });

  return NextResponse.json({ proyectos: result });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { nombre, descripcion, presupuesto, fecha_inicio } = body;

  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sicra_proyectos")
    .insert({
      nombre,
      descripcion: descripcion || null,
      presupuesto: presupuesto ? Math.round(presupuesto) : 0,
      fecha_inicio: fecha_inicio || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, proyecto: data });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("sicra_proyectos")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin.from("sicra_proyectos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
