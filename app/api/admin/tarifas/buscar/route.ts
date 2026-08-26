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

  // Buscar tarifa: adultos exacto y las noches dentro del rango.
  //
  // noches_max vacio significa "sin tope", no "ningun valor": en Postgres una
  // comparacion contra null nunca es verdadera, asi que un .gte() lo descartaba
  // y la busqueda caia al respaldo, que devolvia la tarifa de UNA noche para
  // cualquier estadia. Con Primavera (21 sep al 19 dic), que tenia todos sus
  // topes vacios, el panel sugeria $130.000 por noche en vez de $95.000.
  // Se corrigieron los datos y ademas se cubre el caso aca.
  //
  // El orden descendente por noches_min toma la tarifa MAS especifica cuando
  // varias calzan (para 3 noches gana la de "2 o mas", no la de "1 o mas").
  const { data: tarifas } = await supabaseAdmin
    .from("tarifas")
    .select("id, adultos, noches_min, noches_max, precio_noche")
    .eq("temporada_id", temporada.id)
    .eq("adultos", adultos)
    .lte("noches_min", noches)
    .or(`noches_max.is.null,noches_max.gte.${noches}`)
    .order("noches_min", { ascending: false })
    .limit(1);

  if (!tarifas?.length) {
    // Intentar fallback: misma temporada, adultos exacto, sin restricción de noches
    const { data: fallback } = await supabaseAdmin
      .from("tarifas")
      .select("id, adultos, noches_min, noches_max, precio_noche")
      .eq("temporada_id", temporada.id)
      .eq("adultos", adultos)
      // Descendente: si hay que aproximar, se aproxima con la tarifa mas cercana
      // a la estadia real, no con la de una noche que es siempre la mas cara.
      .order("noches_min", { ascending: false })
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
