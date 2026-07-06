import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Lectura de clientes SOLO desde el servidor (con login). Reemplaza las lecturas que antes
// hacía el navegador con la clave pública, para poder cerrar la tabla `clientes` con RLS.
// - ?email=... → busca un cliente por email (autocompletar ficha).
// - sin parámetro → lista completa con sus reservas (consola de clientes).
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    const { data, error } = await supabaseAdmin
      .from("clientes")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cliente: data || null });
  }

  const { data, error } = await supabaseAdmin
    .from("clientes")
    .select("*, reservas(id, fecha_inicio, fecha_fin, total, monto_pagado, estado, created_at)")
    .order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clientes: data || [] });
}
