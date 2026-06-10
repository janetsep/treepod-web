import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET() {
    try {
        const { data: temporadas, error: tError } = await supabaseAdmin
            .from("temporadas")
            .select("*")
            .eq("activa", true)
            .order("prioridad", { ascending: false });

        if (tError) throw tError;

        const { data: tarifas, error: rError } = await supabaseAdmin
            .from("tarifas")
            .select("*")
            .order("adultos", { ascending: true })
            .order("noches_min", { ascending: true });

        if (rError) throw rError;

        return NextResponse.json({
            temporadas,
            tarifas,
        });
    } catch (error: any) {
        console.error("❌ Error en GET /api/admin/tarifas:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Identidad verificada por token de sesión (no por el body)
        const admin = await getVerifiedAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
        }
        const adminData = { rol: admin.rol, nombre: admin.nombre };
        const adminEmail = admin.email;

        const body = await request.json();
        const { type, id, ...payload } = body;

        const isViewer = adminData.rol === 'viewer';
        const isWriter = adminData.rol === 'writer';
        const isAdmin = ['admin', 'superadmin'].includes(adminData.rol);

        // Bloqueo total para viewers en cualquier POST (modificación)
        if (isViewer) {
            return NextResponse.json({ error: "No tienes permisos para realizar cambios. Tu perfil es de solo lectura." }, { status: 403 });
        }

        // ACCIÓN: ELIMINAR TEMPORADA (Solo Admins)
        if (type === 'delete_temporada') {
            if (!isAdmin) {
                return NextResponse.json({ error: "Solo administradores pueden eliminar temporadas." }, { status: 403 });
            }
            if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
            
            await supabaseAdmin.from("tarifas").delete().eq("temporada_id", id);
            const { error } = await supabaseAdmin.from("temporadas").delete().eq("id", id);
            
            if (error) throw error;

            // Loggear acción
            await supabaseAdmin.from('admin_access_logs').insert({
                email: adminEmail,
                action: 'temporada_deleted',
                details: `El administrador ${adminData.nombre} eliminó la temporada ID: ${id}`
            });

            return NextResponse.json({ success: true });
        }

        // ACCIÓN: CREAR TEMPORADA (Admin o Writer)
        if (type === 'create_temporada') {
            const { nombre, fecha_inicio, fecha_fin, prioridad } = payload;
            const { data: temporada, error: tError } = await supabaseAdmin
                .from("temporadas")
                .insert([{
                    nombre,
                    fecha_inicio,
                    fecha_fin,
                    prioridad: prioridad || 0,
                    activa: true
                }])
                .select()
                .single();

            if (tError) throw tError;

            // Crear tarifas base por defecto para la nueva temporada
            const basePrices = [
                { adultos: 1, noches_min: 1, precio_noche: 0 },
                { adultos: 2, noches_min: 1, precio_noche: 0 },
                { adultos: 3, noches_min: 1, precio_noche: 0 },
                { adultos: 4, noches_min: 1, precio_noche: 0 },
                { adultos: 1, noches_min: 2, precio_noche: 0 },
                { adultos: 2, noches_min: 2, precio_noche: 0 },
                { adultos: 3, noches_min: 2, precio_noche: 0 },
                { adultos: 4, noches_min: 2, precio_noche: 0 },
            ];

            const { error: rError } = await supabaseAdmin
                .from("tarifas")
                .insert(basePrices.map(p => ({
                    adultos: p.adultos,
                    noches_min: p.noches_min,
                    precio_noche: p.precio_noche,
                    temporada_id: temporada.id
                })));

            if (rError) throw rError;

            // Loggear acción
            await supabaseAdmin.from('admin_access_logs').insert({
                email: adminEmail,
                action: 'temporada_created',
                details: `${adminData.nombre} creó la temporada: ${nombre}. Rango: ${fecha_inicio} a ${fecha_fin}`
            });

            return NextResponse.json({ success: true, data: temporada });
        }

        if (!id) {
            return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
        }

        // ACCIÓN: ACTUALIZAR TEMPORADA / PRIORIDAD (Admin o Writer)
        if (type === 'temporada') {
            const { nombre, fecha_inicio, fecha_fin, prioridad } = payload;
            // Build update object only with defined fields
            const updateData: Record<string, any> = {};
            if (nombre !== undefined) updateData.nombre = nombre;
            if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio;
            if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;
            if (prioridad !== undefined) updateData.prioridad = Number(prioridad);

            const { data, error } = await supabaseAdmin
                .from("temporadas")
                .update(updateData)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            // Loggear acción
            await supabaseAdmin.from('admin_access_logs').insert({
                email: adminEmail,
                action: 'temporada_updated',
                details: `${adminData.nombre} actualizó la temporada: ${nombre || id}`
            });

            return NextResponse.json({ success: true, data });
        }

        // ACCIÓN: ACTUALIZAR TARIFA (Admin o Writer)
        const { precio_noche } = payload;
        if (precio_noche === undefined) {
            return NextResponse.json({ error: "Precio es requerido" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("tarifas")
            .update({
                precio_noche: Number(precio_noche)
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Loggear acción
        await supabaseAdmin.from('admin_access_logs').insert({
            email: adminEmail,
            action: 'tarifa_updated',
            details: `${adminData.nombre} actualizó precio de tarifa ID: ${id} a $${precio_noche}`
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("❌ Error en POST /api/admin/tarifas:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


