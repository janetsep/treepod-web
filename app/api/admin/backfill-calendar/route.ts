import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";

/**
 * Backfill puntual: agrega a Google Calendar las reservas PRÓXIMAS que ya existen
 * (web y Airbnb), para las que aún no había sincronización automática.
 *
 * Es idempotente: usa el id de evento determinístico de syncReservaToCalendar, así que
 * si se corre más de una vez, no crea duplicados.
 *
 * Se excluyen las reservas de fuente "manual_admin": esas ya tienen su propio mecanismo
 * de calendario (al crearlas/confirmarlas desde el panel) y se evitan duplicados.
 *
 * Disparo: ?manual=1 (igual que el sync de Airbnb) o cron con Bearer CRON_SECRET.
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isManual = request.nextUrl.searchParams.get("manual") === "1";

    if (cronSecret && !isManual && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const hoyStr = new Date().toISOString().slice(0, 10);

        const { data: reservasRaw, error } = await supabaseAdmin
            .from("reservas")
            .select("id, fecha_inicio, fecha_fin, nombre, apellido, telefono, email, adultos, total, monto_pagado, estado, fuente, domos(nombre)")
            .is("deleted_at", null)
            .gte("fecha_inicio", hoyStr)
            .in("estado", ["pagado", "confirmado", "pending_transfer_confirmation", "pendiente"])
            .neq("fuente", "manual_admin")
            .order("fecha_inicio", { ascending: true });

        if (error) throw error;

        const reservas = (reservasRaw || []).filter(
            (r: any) => !(r.estado === "pendiente_pago" && !r.email)
        );

        let sincronizadas = 0;
        let yaExistian = 0;
        let fallidas = 0;

        for (const r of reservas) {
            const res = await NotificationService.syncReservaToCalendar({
                id: r.id,
                nombre: r.nombre,
                apellido: r.apellido,
                email: r.email,
                telefono: r.telefono,
                fecha_inicio: r.fecha_inicio,
                fecha_fin: r.fecha_fin,
                adultos: r.adultos,
                total: r.total,
                monto_pagado: r.monto_pagado,
                estado: r.estado,
                fuente: r.fuente,
                domoNombre: (r as any).domos?.nombre || null,
            });
            if ((res as any)?.duplicate) yaExistian++;
            else if ((res as any)?.success) sincronizadas++;
            else fallidas++;
        }

        return NextResponse.json({
            ok: true,
            total_procesadas: reservas.length,
            nuevas_en_calendario: sincronizadas,
            ya_existian: yaExistian,
            fallidas,
        });
    } catch (e: any) {
        console.error("Error en backfill de calendario:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
