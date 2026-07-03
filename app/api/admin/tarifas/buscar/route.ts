import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// GET /api/admin/tarifas/buscar?fecha=YYYY-MM-DD&noches=N&adultos=N
// Devuelve la tarifa y el total sugerido para la combinación dada
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");
  const noches = Number(searchParams.get("noches")) || 1;
  const adultos = Number(searchParams.get("adultos")) || 2;

  if (!fecha) return NextResponse.json({ error: "fecha requerida" }, { status: 400 });

  // Encontrar temporada vigente para esa fecha (mayor prioridad primero)
  const { data: temporadas } = await supabaseAdmin
    .from("temporadas")
    .select("id, nombre, fecha_inicio, fecha_fin, prioridad")
    .eq("activa", true)
    .lte("fecha_inicio", fecha)
    .gte("fecha_fin", fecha)
    .order("prioridad", { ascending: false })
    .limit(1);

  if (!temporadas?.length) {
    return NextResponse.json({ encontrado: false, mensaje: "Sin temporada vigente para esa fecha" });
  }

  const temporada = temporadas[0];

  // Buscar tarifa exacta: adultos y noches dentro del rango
  const { data: tarifas } = await supabaseAdmin
    .from("tarifas")
    .select("id, adultos, noches_min, noches_max, precio_noche")
    .eq("temporada_id", temporada.id)
    .eq("adultos", adultos)
    .lte("noches_min", noches)
    .gte("noches_max", noches)
    .limit(1);

  if (!tarifas?.length) {
    // Intentar fallback: misma temporada, adultos exacto, sin restricción de noches
    const { data: fallback } = await supabaseAdmin
      .from("tarifas")
      .select("id, adultos, noches_min, noches_max, precio_noche")
      .eq("temporada_id", temporada.id)
      .eq("adultos", adultos)
      .order("noches_min", { ascending: true })
      .limit(1);

    if (!fallback?.length) {
      return NextResponse.json({ encontrado: false, mensaje: `Sin tarifa para ${adultos} personas en temporada "${temporada.nombre}"` });
    }

    return NextResponse.json({
      encontrado: true,
      es_fallback: true,
      temporada: temporada.nombre,
      tarifa: fallback[0],
      precio_noche: fallback[0].precio_noche,
      total_hospedaje: fallback[0].precio_noche * noches,
    });
  }

  return NextResponse.json({
    encontrado: true,
    es_fallback: false,
    temporada: temporada.nombre,
    tarifa: tarifas[0],
    precio_noche: tarifas[0].precio_noche,
    total_hospedaje: tarifas[0].precio_noche * noches,
  });
}
