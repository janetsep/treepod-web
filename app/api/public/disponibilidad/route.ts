import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { addDays, eachDayOfInterval, format, parseISO, startOfDay } from "date-fns";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fromStr = searchParams.get("from");
        const toStr = searchParams.get("to");

        if (!fromStr || !toStr) {
            return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 });
        }

        const fromDate = parseISO(fromStr);
        const toDate = parseISO(toStr);

        // 1. Obtener total de domos activos
        const { data: domos, error: domosErr } = await supabaseAdmin
            .from("domos")
            .select("id")
            .eq("activo", true);

        if (domosErr) throw domosErr;
        const totalDomos = domos.length;

        // 2. Obtener reservas en el rango
        // Filtramos estados que bloquean realmente: pagado, confirmado.
        // Los pendientes solo si tienen email (intención real), similar a crear_reserva logic.
        const { data: reservas, error: resErr } = await supabaseAdmin
            .from("reservas")
            .select("fecha_inicio, fecha_fin, domo_id, estado, email")
            .in("estado", ["pagado", "confirmado", "pendiente", "pendiente_pago"])
            .is("deleted_at", null)
            .not("domo_id", "is", null)
            .lt("fecha_inicio", toStr)
            .gt("fecha_fin", fromStr);

        if (resErr) throw resErr;

        // 3. Obtener bloqueos manuales
        const { data: bloqueos, error: bloqErr } = await supabaseAdmin
            .from("bloqueos_calendario")
            .select("fecha_inicio, fecha_fin, domo_id")
            .lt("fecha_inicio", toStr)
            .gt("fecha_fin", fromStr);

        if (bloqErr) throw bloqErr;

        // 4. Calcular ocupación por día
        const blockedDates: string[] = [];
        const days = eachDayOfInterval({ start: fromDate, end: toDate });

        // Filtrar reservas válidas
        const validReservations = (reservas || []).filter((r: any) => {
            if (['pagado', 'confirmado', 'pendiente'].includes(r.estado)) return true;
            if (r.estado === 'pendiente_pago' && r.email) return true;
            return false;
        });

        const allBlocks = [...validReservations, ...(bloqueos || [])];

        days.forEach(day => {
            const dayStr = format(day, "yyyy-MM-dd");

            // Contar cuántos domos están ocupados este día
            // Un día está ocupado si cae en [fecha_inicio, fecha_fin) -> NO incluye fecha_fin (checkout)
            // Así que logicamente: fecha_inicio <= day < fecha_fin

            const occupiedCount = new Set();

            allBlocks.forEach((block: any) => {
                const start = block.fecha_inicio; // string YYYY-MM-DD
                const end = block.fecha_fin;     // string YYYY-MM-DD

                if (dayStr >= start && dayStr < end) {
                    occupiedCount.add(block.domo_id);
                }
            });

            if (occupiedCount.size >= totalDomos) {
                blockedDates.push(dayStr);
            }
        });

        return NextResponse.json({ blockedDates });

    } catch (error: any) {
        console.error("Error fetching availability:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
