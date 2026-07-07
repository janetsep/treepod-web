import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
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
  const { proyecto_id, fecha, concepto, monto, proveedor, numero_documento, tipo, nota, fuente_pago } = body;

  // ── Modo REPARTO: un solo pago dividido entre varios proyectos ──────────────
  // body.reparto = [{ proyecto_id, monto }, ...]. Crea una fila por proyecto,
  // todas con el mismo pago_grupo_id (para reconocerlas como un único pago).
  if (Array.isArray(body.reparto) && body.reparto.length > 0) {
    if (!concepto || !String(concepto).trim()) {
      return NextResponse.json({ error: "concepto requerido" }, { status: 400 });
    }
    const conceptoBase = String(concepto).trim();
    const items = body.reparto
      .map((r: any) => ({
        proyecto_id: r.proyecto_id,
        monto: Math.round(Number(r.monto)),
        // Concepto por línea (ej. "Electricidad" / "Mano de obra"); si no, el común.
        concepto: (r.concepto && String(r.concepto).trim()) || conceptoBase,
        tipo: r.tipo || tipo || "material",
      }))
      .filter((r: any) => r.proyecto_id && r.monto > 0 && r.concepto);
    if (items.length === 0) {
      return NextResponse.json({ error: "El reparto no tiene asignaciones válidas (proyecto, concepto y monto > 0)" }, { status: 400 });
    }
    const grupo = randomUUID();
    const filas = items.map((r: any) => ({
      proyecto_id: r.proyecto_id,
      fecha: fecha || new Date().toISOString().split("T")[0],
      concepto: r.concepto,
      monto: r.monto,
      proveedor: proveedor || null,
      numero_documento: numero_documento || null,
      tipo: r.tipo,
      nota: nota || null,
      fuente_pago: fuente_pago || null,
      pago_grupo_id: grupo,
      registrado_por: admin.email,
    }));
    const { error } = await supabaseAdmin.from("sicra_proyecto_gastos").insert(filas);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, creados: filas.length, pago_grupo_id: grupo, total: filas.reduce((s: number, f: any) => s + f.monto, 0) });
  }

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
      fuente_pago: fuente_pago || null,
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
