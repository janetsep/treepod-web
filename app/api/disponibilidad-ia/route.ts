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

        // 2. Buscar ocupación (misma lógica que /api/public/disponibilidad/rango).
        // Antes este endpoint tenía un typo ("cancelado" en vez de "cancelada") que hacía
        // contar reservas canceladas como ocupadas, y no filtraba papelera ni carritos vencidos.
        const { data: rawConflicts, error: resErr } = await supabaseAdmin
            .from("reservas")
            .select("domo_id, estado, email, expires_at")
            .in("domo_id", domosPosibles)
            .in("estado", ["pagado", "confirmado", "pendiente", "pendiente_pago", "pending_transfer_confirmation", "bloqueado"])
            .is("deleted_at", null)
            .lt("fecha_inicio", salida)
            .gt("fecha_fin", entrada);

        const ahora = new Date();
        const ocupadosRes = (rawConflicts || []).filter((r: any) => {
            if (["pagado", "confirmado", "pendiente", "pending_transfer_confirmation", "bloqueado"].includes(r.estado)) return true;
            if (r.estado === "pendiente_pago") {
                const vigente = !r.expires_at || new Date(r.expires_at) > ahora;
                return !!r.email && vigente;
            }
            return false;
        });

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
            politicas: "Entrada 16:00, Salida 12:00. Incluye tinaja exclusiva.",
            whatsapp_cta: "https://wa.me/56989208256"
        });

    } catch (err) {
        return NextResponse.json({ error: "Error en servidor", details: String(err) }, { status: 500 });
    }
}
