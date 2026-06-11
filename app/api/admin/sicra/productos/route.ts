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
  return NextResponse.json({ productos: data });
}

export async function POST(req: Request) {
  const admin = await getVerifiedAdmin(req);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("sicra_productos")
    .insert({
      nombre: body.nombre,
      categoria: body.categoria,
      unidad: body.unidad,
      precio_referencia: Number(body.precio_referencia) || 0,
      cantidad_por_hn: Number(body.cantidad_por_hn) || 0,
      cantidad_por_dn: Number(body.cantidad_por_dn) || 0,
      presentacion: body.presentacion || null,
      precio_compra: Number(body.precio_compra) || 0,
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
  const { data, error } = await supabaseAdmin
    .from("sicra_productos")
    .update({
      nombre: rest.nombre,
      categoria: rest.categoria,
      unidad: rest.unidad,
      precio_referencia: Number(rest.precio_referencia) || 0,
      cantidad_por_hn: Number(rest.cantidad_por_hn) || 0,
      cantidad_por_dn: Number(rest.cantidad_por_dn) || 0,
      presentacion: rest.presentacion || null,
      precio_compra: Number(rest.precio_compra) || 0,
      contenido_por_presentacion: Number(rest.contenido_por_presentacion) || 1,
      activo: rest.activo ?? true,
    })
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
