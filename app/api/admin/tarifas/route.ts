import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data: temporadas, error: tError } = await supabase
            .from("temporadas")
            .select("*")
            .eq("activa", true)
            .order("prioridad", { ascending: false });

        if (tError) throw tError;

        const { data: tarifas, error: rError } = await supabase
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
        const body = await request.json();
        const { type, id, ...payload } = body;

        // ACCIÓN: CREAR TEMPORADA
        if (type === 'create_temporada') {
            const { nombre, fecha_inicio, fecha_fin, prioridad } = payload;
            const { data: temporada, error: tError } = await supabase
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
                { adultos: 2, noches_min: 1, precio_noche: 145000 },
                { adultos: 2, noches_min: 2, precio_noche: 130000 },
                { adultos: 4, noches_min: 1, precio_noche: 200000 }
            ];

            const { error: rError } = await supabase
                .from("tarifas")
                .insert(basePrices.map(p => ({
                    adultos: p.adultos,
                    noches_min: p.noches_min,
                    precio_noche: p.precio_noche,
                    temporada_id: temporada.id
                })));

            if (rError) throw rError;
            return NextResponse.json({ success: true, data: temporada });
        }

        // ACCIÓN: ELIMINAR TEMPORADA
        if (type === 'delete_temporada') {
            if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
            await supabase.from("tarifas").delete().eq("temporada_id", id);
            const { error } = await supabase.from("temporadas").delete().eq("id", id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (!id) {
            return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
        }

        // ACCIÓN: ACTUALIZAR TEMPORADA / PRIORIDAD
        if (type === 'temporada') {
            const { nombre, fecha_inicio, fecha_fin, prioridad } = payload;
            const { data, error } = await supabase
                .from("temporadas")
                .update({
                    nombre,
                    fecha_inicio,
                    fecha_fin,
                    prioridad: prioridad !== undefined ? Number(prioridad) : undefined,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        // ACCIÓN: ACTUALIZAR TARIFA
        const { precio_noche } = payload;
        if (precio_noche === undefined) {
            return NextResponse.json({ error: "Precio es requerido" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("tarifas")
            .update({
                precio_noche: Number(precio_noche)
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("❌ Error en POST /api/admin/tarifas:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


