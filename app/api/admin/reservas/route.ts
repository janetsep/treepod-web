import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
    try {
        const admin = await getVerifiedAdmin(request);
        if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        const { data, error } = await supabaseAdmin
            .from("reservas")
            .select(`
        *,
        domos (nombre),
        clientes (id, nombre, apellido, email, telefono, rut, vip_tier),
        reserva_servicios (id, cantidad, precio_unitario, total, es_cortesia, servicios (id, nombre))
      `)
            .is("deleted_at", null)
            .order("fecha_inicio", { ascending: false });

        if (error) {
            console.error("Supabase Admin Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
