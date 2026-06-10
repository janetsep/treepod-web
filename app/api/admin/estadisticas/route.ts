import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Estadísticas de negocio calculadas desde las RESERVAS (la fuente real),
 * no desde la tabla de caja (que históricamente solo registró Webpay).
 *
 * Devuelve:
 *  - kpis: ingresos de estadías del mes, por cobrar (saldos futuros),
 *          ocupación % y noches vendidas del mes, reservas futuras.
 *  - serie12m: ingresos y noches por mes (últimos 12 meses, para el gráfico).
 *  - canales: reservas e ingresos por canal (web/airbnb/manual/whatsapp) últimos 12 meses.
 */
export async function GET() {
    try {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10);
        const y = hoy.getUTCFullYear();
        const m = hoy.getUTCMonth(); // 0-11

        const { count: domosActivos } = await supabaseAdmin
            .from("domos")
            .select("*", { count: "exact", head: true })
            .eq("activo", true);
        const nDomos = domosActivos || 4;

        // Ventana: 12 meses hacia atrás + todo lo futuro
        const desde = new Date(Date.UTC(y, m - 11, 1)).toISOString().slice(0, 10);

        const rows: any[] = [];
        const PAGE = 1000;
        for (let from = 0; ; from += PAGE) {
            const { data, error } = await supabaseAdmin
                .from("reservas")
                .select("fecha_inicio, fecha_fin, total, monto_pagado, fuente, estado, utm_source, utm_medium, utm_campaign")
                .in("estado", ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation"])
                .is("deleted_at", null)
                .gte("fecha_fin", desde)
                .range(from, from + PAGE - 1);
            if (error) throw error;
            rows.push(...(data || []));
            if (!data || data.length < PAGE) break;
        }

        const mesKey = (yy: number, mm: number) => `${yy}-${String(mm + 1).padStart(2, "0")}`;
        const diasDelMes = (yy: number, mm: number) => new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();

        // Últimos 12 meses (incluye el actual)
        const meses: { key: string; label: string; anio: number; mes: number }[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(Date.UTC(y, m - i, 1));
            meses.push({
                key: mesKey(d.getUTCFullYear(), d.getUTCMonth()),
                label: d.toLocaleDateString("es-CL", { month: "short", year: "2-digit", timeZone: "UTC" }),
                anio: d.getUTCFullYear(),
                mes: d.getUTCMonth(),
            });
        }

        const ingresosPorMes: Record<string, number> = {};
        const nochesPorMes: Record<string, number> = {};
        const canales: Record<string, { reservas: number; ingresos: number }> = {};

        const normalizaCanal = (fuente: string | null) => {
            const f = (fuente || "").toLowerCase();
            if (f.includes("web")) return "Web (sitio propio)";
            if (f.includes("airbnb")) return "Airbnb";
            if (f.includes("whatsapp")) return "WhatsApp";
            if (f.includes("manual")) return "Manual (directa)";
            if (f.includes("booking")) return "Booking";
            return "Otro";
        };

        let ingresosMesActual = 0;
        let porCobrar = 0;
        let reservasFuturas = 0;

        const mesActualKey = mesKey(y, m);

        for (const r of rows) {
            const pagado = Number(r.monto_pagado) || 0;
            const total = Number(r.total) || 0;
            const inicio = String(r.fecha_inicio);
            const inicioKey = inicio.slice(0, 7);

            // Ingresos asignados al mes de la estadía (mismo criterio que la matriz)
            if (ingresosPorMes[inicioKey] !== undefined || meses.some((mm) => mm.key === inicioKey)) {
                ingresosPorMes[inicioKey] = (ingresosPorMes[inicioKey] || 0) + pagado;
            }
            if (inicioKey === mesActualKey) ingresosMesActual += pagado;

            // Por cobrar: saldos de estadías de hoy en adelante
            if (inicio >= hoyStr) {
                reservasFuturas++;
                const saldo = total - pagado;
                if (saldo > 0) porCobrar += saldo;
            }

            // Canales (últimos 12 meses por fecha de estadía)
            if (meses.some((mm) => mm.key === inicioKey)) {
                const canal = normalizaCanal(r.fuente);
                if (!canales[canal]) canales[canal] = { reservas: 0, ingresos: 0 };
                canales[canal].reservas++;
                canales[canal].ingresos += pagado;
            }

            // Noches por mes (recortadas)
            const start = new Date(inicio + "T12:00:00Z");
            const end = new Date(String(r.fecha_fin) + "T12:00:00Z");
            const d = new Date(start);
            while (d < end) {
                const k = mesKey(d.getUTCFullYear(), d.getUTCMonth());
                nochesPorMes[k] = (nochesPorMes[k] || 0) + 1;
                d.setUTCDate(d.getUTCDate() + 1);
            }
        }

        const serie12m = meses.map((mm) => {
            const disponibles = nDomos * diasDelMes(mm.anio, mm.mes);
            const noches = nochesPorMes[mm.key] || 0;
            return {
                name: mm.label,
                ingresos: ingresosPorMes[mm.key] || 0,
                noches,
                ocupacion: Math.round((noches / disponibles) * 100),
            };
        });

        const nochesMesActual = nochesPorMes[mesActualKey] || 0;
        const ocupacionMesActual = Math.round((nochesMesActual / (nDomos * diasDelMes(y, m))) * 100);

        const canalesArr = Object.entries(canales)
            .map(([canal, v]) => ({ canal, ...v }))
            .sort((a, b) => b.ingresos - a.ingresos);

        // Campañas: atribución UTM de reservas web (últimos 12 meses)
        const campMap: Record<string, { fuente: string; campania: string; medio: string; reservas: number; ingresos: number }> = {};
        let webTotal = 0;
        let webConUtm = 0;
        for (const r of rows) {
            const esWeb = (r.fuente || "").toLowerCase().includes("web");
            if (!esWeb) continue;
            const inicioKey = String(r.fecha_inicio).slice(0, 7);
            if (!meses.some((mm) => mm.key === inicioKey)) continue;
            webTotal++;
            const src = (r.utm_source || "").trim();
            if (!src) continue;
            webConUtm++;
            const key = `${src}|${r.utm_campaign || ""}`;
            if (!campMap[key]) {
                campMap[key] = {
                    fuente: src,
                    campania: (r.utm_campaign || "").trim() || "—",
                    medio: (r.utm_medium || "").trim() || "—",
                    reservas: 0,
                    ingresos: 0,
                };
            }
            campMap[key].reservas++;
            campMap[key].ingresos += Number(r.monto_pagado) || 0;
        }
        const campanias = Object.values(campMap).sort((a, b) => b.ingresos - a.ingresos);

        return NextResponse.json({
            kpis: {
                ingresosMesActual,
                porCobrar,
                ocupacionMesActual,
                nochesMesActual,
                reservasFuturas,
            },
            serie12m,
            canales: canalesArr,
            campanias,
            atribucionWeb: { total: webTotal, conUtm: webConUtm },
            domosConsiderados: nDomos,
        });
    } catch (e: any) {
        console.error("Error en estadísticas:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
