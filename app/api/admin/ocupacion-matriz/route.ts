import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Matriz de OCUPACIÓN por mes y año (%):
 *   noches vendidas (recortadas al mes) ÷ noches disponibles (domos activos × días del mes)
 *
 * Cuentan como vendidas las noches de reservas firmes: pagado, confirmado, pendiente,
 * pending_transfer_confirmation. Los bloqueos técnicos no suman ni restan (v1).
 */
export async function GET() {
    try {
        const { count: domosActivos } = await supabaseAdmin
            .from("domos")
            .select("*", { count: "exact", head: true })
            .eq("activo", true);
        const nDomos = domosActivos || 4;

        // Traer todas las reservas firmes (paginado para no toparse con el límite de 1000)
        const rows: { fecha_inicio: string; fecha_fin: string }[] = [];
        const PAGE = 1000;
        for (let from = 0; ; from += PAGE) {
            const { data, error } = await supabaseAdmin
                .from("reservas")
                .select("fecha_inicio, fecha_fin")
                .in("estado", ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation"])
                .is("deleted_at", null)
                .not("fecha_inicio", "is", null)
                .not("fecha_fin", "is", null)
                .range(from, from + PAGE - 1);
            if (error) throw error;
            rows.push(...(data || []));
            if (!data || data.length < PAGE) break;
        }

        // Acumular noches vendidas por (año, mes), recortando estadías que cruzan meses
        const vendidas: Record<string, number> = {}; // "YYYY-M" -> noches
        const yearsSet = new Set<number>();

        for (const r of rows) {
            const start = new Date(r.fecha_inicio + "T12:00:00Z");
            const end = new Date(r.fecha_fin + "T12:00:00Z"); // checkout (exclusivo)
            if (!(start < end)) continue;
            // Iterar noche por noche (estadías cortas; volumen total manejable)
            const d = new Date(start);
            while (d < end) {
                const y = d.getUTCFullYear();
                const m = d.getUTCMonth() + 1;
                const key = `${y}-${m}`;
                vendidas[key] = (vendidas[key] || 0) + 1;
                yearsSet.add(y);
                d.setUTCDate(d.getUTCDate() + 1);
            }
        }

        const years = Array.from(yearsSet).sort((a, b) => a - b);
        const diasDelMes = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

        // matriz[mes-1].valores[i] = % de ocupación del mes para years[i] (null = sin datos)
        const matriz = Array.from({ length: 12 }, (_, i) => ({
            mes: i + 1,
            valores: years.map((y) => {
                const noches = vendidas[`${y}-${i + 1}`] || 0;
                if (noches === 0) return null;
                const disponibles = nDomos * diasDelMes(y, i + 1);
                return Math.round((noches / disponibles) * 100);
            }),
        }));

        // Promedio anual simple sobre los meses con datos
        const promedioPorAnio = years.map((_, idx) => {
            const conDatos = matriz.map((m) => m.valores[idx]).filter((v): v is number => v !== null);
            if (conDatos.length === 0) return null;
            return Math.round(conDatos.reduce((a, b) => a + b, 0) / conDatos.length);
        });

        return NextResponse.json({ years, matriz, promedioPorAnio, domosConsiderados: nDomos });
    } catch (e: any) {
        console.error("Error en ocupacion-matriz:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
