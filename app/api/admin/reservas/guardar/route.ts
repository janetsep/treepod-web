import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { vincularClienteAReserva } from "@/lib/crm-cliente";

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
        const { id, fecha_inicio, fecha_fin, domo_id, nombre, apellido, email, telefono, rut, adultos, total, monto_pagado, estado, fuente, mensaje, comprobante_url, servicios_seleccionados, servicios_cortesia, noches_por_servicio, precios_por_servicio, enviar_confirmacion, acompanantes, tipo_documento, metodo_pago, folio_dte, sincronizar_calendario } = body;
        const folioTrim = (folio_dte ?? "").toString().trim();
        const nochesPorServicio: Record<string, number> = noches_por_servicio || {};
        const preciosPorServicio: Record<string, number> = precios_por_servicio || {};
        const cortesiaSet = new Set<string>(Array.isArray(servicios_cortesia) ? servicios_cortesia : []);

        // Validación básica
        if (!fecha_inicio || !fecha_fin) {
            return NextResponse.json({ error: "Faltan datos obligatorios (Fechas)" }, { status: 400 });
        }

        // Asignación automática de domo cuando el administrador no elige uno.
        // Prioridad de negocio: Domo 4 → Domo 3 → Domo 1 → Domo 2. Un domo ya
        // reservado en fechas que se traslapan no se considera disponible.
        let domoAsignado = domo_id || null;
        let domoFueAutomatico = false;
        if (!domoAsignado) {
            const PRIORIDAD = ["Domo 4", "Domo 3", "Domo 1", "Domo 2"];
            const { data: domos } = await supabaseAdmin
                .from("domos").select("id, nombre").eq("activo", true);
            const { data: ocupadas } = await supabaseAdmin
                .from("reservas")
                .select("id, domo_id")
                .is("deleted_at", null)
                .not("domo_id", "is", null)
                .not("estado", "in", "(cancelada,cancelado,expirada)")
                .lt("fecha_inicio", fecha_fin)
                .gt("fecha_fin", fecha_inicio);
            const ocupados = new Set(
                (ocupadas || []).filter(r => r.id !== id).map(r => r.domo_id)
            );
            for (const nombreDomo of PRIORIDAD) {
                const d = (domos || []).find(x => x.nombre === nombreDomo);
                if (d && !ocupados.has(d.id)) { domoAsignado = d.id; break; }
            }
            if (!domoAsignado) {
                return NextResponse.json({ error: "No hay domos disponibles para esas fechas. Elige el domo manualmente o cambia las fechas." }, { status: 409 });
            }
            domoFueAutomatico = true;
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
                const CAMPOS_AUDITADOS: Array<{ campo: string; label: string; viejo: () => string; nuevo: () => string; diferente: boolean }> = [
                    { campo: "fecha_inicio",  label: "Fecha entrada",   viejo: () => oldReserva.fecha_inicio,                          nuevo: () => fecha_inicio,                             diferente: oldReserva.fecha_inicio !== fecha_inicio },
                    { campo: "fecha_fin",     label: "Fecha salida",    viejo: () => oldReserva.fecha_fin,                             nuevo: () => fecha_fin,                                diferente: oldReserva.fecha_fin !== fecha_fin },
                    { campo: "adultos",       label: "Personas",        viejo: () => String(oldReserva.adultos),                       nuevo: () => String(adultos),                          diferente: Number(oldReserva.adultos) !== Number(adultos) },
                    { campo: "total",         label: "Total",           viejo: () => `$${oldReserva.total}`,                           nuevo: () => `$${total}`,                              diferente: Number(oldReserva.total) !== Number(total) },
                    { campo: "monto_pagado",  label: "Monto pagado",    viejo: () => `$${oldReserva.monto_pagado}`,                    nuevo: () => `$${monto_pagado}`,                       diferente: Number(oldReserva.monto_pagado) !== Number(monto_pagado) },
                    { campo: "estado",        label: "Estado",          viejo: () => oldReserva.estado,                                nuevo: () => estado || 'pendiente',                    diferente: oldReserva.estado !== (estado || 'pendiente') },
                    { campo: "domo_id",       label: "Domo",            viejo: () => oldReserva.domo_id,                               nuevo: () => domoAsignado,                             diferente: oldReserva.domo_id !== domoAsignado },
                    { campo: "nombre",        label: "Nombre",          viejo: () => `${oldReserva.nombre} ${oldReserva.apellido}`,    nuevo: () => `${nombre} ${apellido}`,                  diferente: oldReserva.nombre !== nombre || oldReserva.apellido !== apellido },
                ];

                const snapshot = { ...oldReserva };
                const logsInsert = CAMPOS_AUDITADOS
                    .filter(c => c.diferente)
                    .map(c => ({
                        reserva_id: id,
                        campo: c.campo,
                        valor_anterior: c.viejo(),
                        valor_nuevo: c.nuevo(),
                        admin_email: adminEmail,
                        snapshot,
                    }));

                if (logsInsert.length > 0) {
                    await supabaseAdmin.from("reserva_cambios").insert(logsInsert);
                }

                const changes = logsInsert.map(l => `${l.campo}: ${l.valor_anterior} → ${l.valor_nuevo}`);
                changeDetails = changes.length > 0 ? `. Cambios: ${changes.join(', ')}` : ". Sin cambios en campos principales.";
            }

            // Folio DTE: se guarda fusionando con el metadata existente (sin pisar otras claves).
            const baseMeta = (oldReserva?.metadata && typeof oldReserva.metadata === "object") ? oldReserva.metadata : {};
            const nuevaMeta: Record<string, any> = { ...baseMeta };
            if (folioTrim) {
                nuevaMeta.folio_dte = folioTrim;
                if (!nuevaMeta.fecha_dte) nuevaMeta.fecha_dte = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
            } else {
                delete nuevaMeta.folio_dte;
            }

            result = await supabaseAdmin
                .from("reservas")
                .update({ ...reservaData, metadata: nuevaMeta })
                .eq("id", id)
                .select()
                .single();
        } else {
            result = await supabaseAdmin
                .from("reservas")
                .insert({
                    ...reservaData,
                    ...(folioTrim ? { metadata: { folio_dte: folioTrim, fecha_dte: new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" }) } } : {}),
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
                    // Usar precio override si fue ajustado en el form, si no el precio base del servicio
                    const precioUnitario = esCortesia ? 0 : (preciosPorServicio[servicio.id] ?? servicio.precio ?? 0);
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
        await vincularClienteAReserva(id || result.data.id, {
            nombre,
            apellido,
            email,
            telefono,
            rut,
            fuente: fuente || "manual_admin",
        });

        return NextResponse.json({ ok: true, data: result.data, domo_id: domoAsignado, domo_automatico: domoFueAutomatico, domo_nombre: domoData?.nombre || null });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
