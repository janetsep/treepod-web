import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, fecha_inicio, fecha_fin, domo_id, nombre, apellido, email, telefono, adultos, total, monto_pagado, estado, fuente, mensaje, comprobante_url, adminEmail } = body;
        
        // Validación básica
        if (!fecha_inicio || !fecha_fin || !domo_id) {
            return NextResponse.json({ error: "Faltan datos obligatorios (Fechas, Domo)" }, { status: 400 });
        }

        // 1. Verificar administrador
        if (!adminEmail) {
            return NextResponse.json({ error: "Identificación de administrador requerida para registrar cambios" }, { status: 401 });
        }

        const { data: adminData } = await supabaseAdmin
            .from("authorized_admins")
            .select("rol, nombre")
            .eq("email", adminEmail)
            .single();

        if (!adminData) {
            return NextResponse.json({ error: "Usuario no autorizado para realizar cambios" }, { status: 403 });
        }

        // Bloqueo estricto para perfiles de solo lectura (viewer)
        if (adminData.rol === 'viewer') {
            return NextResponse.json({ error: "No tienes permisos para guardar o editar registros. Tu perfil es de solo lectura." }, { status: 403 });
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

        // Opcional: Crear/Actualizar Cliente en CRM
        if (email) {
            await supabaseAdmin.from("clientes").upsert({
                email, nombre, apellido, telefono, updated_at: new Date().toISOString()
            }, { onConflict: "email" });
        }

        return NextResponse.json({ ok: true, data: result.data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
