import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: proyectos, error: pe } = await supabaseAdmin
    .from("sicra_proyectos")
    .select("*")
    .order("fecha_inicio", { ascending: false });
  if (pe) return NextResponse.json({ error: pe.message }, { status: 500 });

  const { data: gastos, error: ge } = await supabaseAdmin
    .from("sicra_proyecto_gastos")
    .select("*")
    .order("fecha", { ascending: false });
  if (ge) return NextResponse.json({ error: ge.message }, { status: 500 });

  const gastosById: Record<string, any[]> = {};
  for (const g of gastos || []) {
    if (!gastosById[g.proyecto_id]) gastosById[g.proyecto_id] = [];
    gastosById[g.proyecto_id].push(g);
  }

  const result = (proyectos || []).map((p) => {
    const gs = gastosById[p.id] || [];
    const gastado = gs.reduce((s: number, g: any) => s + Number(g.monto || 0), 0);
    return { ...p, gastos: gs, gastado };
  });

  return NextResponse.json({ proyectos: result });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  if (action === "create_project") {
    const { nombre, descripcion, presupuesto, fecha_inicio, fecha_fin } = body;
    if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("sicra_proyectos")
      .insert({ nombre, descripcion: descripcion || null, presupuesto: Number(presupuesto) || 0, fecha_inicio: fecha_inicio || null, fecha_fin: fecha_fin || null, estado: "activo" })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, proyecto: data });
  }

  if (action === "add_gasto") {
    const { proyecto_id, fecha, concepto, monto, proveedor, tipo, nota, numero_documento, finanzas_movimiento_id } = body;
    if (!proyecto_id || !monto) return NextResponse.json({ error: "proyecto_id y monto requeridos" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("sicra_proyecto_gastos")
      .insert({
        proyecto_id,
        fecha: fecha || new Date().toISOString().split("T")[0],
        concepto: concepto || null,
        monto: Math.round(Number(monto)),
        proveedor: proveedor || null,
        tipo: tipo || "material",
        nota: nota || null,
        numero_documento: numero_documento || null,
        registrado_por: admin.email,
      })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, gasto: data });
  }

  return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { type, id, ...fields } = body;

  if (type === "project") {
    const { nombre, descripcion, presupuesto, fecha_inicio, fecha_fin, estado } = fields;
    const { error } = await supabaseAdmin
      .from("sicra_proyectos")
      .update({ nombre, descripcion: descripcion || null, presupuesto: Number(presupuesto) || 0, fecha_inicio: fecha_inicio || null, fecha_fin: fecha_fin || null, estado: estado || "activo" })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "gasto") {
    const { fecha, concepto, monto, proveedor, tipo, nota, numero_documento } = fields;
    const { error } = await supabaseAdmin
      .from("sicra_proyecto_gastos")
      .update({ fecha, concepto: concepto || null, monto: Math.round(Number(monto)), proveedor: proveedor || null, tipo: tipo || "material", nota: nota || null, numero_documento: numero_documento || null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type requerido (project | gasto)" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { type, id } = await request.json();

  if (type === "project") {
    await supabaseAdmin.from("sicra_proyecto_gastos").delete().eq("proyecto_id", id);
    const { error } = await supabaseAdmin.from("sicra_proyectos").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "gasto") {
    const { error } = await supabaseAdmin.from("sicra_proyecto_gastos").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type requerido" }, { status: 400 });
}
