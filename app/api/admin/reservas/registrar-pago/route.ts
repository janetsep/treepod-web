import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { NotificationService } from "@/services/NotificationService";

/**
 * Registra un pago parcial o total (típicamente el saldo del 50% al check-in).
 * - Suma el monto a monto_pagado (nunca más allá del total).
 * - Si queda pagado completo y la reserva estaba pendiente, pasa a 'pagado'.
 * - Deja el movimiento en finanzas_movimientos (caja) y en el log de admin.
 * - Actualiza el evento de Google Calendar (saldo al día).
 */
export async function POST(request: Request) {
    try {
        const admin = await getVerifiedAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
        }
        if (admin.rol === "viewer") {
            return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });
        }

        const { reservaId, monto, metodo } = await request.json();
        const montoNum = Math.round(Number(monto));
        const metodosValidos = ["efectivo", "transferencia", "webpay", "otro"];

        if (!reservaId || !montoNum || montoNum <= 0) {
            return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
        }
        if (!metodosValidos.includes(metodo)) {
            return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
        }

        const { data: r, error: readErr } = await supabaseAdmin
            .from("reservas")
            .select("id, nombre, apellido, email, telefono, fecha_inicio, fecha_fin, adultos, total, monto_pagado, estado, fuente, domo_id, metodo_pago, domos(nombre)")
            .eq("id", reservaId)
            .is("deleted_at", null)
            .single();

        if (readErr || !r) {
            return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
        }
        if (["cancelada", "expirada", "rechazado", "bloqueado"].includes(r.estado)) {
            return NextResponse.json({ error: `No se puede registrar un pago en una reserva ${r.estado}.` }, { status: 400 });
        }

        const total = Number(r.total) || 0;
        const pagadoActual = Number(r.monto_pagado) || 0;
        const saldo = total - pagadoActual;

        if (saldo <= 0) {
            return NextResponse.json({ error: "Esta reserva ya está pagada por completo." }, { status: 400 });
        }
        if (montoNum > saldo) {
            return NextResponse.json({ error: `El monto supera el saldo pendiente ($${saldo.toLocaleString("es-CL")}). Si el total cambió, edita primero la reserva.` }, { status: 400 });
        }

        const nuevoPagado = pagadoActual + montoNum;
        const quedaPagadoCompleto = nuevoPagado >= total;

        const { error: updErr } = await supabaseAdmin
            .from("reservas")
            .update({
                monto_pagado: nuevoPagado,
                // Si quedó saldada y venía de un estado intermedio, queda 'pagado'
                ...(quedaPagadoCompleto && ["pendiente", "pending_transfer_confirmation", "pendiente_pago", "confirmado"].includes(r.estado)
                    ? { estado: "pagado" }
                    : {}),
                // Registra el medio de pago en la reserva si aún no tenía uno (necesario para
                // saber a quién emitir boleta/factura). No sobrescribe un método ya registrado.
                ...((!r.metodo_pago || String(r.metodo_pago).trim() === "") ? { metodo_pago: metodo } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq("id", reservaId);

        if (updErr) {
            return NextResponse.json({ error: updErr.message }, { status: 500 });
        }

        const guestName = `${r.nombre || ""} ${r.apellido || ""}`.trim() || "Huésped";

        // Movimiento de caja (no bloquea la operación si falla; queda en logs)
        const { error: finErr } = await supabaseAdmin.from("finanzas_movimientos").insert({
            tipo: "ingreso",
            categoria: "reservas",
            monto: montoNum,
            reserva_id: r.id,
            domo_id: r.domo_id,
            metodo_pago: metodo,
            descripcion: `Pago de saldo registrado por ${admin.nombre} — ${guestName} (${r.fecha_inicio} → ${r.fecha_fin})`,
            tributario: true,
            dte_emitido: false,
            revisado_contabilidad: false,
            clasificacion_tributaria: "ingreso_boleteado",
            fecha_movimiento: new Date().toISOString(),
        });
        if (finErr) console.error("⚠️ Pago registrado pero falló el movimiento de caja:", finErr.message);

        await supabaseAdmin.from("admin_access_logs").insert({
            email: admin.email,
            action: "payment_registered",
            details: `${admin.nombre} registró pago de $${montoNum.toLocaleString("es-CL")} (${metodo}) en la reserva de ${guestName}. Pagado: $${nuevoPagado.toLocaleString("es-CL")} / $${total.toLocaleString("es-CL")}.`,
        });

        // Refrescar el evento del calendario con el saldo al día (no bloqueante)
        NotificationService.syncReservaToCalendar({
            id: r.id,
            nombre: r.nombre,
            apellido: r.apellido,
            email: r.email,
            telefono: r.telefono,
            fecha_inicio: r.fecha_inicio,
            fecha_fin: r.fecha_fin,
            adultos: r.adultos,
            total,
            monto_pagado: nuevoPagado,
            estado: quedaPagadoCompleto ? "pagado" : r.estado,
            fuente: r.fuente,
            domoNombre: (r as any).domos?.nombre || null,
        }).catch((e) => console.error("Error actualizando calendario tras pago:", e));

        return NextResponse.json({
            ok: true,
            monto_pagado: nuevoPagado,
            saldo: total - nuevoPagado,
            estado: quedaPagadoCompleto ? "pagado" : r.estado,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
