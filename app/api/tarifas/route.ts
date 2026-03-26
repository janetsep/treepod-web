import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

        return NextResponse.json({ temporadas, tarifas });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
