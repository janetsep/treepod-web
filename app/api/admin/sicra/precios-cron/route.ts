import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { refrescarPreciosMercado } from "@/lib/refrescar-precios";

// 60s es el tope del plan Hobby de Vercel (300s requiere Pro). Con ~25 productos
// el refresco entra holgado en 60s.
export const maxDuration = 60;

// Refresco de precios de mercado (Pilar B de ALMA), refuerzo MANUAL del botón
// "Actualizar precios". El refresco AUTOMÁTICO diario ya ocurre dentro de
// /api/admin/reporte-diario (el cron diario), así que no se agregó un 3er cron
// (el plan Hobby de Vercel solo permite 2). También acepta CRON_SECRET por si se
// habilita un cron dedicado en plan Pro.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const esCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!esCron) {
    const admin = await getVerifiedAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const limite = Number(request.nextUrl.searchParams.get("limite")) || 25;
  const r = await refrescarPreciosMercado(limite);
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), ...r });
}
