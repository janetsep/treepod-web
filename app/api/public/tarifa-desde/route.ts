import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Durante pruebas de conversión puede existir un rango temporal que se superpone
// a la temporada base. Se consulta en vivo para que el precio público cambie y
// se revierta al mismo tiempo que la configuración de tarifas.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreJson(body: Record<string, unknown>) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

// Precio "desde $X por noche" para la temporada vigente, leído de las tarifas
// reales. Ancla la expectativa de precio antes de pedirle nada al huésped.
export async function GET() {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  const { data, error } = await supabaseAdmin
    .from("temporadas")
    .select("id, nombre, fecha_inicio, fecha_fin, prioridad, tarifas(precio_noche, adultos, noches_min, noches_max)")
    .lte("fecha_inicio", hoy)
    .gte("fecha_fin", hoy)
    .order("prioridad", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return noStoreJson({ desde: null });

  // Referencia comercial: tarifa base de 2 personas para estadías de 2 noches o
  // más (la de 1 persona es más baja y confunde como "desde").
  const precios = (data.tarifas || [])
    .filter((t: any) => Number(t.adultos) === 2 && Number(t.noches_min) >= 2)
    .map((t: any) => Number(t.precio_noche))
    .filter((n: number) => n > 0);
  const desde = precios.length ? Math.min(...precios) : null;

  const preciosUnaNoche = (data.tarifas || [])
    .filter(
      (t: any) =>
        Number(t.adultos) === 2 &&
        Number(t.noches_min) === 1 &&
        Number(t.noches_max) === 1
    )
    .map((t: any) => Number(t.precio_noche))
    .filter((n: number) => n > 0);
  const unaNoche = preciosUnaNoche.length ? Math.min(...preciosUnaNoche) : null;

  return noStoreJson({ desde, unaNoche, temporada: data.nombre });
}
