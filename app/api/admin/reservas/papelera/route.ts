import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: Listar reservas en papelera
export async function GET() {
    try {
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
        const { reservaId, adminEmail, action } = await request.json();

        if (!reservaId || !action) {
            return NextResponse.json({ error: "ID y acción requeridos" }, { status: 400 });
        }

        if (!adminEmail) {
            return NextResponse.json({ error: "Se requiere identificación de administrador" }, { status: 401 });
        }

        const { data: adminData } = await supabaseAdmin
            .from("authorized_admins")
            .select("rol, nombre")
            .eq("email", adminEmail)
            .single();

        if (!adminData || !['admin', 'superadmin'].includes(adminData.rol)) {
            return NextResponse.json({ error: "No tienes permisos." }, { status: 403 });
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
