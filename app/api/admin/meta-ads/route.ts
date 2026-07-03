import { NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const GRAPH = "https://graph.facebook.com/v19.0";

/**
 * Gasto publicitario real desde la API de Meta Ads.
 * Config por variables de entorno (NUNCA token en el código):
 *   META_ADS_TOKEN       — token de acceso con permiso ads_read
 *   META_AD_ACCOUNT_ID   — ej: act_912405703021948
 *
 * Respuestas:
 *   { configurado: false }                → faltan variables
 *   { configurado: true, error: "token_vencido" } → renovar token
 *   { configurado: true, gastoMesActual, gasto12m, porMes, porCampania, moneda }
 */
export async function GET(request: Request) {
    const admin = await getVerifiedAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const token = process.env.META_ADS_TOKEN;
    const account = process.env.META_AD_ACCOUNT_ID;

    if (!token || !account) {
        return NextResponse.json({ configurado: false });
    }

    try {
        const hoy = new Date();
        const desde = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 11, 1))
            .toISOString().slice(0, 10);
        const hasta = hoy.toISOString().slice(0, 10);
        const timeRange = encodeURIComponent(JSON.stringify({ since: desde, until: hasta }));

        // Gasto por mes (12 meses)
        const mesRes = await fetch(
            `${GRAPH}/${account}/insights?fields=spend&time_increment=monthly&time_range=${timeRange}&access_token=${token}`,
            { cache: "no-store" }
        );
        const mesData = await mesRes.json();

        if (mesData.error) {
            const code = mesData.error.code;
            const esTokenVencido = code === 190;
            console.error("Meta Ads API error:", mesData.error.message);
            return NextResponse.json({
                configurado: true,
                error: esTokenVencido ? "token_vencido" : "api_error",
                detalle: String(mesData.error.message || "").slice(0, 160),
            });
        }

        const porMes = (mesData.data || []).map((r: any) => ({
            mes: String(r.date_start).slice(0, 7),
            gasto: Math.round(parseFloat(r.spend) || 0),
        }));
        const gasto12m = porMes.reduce((a: number, b: any) => a + b.gasto, 0);
        const mesActualKey = hasta.slice(0, 7);
        const gastoMesActual = porMes.find((p: any) => p.mes === mesActualKey)?.gasto || 0;

        // Gasto por campaña (12 meses)
        const campRes = await fetch(
            `${GRAPH}/${account}/insights?fields=spend,campaign_name,impressions,clicks&level=campaign&time_range=${timeRange}&limit=50&access_token=${token}`,
            { cache: "no-store" }
        );
        const campData = await campRes.json();
        const porCampania = (campData.data || [])
            .map((r: any) => ({
                campania: r.campaign_name || "(sin nombre)",
                gasto: Math.round(parseFloat(r.spend) || 0),
                impresiones: Number(r.impressions) || 0,
                clics: Number(r.clicks) || 0,
            }))
            .sort((a: any, b: any) => b.gasto - a.gasto);

        return NextResponse.json({
            configurado: true,
            gastoMesActual,
            gasto12m,
            porMes,
            porCampania,
        });
    } catch (e: any) {
        console.error("Error consultando Meta Ads:", e);
        return NextResponse.json({ configurado: true, error: "api_error", detalle: e.message });
    }
}
