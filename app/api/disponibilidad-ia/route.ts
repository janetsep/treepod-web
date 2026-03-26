import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { entrada, salida, adultos } = await request.json();

        if (!entrada || !salida) {
            return NextResponse.json({ error: "Faltan fechas" }, { status: 400 });
        }

        // 1. Buscar domos con capacidad suficiente
        const { data: domosComp, error: domosErr } = await supabaseAdmin
            .from("domos")
            .select("id, nombre, capacidad")
            .eq("activo", true)
            .gte("capacidad", adultos || 2);

        if (domosErr || !domosComp || domosComp.length === 0) {
            return NextResponse.json({
                disponible: false,
                mensaje: "No hay domos con esa capacidad."
            });
        }

        const domosPosibles = domosComp.map((d: any) => d.id);

        // 2. Buscar ocupación (reservas activas)
        const { data: ocupadosRes, error: resErr } = await supabaseAdmin
            .from("reservas")
            .select("domo_id")
            .in("domo_id", domosPosibles)
            .not("estado", "in", '("rechazado","cancelado")')
            .lt("fecha_inicio", salida)
            .gt("fecha_fin", entrada);

        // 3. Buscar bloqueos
        const { data: ocupadosBloq, error: bloqErr } = await supabaseAdmin
            .from("bloqueos_calendario")
            .select("domo_id")
            .in("domo_id", domosPosibles)
            .lt("fecha_inicio", salida)
            .gt("fecha_fin", entrada);

        const idOcupados = new Set([
            ...(ocupadosRes || []).map((r: any) => r.domo_id),
            ...(ocupadosBloq || []).map((b: any) => b.domo_id),
        ]);

        const disponibles = domosComp.filter((d: any) => !idOcupados.has(d.id));

        if (disponibles.length === 0) {
            return NextResponse.json({
                disponible: false,
                mensaje: "Lo sentimos, no hay disponibilidad para esas fechas."
            });
        }

        // 4. Calcular precio para el primer domo disponible
        const { data: precioData, error: precioErr } = await supabaseAdmin.rpc("calcular_precio", {
            p_fecha_inicio: entrada,
            p_fecha_fin: salida,
            p_adultos: adultos || 2,
        });

        return NextResponse.json({
            disponible: true,
            domos: disponibles.map((d: any) => d.nombre),
            cotizacion: precioData ? precioData[0] : null,
            politicas: "Entrada 15:00, Salida 12:00. Incluye tinaja exclusiva.",
            whatsapp_cta: "https://wa.me/56989208256"
        });

    } catch (err) {
        return NextResponse.json({ error: "Error en servidor", details: String(err) }, { status: 500 });
    }
}
