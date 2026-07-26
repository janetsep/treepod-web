import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const revalidate = 3600; // el precio "desde" cambia por temporada, no por minuto

// Precio "desde $X por noche" para la temporada vigente, leído de las tarifas
// reales. Ancla la expectativa de precio antes de pedirle nada al huésped.
export async function GET() {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  const { data, error } = await supabaseAdmin
    .from("temporadas")
    .select("id, nombre, fecha_inicio, fecha_fin, tarifas(precio_noche)")
    .lte("fecha_inicio", hoy)
    .gte("fecha_fin", hoy)
    .limit(1)
    .single();

  if (error || !data) return NextResponse.json({ desde: null });

  const precios = (data.tarifas || []).map((t: any) => Number(t.precio_noche)).filter((n: number) => n > 0);
  const desde = precios.length ? Math.min(...precios) : null;
  return NextResponse.json({ desde, temporada: data.nombre });
}
