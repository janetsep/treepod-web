import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

/**
 * Leads capturados antes del pago (leads_checkout) + su estado real.
 *
 * Un lead "convirtió" si existe una reserva pagada con ese email. El resto son
 * oportunidades vivas: gente que dejó su contacto y no completó. Sin esta vista
 * los leads quedaban en la base sin que nadie los viera ni los contactara.
 */
export async function GET(request: Request) {
    const admin = await getVerifiedAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: leads, error } = await supabaseAdmin
        .from("leads_checkout")
        .select("id, email, telefono, fecha_inicio, fecha_fin, total, created_at, utm_source, utm_medium, utm_campaign, utm_content, landing_page")
        .order("created_at", { ascending: false })
        .limit(500);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const emails = Array.from(new Set((leads || []).map((l) => (l.email || "").toLowerCase()).filter(Boolean)));

    // Reservas pagadas de esos emails: define qué lead ya convirtió.
    const pagadosPorEmail = new Map<string, { fecha_inicio: string; total: string }>();
    if (emails.length) {
        const { data: reservas } = await supabaseAdmin
            .from("reservas")
            .select("email, estado, fecha_inicio, total")
            .in("estado", ["pagado", "confirmado"])
            .in("email", emails);
        for (const r of reservas || []) {
            const key = (r.email || "").toLowerCase();
            if (key && !pagadosPorEmail.has(key)) pagadosPorEmail.set(key, { fecha_inicio: r.fecha_inicio, total: r.total });
        }
    }

    // Nombre conocido del CRM, si lo hay (los lead magnets solo piden email).
    const nombrePorEmail = new Map<string, string>();
    if (emails.length) {
        const { data: clientes } = await supabaseAdmin
            .from("clientes")
            .select("email, nombre, apellido")
            .in("email", emails);
        for (const c of clientes || []) {
            const key = (c.email || "").toLowerCase();
            const nombre = `${c.nombre || ""} ${c.apellido || ""}`.trim();
            if (key && nombre) nombrePorEmail.set(key, nombre);
        }
    }

    const enriquecidos = (leads || []).map((l) => {
        const key = (l.email || "").toLowerCase();
        const origen =
            l.utm_content === "alerta-nieve" ? "Alerta de nieve"
                : l.utm_content === "guia-las-trancas" ? "Guía Las Trancas"
                    : "Checkout incompleto";
        return {
            ...l,
            nombre: nombrePorEmail.get(key) || null,
            convertido: pagadosPorEmail.has(key),
            origen,
        };
    });

    const pendientes = enriquecidos.filter((l) => !l.convertido);

    return NextResponse.json({
        leads: enriquecidos,
        resumen: {
            total: enriquecidos.length,
            convertidos: enriquecidos.length - pendientes.length,
            pendientes: pendientes.length,
            valor_pendiente: pendientes.reduce((acc, l) => acc + (Number(l.total) || 0), 0),
        },
    });
}
