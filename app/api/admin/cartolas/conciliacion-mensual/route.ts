import { NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ReservaPago = {
  id: string;
  fecha_movimiento: string | null;
  monto: number;
  reserva_id: string;
  metodo_pago: string | null;
};

type ReservaNombre = { id: string; nombre: string | null; apellido: string | null };

type Abono = {
  id: string;
  fecha: string | null;
  descripcion: string;
  monto: number;
  reserva_id: string | null;
};

async function todosLosPagosDeReservas(): Promise<ReservaPago[]> {
  const result: ReservaPago[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin
      .from("finanzas_movimientos")
      .select("id, fecha_movimiento, monto, reserva_id, metodo_pago")
      .eq("tipo", "ingreso")
      .eq("categoria", "reservas")
      .not("reserva_id", "is", null)
      .order("fecha_movimiento", { ascending: false })
      .range(from, from + 999);
    if (error) throw error;
    result.push(...((data || []) as ReservaPago[]));
    if (!data || data.length < 1000) break;
  }
  return result;
}

async function nombresDeReservas(): Promise<ReservaNombre[]> {
  const result: ReservaNombre[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin
      .from("reservas")
      .select("id, nombre, apellido")
      .range(from, from + 999);
    if (error) throw error;
    result.push(...((data || []) as ReservaNombre[]));
    if (!data || data.length < 1000) break;
  }
  return result;
}

async function todosLosAbonos(): Promise<Abono[]> {
  const result: Abono[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin
      .from("sicra_cartola_movimientos")
      .select("id, fecha, descripcion, monto, reserva_id")
      .eq("tipo", "abono")
      .eq("categoria", "ingreso")
      .order("fecha", { ascending: false })
      .range(from, from + 999);
    if (error) throw error;
    result.push(...((data || []) as Abono[]));
    if (!data || data.length < 1000) break;
  }
  return result;
}

function mesDe(fecha: string | null): string | null {
  const value = String(fecha || "").slice(0, 7);
  return /^\d{4}-\d{2}$/.test(value) ? value : null;
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const [pagos, reservas, abonos] = await Promise.all([todosLosPagosDeReservas(), nombresDeReservas(), todosLosAbonos()]);
    const reservaPorId = new Map(reservas.map((r) => [r.id, r]));
    const abonosPorReserva = new Map<string, Abono[]>();
    for (const abono of abonos) {
      if (!abono.reserva_id) continue;
      const actuales = abonosPorReserva.get(abono.reserva_id) || [];
      actuales.push(abono);
      abonosPorReserva.set(abono.reserva_id, actuales);
    }

    const meses = new Map<string, {
      mes: string;
      reservas: Array<{ id: string; pago_id: string; nombre: string | null; apellido: string | null; fecha_pago: string | null; monto_pagado: number; metodo_pago: string | null; abonos: Abono[]; abonado_cartola: number }>;
      abonos: Abono[];
    }>();
    const asegurar = (mes: string) => {
      if (!meses.has(mes)) meses.set(mes, { mes, reservas: [], abonos: [] });
      return meses.get(mes)!;
    };

    // Cada fila es un PAGO real, no el monto acumulado de la reserva. Así el 50%
    // inicial y el saldo pueden pertenecer a meses distintos.
    for (const pago of pagos) {
      const mes = mesDe(pago.fecha_movimiento);
      if (!mes) continue;
      const reserva = reservaPorId.get(pago.reserva_id);
      const vinculados = (abonosPorReserva.get(pago.reserva_id) || []).filter((a) => mesDe(a.fecha) === mes);
      asegurar(mes).reservas.push({
        id: pago.reserva_id,
        pago_id: pago.id,
        nombre: reserva?.nombre || null,
        apellido: reserva?.apellido || null,
        fecha_pago: pago.fecha_movimiento,
        monto_pagado: Number(pago.monto || 0),
        metodo_pago: pago.metodo_pago,
        abonos: vinculados,
        abonado_cartola: vinculados.reduce((s, a) => s + Number(a.monto || 0), 0),
      });
    }
    for (const abono of abonos) {
      const mes = mesDe(abono.fecha);
      if (mes) asegurar(mes).abonos.push(abono);
    }

    const conciliacion = [...meses.values()]
      .sort((a, b) => b.mes.localeCompare(a.mes))
      .map((fila) => {
        const ingresosReservas = fila.reservas.reduce((s, r) => s + r.monto_pagado, 0);
        const abonosCartola = fila.abonos.reduce((s, a) => s + Number(a.monto || 0), 0);
        const conciliado = fila.abonos.filter((a) => a.reserva_id).reduce((s, a) => s + Number(a.monto || 0), 0);
        return {
          ...fila,
          ingresos_reservas: ingresosReservas,
          abonos_cartola: abonosCartola,
          conciliado,
          sin_conciliar: abonosCartola - conciliado,
          diferencia: abonosCartola - ingresosReservas,
        };
      });

    return NextResponse.json({ conciliacion });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo calcular la conciliación" }, { status: 500 });
  }
}
