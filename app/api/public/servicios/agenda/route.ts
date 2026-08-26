import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Agenda pública de servicios pedidos (para SIGRE / gestión energética).
 *
 * Devuelve, para las reservas ACTIVAS que se solapan con el rango [from, to),
 * qué servicios se solicitaron (desayuno, cena, tinaja, etc.), cuándo y en qué
 * domo. SIN datos personales: nunca expone email, nombre ni id de huésped.
 *
 * Sirve para que SIGRE distinga cargas OBLIGADAS por la reserva (un servicio
 * pedido se ejecuta ese día sí o sí) de cargas diferibles, sin necesitar la
 * llave de servicio dentro del contenedor de Home Assistant.
 *
 * Uso: /api/public/servicios/agenda?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Devuelve: { desde, hasta, generado, reservas: [
 *   { domo_id, fecha_inicio, fecha_fin, servicios: [{ nombre, cantidad }] }
 * ] }
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from"); // YYYY-MM-DD
        const to = searchParams.get("to");     // YYYY-MM-DD (exclusivo)

        if (!from || !to) {
            return NextResponse.json({ error: "Fechas requeridas (from, to)" }, { status: 400 });
        }
        if (to <= from) {
            return NextResponse.json({ error: "Rango de fechas inválido" }, { status: 400 });
        }

        // 1. Reservas activas que se solapan con [from, to). Solo campos operativos,
        //    NUNCA email/nombre/telefono (sin PII).
        const { data: reservas, error: resErr } = await supabaseAdmin
            .from("reservas")
            .select("id, domo_id, fecha_inicio, fecha_fin, estado")
            .in("estado", ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation"])
            .is("deleted_at", null)
            .lt("fecha_inicio", to)
            .gt("fecha_fin", from);

        if (resErr) throw resErr;

        if (!reservas || reservas.length === 0) {
            return NextResponse.json({
                desde: from, hasta: to, generado: new Date().toISOString(), reservas: [],
            });
        }

        const idReservas = reservas.map((r: any) => r.id);

        // 2. Servicios pedidos en esas reservas
        const { data: rs, error: rsErr } = await supabaseAdmin
            .from("reserva_servicios")
            .select("reserva_id, servicio_id, cantidad")
            .in("reserva_id", idReservas);

        if (rsErr) throw rsErr;

        // 3. Catálogo de nombres de servicio
        const { data: servicios, error: sErr } = await supabaseAdmin
            .from("servicios")
            .select("id, nombre");

        if (sErr) throw sErr;

        const nombrePorId = new Map<string, string>(
            (servicios || []).map((s: any) => [s.id, s.nombre])
        );

        // 4. Agrupar servicios por reserva
        const serviciosPorReserva = new Map<string, { nombre: string; cantidad: number }[]>();
        for (const item of rs || []) {
            const lista = serviciosPorReserva.get(item.reserva_id) || [];
            lista.push({
                nombre: nombrePorId.get(item.servicio_id) || "Servicio",
                cantidad: item.cantidad || 1,
            });
            serviciosPorReserva.set(item.reserva_id, lista);
        }

        // 5. Salida anonimizada (sin id de reserva ni PII)
        const salida = reservas.map((r: any) => ({
            domo_id: r.domo_id,
            fecha_inicio: r.fecha_inicio,
            fecha_fin: r.fecha_fin,
            servicios: serviciosPorReserva.get(r.id) || [],
        }));

        return NextResponse.json({
            desde: from,
            hasta: to,
            generado: new Date().toISOString(),
            reservas: salida,
        });
    } catch (error: any) {
        console.error("Error en agenda de servicios:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
