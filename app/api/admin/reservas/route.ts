import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { fetchAllPages } from "@/lib/fetch-all-pages";

export async function GET(request: Request) {
    try {
        const admin = await getVerifiedAdmin(request);
        if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        const data = await fetchAllPages((from, to) => supabaseAdmin
            .from("reservas")
            .select(`
        *,
        domos (nombre),
        clientes (id, nombre, apellido, email, telefono, rut, vip_tier),
        reserva_servicios (id, cantidad, precio_unitario, total, es_cortesia, servicios (id, nombre))
      `)
            .is("deleted_at", null)
            .order("fecha_inicio", { ascending: false })
            .order("id")
            .range(from, to));

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
