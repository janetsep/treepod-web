import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { estadoAlConfirmar } from "@/lib/admin-confirmacion";
import { NotificationService } from "@/services/NotificationService";

export async function POST(request: Request) {
    try {
        // Identidad verificada por token de sesión (no por el body)
        const admin = await getVerifiedAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
        }
        if (admin.rol === 'viewer') {
            return NextResponse.json({ error: "No tienes permisos para confirmar pagos" }, { status: 403 });
        }

        const { reservaId } = await request.json();
        if (!reservaId) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        // Solo se pueden confirmar reservas reales: nunca bloqueos técnicos ni canceladas.
        const { data: reservaActual } = await supabaseAdmin
            .from("reservas")
            .select("estado,total,monto_pagado")
            .eq("id", reservaId)
            .is("deleted_at", null)
            .single();

        if (!reservaActual) {
            return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
        }
        if (reservaActual.estado === 'bloqueado') {
            return NextResponse.json({ error: "Esto es un bloqueo técnico, no una reserva: no se puede confirmar como pagado." }, { status: 400 });
        }
        if (['cancelada', 'expirada', 'rechazado'].includes(reservaActual.estado)) {
            return NextResponse.json({ error: `La reserva está ${reservaActual.estado}: restáurala o edítala antes de confirmar un pago.` }, { status: 400 });
        }

        const estado = estadoAlConfirmar(reservaActual.total, reservaActual.monto_pagado);
        let update = supabaseAdmin
            .from("reservas")
            .update({
                estado,
                updated_at: new Date().toISOString(),
                metodo_pago_inicial: "manual_admin" // Marcamos que fue admin
            })
            .eq("id", reservaId)
            .is("deleted_at", null);
        for (const campo of ["estado", "monto_pagado", "total"] as const) {
            const valor = reservaActual[campo];
            update = valor == null ? update.is(campo, null) : update.eq(campo, valor);
        }
        const { data: actualizada, error: updateError } = await update.select("id").maybeSingle();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        if (!actualizada) {
            return NextResponse.json({ error: "La reserva cambió. Actualiza el panel antes de confirmar." }, { status: 409 });
        }

        // Sincronizar con Google Calendar (idempotente, no bloqueante): cubre el caso
        // de transferencias confirmadas, que antes nunca llegaban al calendario.
        try {
            const { data: r } = await supabaseAdmin
                .from("reservas")
                .select("id, nombre, apellido, email, telefono, fecha_inicio, fecha_fin, adultos, total, monto_pagado, fuente, domos(nombre)")
                .eq("id", reservaId)
                .single();
            if (r) {
                NotificationService.syncReservaToCalendar({
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
                    estado,
                    fuente: r.fuente,
                    domoNombre: (r as any).domos?.nombre || null,
                }).catch((e) => console.error("Error sincronizando calendario al confirmar:", e));
            }
        } catch (e) {
            console.error("No se pudo preparar sync de calendario al confirmar:", e);
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
