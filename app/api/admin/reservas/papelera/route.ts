import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// GET: Listar reservas en papelera
export async function GET(request: Request) {
    try {
        // Sin esto el endpoint devolvia nombre, correo y telefono de todos los
        // clientes a cualquiera que supiera la URL.
        const admin = await getVerifiedAdmin(request);
        if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from("reservas")
            .select(`*, domos (nombre), clientes (id, nombre, apellido, email, telefono)`)
            .not("deleted_at", "is", null)
            .order("deleted_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Restaurar o eliminar permanentemente
export async function POST(request: Request) {
    try {
        // Identidad verificada por token de sesión (no por el body)
        const admin = await getVerifiedAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
        }
        if (!['admin', 'superadmin'].includes(admin.rol)) {
            return NextResponse.json({ error: "No tienes permisos." }, { status: 403 });
        }
        const adminData = { rol: admin.rol, nombre: admin.nombre };
        const adminEmail = admin.email;

        const { reservaId, action } = await request.json();
        if (!reservaId || !action) {
            return NextResponse.json({ error: "ID y acción requeridos" }, { status: 400 });
        }

        if (action === "restore") {
            const { error } = await supabaseAdmin
                .from("reservas")
                .update({ deleted_at: null })
                .eq("id", reservaId);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            await supabaseAdmin.from('admin_access_logs').insert({
                email: adminEmail,
                action: 'reservation_restored',
                details: `${adminData.nombre} restauró la reserva ${reservaId} desde la papelera.`
            });

            return NextResponse.json({ ok: true });
        }

        if (action === "permanent_delete") {
            // Eliminar dependencias
            try { await supabaseAdmin.from("reserva_servicios").delete().eq("reserva_id", reservaId); } catch {}
            try { await supabaseAdmin.from("finanzas_movimientos").delete().eq("reserva_id", reservaId); } catch {}
            try { await supabaseAdmin.from("leads_checkout").delete().eq("id", reservaId); } catch {}

            const { error } = await supabaseAdmin.from("reservas").delete().eq("id", reservaId);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            await supabaseAdmin.from('admin_access_logs').insert({
                email: adminEmail,
                action: 'reservation_permanently_deleted',
                details: `${adminData.nombre} eliminó permanentemente la reserva ${reservaId}.`
            });

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
