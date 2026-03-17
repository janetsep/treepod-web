import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📝 Payload recibido:", body);

        const { reservaId, nombre, apellido, email } = body;

        // Validation
        if (!reservaId || !nombre || !apellido || !email) {
            return NextResponse.json(
                { error: "Todos los campos son obligatorios" },
                { status: 400 }
            );
        }

        // 1. CRM Update (Supabase)
        let isVip = false;

        try {
            const clientData = {
                email,
                nombre,
                apellido,
                updated_at: new Date().toISOString()
            };

            const { data: clientResult, error: clientError } = await supabase
                .from("clientes")
                .upsert(clientData, { onConflict: "email" })
                .select("vip_tier, id")
                .single();

            if (clientError) {
                console.warn("⚠️ CRM Warning:", clientError.message);
            } else if (clientResult && clientResult.vip_tier && clientResult.vip_tier !== 'Standard') {
                isVip = true;
                console.log(`🌟 VIP Detectado: ${email}`);
            }
        } catch (crmErr) {
            console.error("⚠️ CRM Logic check failed:", crmErr);
        }

        // 2. Reserva Update y Fetch para Lead
        const { data: reservaActualizada, error: updateError } = await supabase
            .from("reservas")
            .update({
                nombre,
                apellido,
                email,
                is_vip_booking: isVip,
                updated_at: new Date().toISOString(),
            })
            .eq("id", reservaId)
            .select("id, domo_id, fecha_inicio, fecha_fin, total")
            .single();

        if (updateError) {
            console.error("❌ Error actualizando reserva:", updateError);
            return NextResponse.json(
                { error: `Error DB: ${updateError.message}` },
                { status: 500 }
            );
        }

        // 3. Registrar Lead en leads_checkout
        if (reservaActualizada) {
            const { error: leadError } = await supabase
                .from("leads_checkout")
                .insert({
                    id: reservaActualizada.id, // Opcional, usar el mismo id de la reserva o dejar que gen_random_uuid lo cree. Mejor dejarlo genérico si el id es distinto, pero aquí ponemos email
                    email,
                    domo_id: reservaActualizada.domo_id,
                    fecha_inicio: reservaActualizada.fecha_inicio,
                    fecha_fin: reservaActualizada.fecha_fin,
                    total: reservaActualizada.total,
                });
            if (leadError) {
                console.warn("⚠️ Error registrando lead:", leadError.message);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Reserve API Error:", error);
        return NextResponse.json(
            { error: `Error interno: ${error instanceof Error ? error.message : 'Desconocido'}` },
            { status: 500 }
        );
    }
}
