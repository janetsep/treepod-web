import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("reservas")
            .select(`
        *,
        domos (nombre),
        clientes (id, nombre, apellido, email, vip_tier)
      `)
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
