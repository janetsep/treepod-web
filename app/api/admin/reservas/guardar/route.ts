import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { vincularClienteAReserva } from "@/lib/crm-cliente";
import { buildAdminExtras } from "@/lib/admin-extras";

export async function POST(request: Request) {
    try {
        // Identidad verificada por token de sesión (no por el body)
        const admin = await getVerifiedAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
        }
        if (admin.rol === 'viewer') {
            return NextResponse.json({ error: "No tienes permisos para guardar o editar registros. Tu perfil es de solo lectura." }, { status: 403 });
        }
        const adminEmail = admin.email;

        const body = await request.json();
        const { id, fecha_inicio, fecha_fin, domo_id, nombre, apellido, email, telefono, rut, adultos, total, monto_pagado, estado, fuente, mensaje, comprobante_url, servicios_seleccionados, servicios_cortesia, noches_por_servicio, precios_por_servicio, enviar_confirmacion, acompanantes, tipo_documento, metodo_pago, folio_dte, sincronizar_calendario } = body;
        const folioTrim = (folio_dte ?? "").toString().trim();
        const nochesPorServicio: Record<string, number> = noches_por_servicio || {};
        const preciosPorServicio: Record<string, number> = precios_por_servicio || {};
        const cortesiaSet = new Set<string>(Array.isArray(servicios_cortesia) ? servicios_cortesia : []);

        // Validación básica
        if (!fecha_inicio || !fecha_fin) {
            return NextResponse.json({ error: "Faltan datos obligatorios (Fechas)" }, { status: 400 });
        }

        // El domo lo elige SIEMPRE el administrador (decisión de Janet, 2026-07-14):
        // los domos 1 y 2 son a piso y el 3 y 4 elevados, así que la asignación no
        // puede ser automática mientras el huésped no pueda elegir el tipo.
        // En ediciones sin domo explícito se conserva el que la reserva ya tenía.
        let domoAsignado = domo_id || null;
        const domoFueAutomatico = false;
        if (!domoAsignado && id) {
            const { data: actual } = await supabaseAdmin
                .from("reservas").select("domo_id").eq("id", id).single();
            if (actual?.domo_id) domoAsignado = actual.domo_id;
        }
        if (!domoAsignado) {
            return NextResponse.json({ error: "Falta elegir el domo." }, { status: 400 });
        }

        const reservaData = {
            fecha_inicio,
            fecha_fin,
            domo_id: domoAsignado,
            nombre,
            apellido,
            email,
            telefono,
            adultos: adultos || 2,
            total: total ? Number(total) : 0,
            monto_pagado: monto_pagado ? Number(monto_pagado) : 0,
            estado: estado || 'pendiente',
            fuente: fuente || 'manual_admin',
            notas: mensaje || null,
            comprobante_url: comprobante_url || null,
            enviar_confirmacion: enviar_confirmacion ?? true,
            acompanantes: acompanantes || null,
            tipo_documento: tipo_documento || 'boleta',
            metodo_pago: metodo_pago || null,
            sincronizar_calendario: sincronizar_calendario ?? true,
        };

        const isUpdate = !!id;
        const operation = body.operacion_id;
        if (typeof operation !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(operation)) {
            return NextResponse.json({ error: "Recarga el panel para guardar con protección de reintentos." }, { status: 400 });
        }
        const noches = Math.round((Date.parse(fecha_fin) - Date.parse(fecha_inicio)) / 86400000);
        if (!Number.isInteger(noches) || noches <= 0) {
            return NextResponse.json({ error: "La salida debe ser posterior a la entrada." }, { status: 400 });
        }
        let registros = null;
        if (servicios_seleccionados !== undefined) {
            if (!Array.isArray(servicios_seleccionados)) return NextResponse.json({ error: "Selección de servicios inválida" }, { status: 400 });
            const { data: catalogo, error: catalogoError } = await supabaseAdmin.from("servicios")
                .select("id,nombre,precio,multiplicador_noches,multiplicador_personas")
                .in("id", servicios_seleccionados).order("id");
            if (catalogoError) return NextResponse.json({ error: "No se pudo comprobar el catálogo. No se guardó la reserva." }, { status: 503 });
            try {
                registros = buildAdminExtras(catalogo || [], servicios_seleccionados, cortesiaSet, nochesPorServicio, preciosPorServicio, noches, Number(adultos) || 2);
            } catch {
                return NextResponse.json({ error: "Revisa los servicios, cantidades y precios seleccionados." }, { status: 400 });
            }
        }
        const { data: guardado, error: saveError } = await supabaseAdmin.rpc("guardar_reserva_admin_atomica", {
            p_id: id || null, p_operacion: operation, p_data: { ...reservaData, folio_dte: folioTrim },
            p_extras: registros, p_expected: body.expected || null, p_admin: adminEmail,
        });
        if (saveError) {
            const messages: Record<string,string> = {
                SAVE_STALE: "La reserva cambió mientras la editabas. Cierra y vuelve a abrir para revisar los datos actuales; no se sobrescribió nada.",
                SAVE_KEY_CONFLICT: "Esta solicitud ya se guardó con otros datos. Cierra y vuelve a abrir la reserva antes de editarla.",
                SAVE_NOT_FOUND: "La reserva ya no está disponible para editar.",
                SAVE_INVALID: "Revisa las fechas, personas y montos. El pago no puede superar el total.",
                SAVE_EXTRAS_TOTAL: "El valor de los extras supera el total de la reserva.",
                SAVE_EXTRAS_INVALID: "Revisa las cantidades y precios de los extras.",
            };
            return NextResponse.json({ error: messages[saveError.message] || (saveError.code === "23P01" ? "El domo ya está ocupado en esas fechas." : "No se pudo guardar la reserva completa. Ningún cambio de esta solicitud fue aplicado.") }, { status: 409 });
        }
        const result = { data: guardado.reserva };
        const reservaId = result.data.id;
        if (guardado.repetido) return NextResponse.json({ ok: true, data: result.data, repetido: true, domo_id: result.data.domo_id });

        const { data: domoData } = await supabaseAdmin
            .from("domos")
            .select("nombre")
            .eq("id", domoAsignado)
            .single();

        // Obtener nombres de servicios para el correo/ICS/calendario
        let extrasNombres: string[] = [];
        if (Array.isArray(servicios_seleccionados) && servicios_seleccionados.length > 0) {
            const { data: extrasData } = await supabaseAdmin
                .from("servicios")
                .select("nombre")
                .in("id", servicios_seleccionados);
            extrasNombres = (extrasData || []).map((s: any) => s.nombre);
        }

        // Sincronizar SIEMPRE con Google Calendar (idempotente: crea o actualiza el
        // mismo evento). Aplica a creaciones y ediciones; no bloquea el guardado si falla.
        const estadoFinal = estado || 'pendiente';
        if (['pagado', 'confirmado', 'pendiente', 'pending_transfer_confirmation'].includes(estadoFinal)) {
            NotificationService.syncReservaToCalendar({
                id: reservaId,
                nombre,
                apellido,
                email,
                telefono,
                fecha_inicio,
                fecha_fin,
                adultos: adultos || 2,
                total: total ? Number(total) : 0,
                monto_pagado: monto_pagado ? Number(monto_pagado) : 0,
                estado: estadoFinal,
                fuente: fuente || 'manual_admin',
                domoNombre: domoData?.nombre || 'Domo',
                extras: extrasNombres,
            }).catch(err => console.error('Error sincronizando calendario:', err));
        }

        // Enviar notificación por email según configuración (solo al crear)
        if (!isUpdate && (enviar_confirmacion || sincronizar_calendario)) {
            await NotificationService.sendAdminManualReservationNotification({
                guestName: `${nombre} ${apellido}`.trim(),
                guestEmail: email || '',
                domoNombre: domoData?.nombre || 'Domo',
                fechaInicio: fecha_inicio,
                fechaFin: fecha_fin,
                adultos: adultos || 2,
                total: total ? Number(total) : 0,
                montoPagado: monto_pagado ? Number(monto_pagado) : 0,
                estado: estado || 'pendiente',
                fuente: fuente || 'manual_admin',
                reservaId: result.data.id,
                adminEmail: adminEmail,
                sendGuestEmail: enviar_confirmacion && !!email,
                sincronizarCalendario: sincronizar_calendario,
                extras: extrasNombres,
                acompanantes: acompanantes,
                tipoDocumento: tipo_documento,
            }).catch(err => console.error('Error enviando notificación:', err));
        }

        // CRM: toda reserva guardada queda vinculada a un cliente (con o sin email).
        let crmPendiente = false;
        const clienteId = await vincularClienteAReserva(id || result.data.id, {
            nombre,
            apellido,
            email,
            telefono,
            rut,
            fuente: fuente || "manual_admin",
        }).catch(() => { crmPendiente = true; console.error('Reserva guardada; vínculo CRM pendiente'); });
        if (!clienteId && (email || nombre)) crmPendiente = true;

        return NextResponse.json({ ok: true, data: result.data, crm_pendiente: crmPendiente, domo_id: domoAsignado, domo_automatico: domoFueAutomatico, domo_nombre: domoData?.nombre || null });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
