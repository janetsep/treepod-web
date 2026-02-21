import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, fecha_inicio, fecha_fin, domo_id, nombre, apellido, email, total, estado, fuente } = body;

        // Validación básica
        if (!fecha_inicio || !fecha_fin || !domo_id) {
            return NextResponse.json({ error: "Faltan datos obligatorios (Fechas, Domo)" }, { status: 400 });
        }

        const reservaData = {
            fecha_inicio,
            fecha_fin,
            domo_id,
            nombre,
            apellido,
            email,
            total,
            estado: estado || 'pendiente',
            fuente: fuente || 'manual_admin',
            updated_at: new Date().toISOString()
        };

        let result;

        if (id) {
            // ACTUALIZAR
            result = await supabaseAdmin
                .from("reservas")
                .update(reservaData)
                .eq("id", id)
                .select()
                .single();
        } else {
            // CREAR NUEVA
            result = await supabaseAdmin
                .from("reservas")
                .insert({
                    ...reservaData,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
        }

        if (result.error) {
            console.error("Error saving reserva:", result.error);
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        // Opcional: Crear/Actualizar Cliente en CRM si hay email
        if (email) {
            await supabaseAdmin.from("clientes").upsert({
                email,
                nombre,
                apellido,
                updated_at: new Date().toISOString()
            }, { onConflict: "email" });
        }

        return NextResponse.json({ ok: true, data: result.data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
