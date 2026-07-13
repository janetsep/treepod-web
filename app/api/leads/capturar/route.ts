import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Captura de lead ANTES del pago.
 *
 * El formulario de /disponibilidad llama aquí apenas el visitante escribe un
 * email válido con fechas elegidas. Si después no completa el pago, el contacto
 * queda en leads_checkout y se puede recuperar (WhatsApp/email) en vez de
 * perderse sin rastro. Idempotente por email+fechas dentro de 24 horas.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const email = String(body.email || "").trim().toLowerCase();
        // Leads sin fechas: lead magnets (guía, alerta de nieve).
        const esGuia = ["guia-las-trancas", "alerta-nieve"].includes(body.utm_content);
        const fecha_inicio = body.fecha_inicio || null;
        const fecha_fin = body.fecha_fin || null;

        // El lead magnet (guía) no tiene fechas; el checkout sí las exige.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (!esGuia && (!fecha_inicio || !fecha_fin))) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        // Dedupe: mismo email + mismas fechas (o misma guía) en las últimas 24h no crea otra fila.
        const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        let dedupeQuery = supabaseAdmin
            .from("leads_checkout")
            .select("id")
            .eq("email", email)
            .gte("created_at", hace24h);
        dedupeQuery = esGuia
            ? dedupeQuery.eq("utm_content", body.utm_content)
            : dedupeQuery.eq("fecha_inicio", fecha_inicio).eq("fecha_fin", fecha_fin);
        const { data: existente } = await dedupeQuery.limit(1).maybeSingle();

        if (existente) {
            return NextResponse.json({ success: true, dedupe: true });
        }

        const telefono = String(body.telefono || "").trim() || null;

        const { error } = await supabaseAdmin.from("leads_checkout").insert({
            email,
            telefono,
            fecha_inicio,
            fecha_fin,
            total: body.total ?? null,
            completed: false,
            utm_source: body.utm_source || null,
            utm_medium: body.utm_medium || null,
            utm_campaign: body.utm_campaign || null,
            utm_content: body.utm_content || null,
            utm_term: body.utm_term || null,
            landing_page: body.landing_page || null,
            session_id: body.session_id || null,
        });

        if (error) {
            console.warn("⚠️ leads/capturar:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
