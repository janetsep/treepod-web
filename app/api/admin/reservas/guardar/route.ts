import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";
import { getVerifiedAdmin } from "@/lib/admin-auth";

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
        const adminData = { rol: admin.rol, nombre: admin.nombre };
        const adminEmail = admin.email;

        const body = await request.json();
        const { id, fecha_inicio, fecha_fin, domo_id, nombre, apellido, email, telefono, adultos, total, monto_pagado, estado, fuente, mensaje, comprobante_url, servicios_seleccionados, servicios_cortesia, noches_por_servicio, enviar_confirmacion, acompanantes, tipo_documento, sincronizar_calendario } = body;
        const nochesPorServicio: Record<string, number> = noches_por_servicio || {};
        const cortesiaSet = new Set<string>(Array.isArray(servicios_cortesia) ? servicios_cortesia : []);

        // Validación básica
        if (!fecha_inicio || !fecha_fin || !domo_id) {
            return NextResponse.json({ error: "Faltan datos obligatorios (Fechas, Domo)" }, { status: 400 });
        }

        const reservaData = {
            fecha_inicio,
            fecha_fin,
            domo_id,
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
            sincronizar_calendario: sincronizar_calendario ?? true,
        };

        let result;
        const isUpdate = !!id;
        let changeDetails = "";

        if (isUpdate) {
            // Obtener datos actuales para comparar
            const { data: oldReserva } = await supabaseAdmin
                .from("reservas")
                .select("*")
                .eq("id", id)
                .single();

            if (oldReserva) {
                const changes = [];
                if (oldReserva.fecha_inicio !== fecha_inicio) changes.push(`fecha inicio: ${oldReserva.fecha_inicio} -> ${fecha_inicio}`);
                if (oldReserva.fecha_fin !== fecha_fin) changes.push(`fecha fin: ${oldReserva.fecha_fin} -> ${fecha_fin}`);
                if (oldReserva.estado !== (estado || 'pendiente')) changes.push(`estado: ${oldReserva.estado} -> ${estado}`);
                if (Number(oldReserva.total) !== Number(total)) changes.push(`total: $${oldReserva.total} -> $${total}`);
                if (Number(oldReserva.monto_pagado) !== Number(monto_pagado)) changes.push(`pagado: $${oldReserva.monto_pagado} -> $${monto_pagado}`);
                if (oldReserva.nombre !== nombre || oldReserva.apellido !== apellido) changes.push(`nombre: ${oldReserva.nombre} ${oldReserva.apellido} -> ${nombre} ${apellido}`);
                
                changeDetails = changes.length > 0 ? `. Cambios: ${changes.join(', ')}` : ". No hubo cambios significativos en los campos principales.";
            }

            result = await supabaseAdmin
                .from("reservas")
                .update(reservaData)
                .eq("id", id)
                .select()
                .single();
        } else {
            result = await supabaseAdmin
                .from("reservas")
                .insert({
                    ...reservaData,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
        }

        if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        // Loggear la acción con detalle
        await supabaseAdmin.from('admin_access_logs').insert({
            email: adminEmail,
            action: isUpdate ? 'reservation_updated' : 'reservation_created',
            details: `El usuario ${adminData.nombre} (${adminData.rol}) ${isUpdate ? 'editó' : 'creó'} una reserva para ${nombre} ${apellido}. ID: ${id || result.data.id}${changeDetails}`
        });

        // Calcular noches y personas (necesario para multiplicadores de servicios)
        const noches = Math.round(
            (new Date(fecha_fin).getTime() - new Date(fecha_inicio).getTime()) / (1000 * 60 * 60 * 24)
        );
        const numAdultos = Number(adultos) || 2;

        // Insertar/actualizar servicios seleccionados en reserva_servicios
        const reservaId = id || result.data.id;
        let sumExtras = 0;
        if (Array.isArray(servicios_seleccionados) && servicios_seleccionados.length > 0) {
            if (isUpdate) {
                await supabaseAdmin.from("reserva_servicios").delete().eq("reserva_id", reservaId);
            }

            const { data: serviciosData } = await supabaseAdmin
                .from("servicios")
                .select("id, nombre, precio, multiplicador_noches, multiplicador_personas")
                .in("id", servicios_seleccionados);

            if (serviciosData && serviciosData.length > 0) {
                const registros = serviciosData.map((servicio) => {
                    const esCortesia = cortesiaSet.has(servicio.id);
                    const esCena = servicio.nombre.toLowerCase().includes("cena") || servicio.nombre.toLowerCase().includes("romántico") || servicio.nombre.toLowerCase().includes("almuerzo");
                    // Para cena: usar noches elegidas por el admin; para otros: todas las noches
                    const nochesEste = (esCena && nochesPorServicio[servicio.id])
                        ? nochesPorServicio[servicio.id]
                        : noches;
                    // Calcular cantidad real según multiplicadores del servicio
                    let cantidad = 1;
                    if (servicio.multiplicador_noches) cantidad *= nochesEste;
                    if (servicio.multiplicador_personas) cantidad *= numAdultos;
                    const precioUnitario = esCortesia ? 0 : (servicio.precio || 0);
                    const subtotal = esCortesia ? 0 : precioUnitario * cantidad;
                    if (!esCortesia) sumExtras += subtotal;
                    return {
                        reserva_id: reservaId,
                        servicio_id: servicio.id,
                        cantidad,
                        precio_unitario: precioUnitario,
                        total: subtotal,
                        es_cortesia: esCortesia,
                    };
                });
                await supabaseAdmin.from("reserva_servicios").insert(registros);
            }
        } else if (isUpdate) {
            if (Array.isArray(servicios_seleccionados)) {
                await supabaseAdmin.from("reserva_servicios").delete().eq("reserva_id", reservaId);
            }
        }

        // Guardar precio_noche histórico (precio al momento de la venta, no el actual del catálogo)
        const precioNocheCalc = noches > 0 ? Math.round((Number(total || 0) - sumExtras) / noches) : 0;
        if (precioNocheCalc > 0) {
            await supabaseAdmin.from("reservas").update({ precio_noche: precioNocheCalc }).eq("id", reservaId);
        }

        // Registrar cobros en reserva_cobros (inmutables — solo al crear, no al editar)
        if (!isUpdate) {
            const cobros: any[] = [];
            if (precioNocheCalc > 0 && noches > 0) {
                cobros.push({
                    reserva_id: reservaId,
                    tipo: 'hospedaje',
                    concepto: 'Hospedaje',
                    cantidad: noches,
                    precio_unitario: precioNocheCalc,
                    total: precioNocheCalc * noches,
                    es_cortesia: false,
                });
            }
            // Leer servicios que se acaban de insertar para agregarlos con sus totales reales
            const { data: cobrosExtras } = await supabaseAdmin
                .from("reserva_servicios")
                .select("cantidad, precio_unitario, total, es_cortesia, servicios(nombre)")
                .eq("reserva_id", reservaId);
            for (const e of (cobrosExtras || [])) {
                cobros.push({
                    reserva_id: reservaId,
                    tipo: 'extra',
                    concepto: (e as any).servicios?.nombre || 'Extra',
                    cantidad: e.cantidad || 1,
                    precio_unitario: e.precio_unitario || 0,
                    total: e.total || 0,
                    es_cortesia: e.es_cortesia || false,
                });
            }
            if (cobros.length > 0) {
                await supabaseAdmin.from("reserva_cobros").insert(cobros);
            }
        }

        const { data: domoData } = await supabaseAdmin
            .from("domos")
            .select("nombre")
            .eq("id", domo_id)
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

        // Opcional: Crear/Actualizar Cliente en CRM
        if (email) {
            const { data: client } = await supabaseAdmin.from("clientes").upsert({
                email, 
                nombre, 
                apellido, 
                telefono, 
                updated_at: new Date().toISOString()
            }, { onConflict: "email" }).select("id").single();

            if (client?.id) {
                await supabaseAdmin.from("reservas").update({ cliente_id: client.id }).eq("id", id || result.data.id);
            }
        }

        return NextResponse.json({ ok: true, data: result.data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
