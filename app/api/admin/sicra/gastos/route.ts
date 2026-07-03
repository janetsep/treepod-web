import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const meses = Number(searchParams.get("meses")) || 3;

  const desde = new Date();
  desde.setMonth(desde.getMonth() - meses);
  const desdeStr = desde.toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin
    .from("sicra_gastos")
    .select("*")
    .gte("fecha", desdeStr)
    .order("fecha", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Agrupar por mes para resumen
  const porMes: Record<string, { total: number; count: number }> = {};
  for (const g of data || []) {
    const mes = g.fecha.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { total: 0, count: 0 };
    porMes[mes].total += g.monto;
    porMes[mes].count += 1;
  }

  return NextResponse.json({ gastos: data || [], porMes });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { fecha, categoria, monto, descripcion, periodo_inicio, periodo_fin, cantidad, unidad, precio_unitario } = body;

  if (!categoria) {
    return NextResponse.json({ error: "Categoría es requerida" }, { status: 400 });
  }

  const montoFinal = precio_unitario && cantidad
    ? Math.round(Number(precio_unitario) * Number(cantidad))
    : Math.round(Number(monto));

  if (!montoFinal || montoFinal <= 0) {
    return NextResponse.json({ error: "Monto o precio+cantidad son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sicra_gastos")
    .insert({
      fecha: fecha || new Date().toISOString().split("T")[0],
      categoria,
      monto: montoFinal,
      descripcion: descripcion || null,
      periodo_inicio: periodo_inicio || null,
      periodo_fin: periodo_fin || null,
      cantidad: cantidad ? Number(cantidad) : null,
      unidad: unidad || null,
      precio_unitario: precio_unitario ? Math.round(Number(precio_unitario)) : null,
      registrado_por: admin.email,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gasto: data });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { id, fecha, categoria, monto, descripcion, cantidad, unidad, precio_unitario } = body;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const montoFinal = precio_unitario && cantidad
    ? Math.round(Number(precio_unitario) * Number(cantidad))
    : Math.round(Number(monto));

  const { error } = await supabaseAdmin
    .from("sicra_gastos")
    .update({
      fecha,
      categoria,
      monto: montoFinal,
      descripcion: descripcion || null,
      cantidad: cantidad ? Number(cantidad) : null,
      unidad: unidad || null,
      precio_unitario: precio_unitario ? Math.round(Number(precio_unitario)) : null,
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

  const { error } = await supabaseAdmin.from("sicra_gastos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
