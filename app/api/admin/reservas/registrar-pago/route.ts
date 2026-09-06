import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { NotificationService } from "@/services/NotificationService";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
    try {
        const admin = await getVerifiedAdmin(request);
        if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        if (admin.rol === "viewer") return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });
        const { reservaId, monto, metodo, operacionId } = await request.json();
        if (!uuid.test(String(reservaId)) || !uuid.test(String(operacionId))) {
            return NextResponse.json({ error: "Recarga el panel antes de registrar el pago." }, { status: 400 });
        }
        const montoNum = Number(monto);
        if (!Number.isSafeInteger(montoNum) || montoNum <= 0 || !["efectivo", "transferencia", "webpay", "otro"].includes(metodo)) {
            return NextResponse.json({ error: "Monto o método de pago inválido" }, { status: 400 });
        }
        // Balance, ledger and audit either all commit or all roll back.
        const { data, error } = await supabaseAdmin.rpc("registrar_pago_admin_atomico", {
            p_operacion: operacionId, p_reserva: reservaId, p_monto: montoNum, p_metodo: metodo, p_admin: admin.email,
        });
        if (error) {
            const known: Record<string, string> = {
                PAYMENT_BALANCE: "El monto supera el saldo disponible. Actualiza la reserva y revisa sus pagos.",
                PAYMENT_STATE: "El estado de la reserva no permite registrar pagos.",
                PAYMENT_NOT_FOUND: "Reserva no encontrada.",
                PAYMENT_KEY_CONFLICT: "Esta operación ya fue utilizada con otros datos. Revisa el pago antes de continuar.",
                PAYMENT_FORBIDDEN: "No tienes permiso para registrar pagos.",
                PAYMENT_INVALID: "Datos de pago inválidos.",
            };
            const message = known[error.message];
            if (!message) console.error("Pago manual no persistido", error.code);
            return NextResponse.json({ error: message || "No se pudo guardar el pago completo. Puedes reintentar la misma operación." }, { status: message ? 409 : 500 });
        }
        if (!data.repetido) {
            const { data: r } = await supabaseAdmin.from("reservas")
                .select("id,nombre,apellido,email,telefono,fecha_inicio,fecha_fin,adultos,total,monto_pagado,estado,fuente,domos(nombre)")
                .eq("id", reservaId).single();
            if (r) await NotificationService.syncReservaToCalendar({ ...r, domoNombre: (r as any).domos?.nombre || null })
                .catch(() => console.error("Pago guardado; calendario pendiente de actualizar"));
        }
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "No se pudo completar la solicitud. Reintenta la misma operación antes de crear otro pago." }, { status: 500 });
    }
}
