import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Verifica disponibilidad REAL para un rango de fechas concreto.
 *
 * A diferencia de /api/public/disponibilidad (que marca un día como bloqueado solo
 * si TODOS los domos están ocupados esa noche), este endpoint comprueba que exista
 * UN MISMO domo libre durante TODA la estadía. Replica exactamente la lógica de
 * /api/reservas/crear para que el calendario y el motor de reservas nunca difieran.
 *
 * Devuelve: { disponible: boolean, domosLibres: number, totalDomos: number }
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from"); // entrada YYYY-MM-DD
        const to = searchParams.get("to");     // salida (checkout) YYYY-MM-DD
        const adultos = Number(searchParams.get("adultos")) || 1;

        if (!from || !to) {
            return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 });
        }
        if (to <= from) {
            return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
        }

        // 1. Domos activos con capacidad suficiente
        const { data: domosComp, error: domosErr } = await supabaseAdmin
            .from("domos")
            .select("id")
            .eq("activo", true)
            .gte("capacidad", adultos);

        if (domosErr) throw domosErr;

        const totalDomos = domosComp?.length || 0;
        if (totalDomos === 0) {
            return NextResponse.json({ disponible: false, domosLibres: 0, totalDomos: 0 });
        }

        const domosPosibles = domosComp.map((d: any) => d.id);

        // 2. Reservas que se solapan con el rango [from, to)
        //    Estados que bloquean (incluye pending_transfer_confirmation: transferencia por confirmar).
        const { data: rawConflicts, error: resErr } = await supabaseAdmin
            .from("reservas")
            .select("domo_id, estado, email")
            .in("domo_id", domosPosibles)
            .in("estado", ["pagado", "confirmado", "pendiente", "pendiente_pago", "pending_transfer_confirmation"])
            .is("deleted_at", null)
            .lt("fecha_inicio", to)
            .gt("fecha_fin", from);

        if (resErr) throw resErr;

        // Filtro en memoria (idéntico a crear): los pendientes_pago solo bloquean si hay intención real (email).
        const ocupadosRes = (rawConflicts || []).filter((r: any) => {
            if (["pagado", "confirmado", "pendiente", "pending_transfer_confirmation"].includes(r.estado)) return true;
            if (r.estado === "pendiente_pago") return !!r.email;
            return false;
        });

        // 3. Bloqueos manuales que se solapan
        const { data: ocupadosBloq, error: bloqErr } = await supabaseAdmin
            .from("bloqueos_calendario")
            .select("domo_id")
            .in("domo_id", domosPosibles)
            .lt("fecha_inicio", to)
            .gt("fecha_fin", from);

        if (bloqErr) throw bloqErr;

        const idOcupados = new Set<string>([
            ...ocupadosRes.map((r: any) => r.domo_id),
            ...(ocupadosBloq || []).map((b: any) => b.domo_id),
        ]);

        const domosLibres = domosPosibles.filter((id: string) => !idOcupados.has(id)).length;

        return NextResponse.json({
            disponible: domosLibres > 0,
            domosLibres,
            totalDomos,
        });
    } catch (error: any) {
        console.error("Error verificando disponibilidad de rango:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
