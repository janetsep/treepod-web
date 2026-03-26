import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("reservas")
        .select(`
            *,
            reserva_servicios (
                *,
                servicios (nombre)
            )
        `)
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    return NextResponse.json(data);
}
