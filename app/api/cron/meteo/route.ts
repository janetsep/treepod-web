import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Registro diario de meteorología para Valle Las Trancas (KM 72).
// Guarda el pronóstico a 7 días y lo observado ayer, para medir después
// la efectividad del pronóstico por horizonte (vista meteo_efectividad).
// Fuente: Open-Meteo (gratuita, sin API key).
const LAT = -36.9066, LON = -71.4881;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel Cron manda este header; también se permite ejecución manual con el secreto.
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  const daily = "temperature_2m_min,temperature_2m_max,precipitation_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,weather_code";

  const [fc, obs] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=${daily}&forecast_days=7&timezone=America/Santiago`).then(r => r.json()),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=${daily.replace(",precipitation_probability_max", "")}&past_days=2&forecast_days=1&timezone=America/Santiago`).then(r => r.json()),
  ]);

  const filas: any[] = [];
  const d = fc?.daily;
  if (d?.time) {
    d.time.forEach((fecha: string, i: number) => {
      filas.push({
        tipo: "pronostico", emitido: hoy, fecha_objetivo: fecha,
        tmin: d.temperature_2m_min?.[i], tmax: d.temperature_2m_max?.[i],
        precip_mm: d.precipitation_sum?.[i], nieve_cm: d.snowfall_sum?.[i],
        prob_precip: d.precipitation_probability_max?.[i],
        viento_kmh: d.wind_speed_10m_max?.[i], codigo_tiempo: d.weather_code?.[i],
      });
    });
  }
  const o = obs?.daily;
  if (o?.time) {
    o.time.forEach((fecha: string, i: number) => {
      if (fecha >= hoy) return; // solo dias ya transcurridos
      filas.push({
        tipo: "observado", emitido: fecha, fecha_objetivo: fecha,
        tmin: o.temperature_2m_min?.[i], tmax: o.temperature_2m_max?.[i],
        precip_mm: o.precipitation_sum?.[i], nieve_cm: o.snowfall_sum?.[i],
        viento_kmh: o.wind_speed_10m_max?.[i], codigo_tiempo: o.weather_code?.[i],
      });
    });
  }

  const { error } = await supabaseAdmin
    .from("meteo_registros")
    .upsert(filas, { onConflict: "tipo,emitido,fecha_objetivo" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, guardados: filas.length, dia: hoy });
}
