import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Devuelve los ingresos de reservas (monto_pagado) agregados por mes y año,
// para mostrar un cuadro/matriz comparativo entre años en el dashboard admin.
export async function GET() {
  try {
    const estadosValidos = ["pagado", "completada", "confirmado"];

    // Traer reservas paginando para superar el límite de 1000 filas de PostgREST
    const rows: { monto_pagado: number | null; total: number | null; fecha_inicio: string | null }[] = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabaseAdmin
        .from("reservas")
        .select("monto_pagado, total, fecha_inicio")
        .in("estado", estadosValidos)
        .is("deleted_at", null)
        .not("fecha_inicio", "is", null)
        .range(from, from + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!data || data.length === 0) break;
      rows.push(...data);
      if (data.length < pageSize) break;
    }

    // Agregar por [mes][año]
    const map: Record<number, Record<number, number>> = {};
    const yearsSet = new Set<number>();

    for (const r of rows) {
      if (!r.fecha_inicio) continue;
      const [yStr, mStr] = r.fecha_inicio.split("-");
      const anio = Number(yStr);
      const mes = Number(mStr);
      if (!anio || !mes) continue;

      // Ingreso real: lo cobrado (monto_pagado); si no hay, el total de la reserva
      const valor = Number(r.monto_pagado) > 0 ? Number(r.monto_pagado) : Number(r.total) || 0;

      yearsSet.add(anio);
      map[mes] = map[mes] || {};
      map[mes][anio] = (map[mes][anio] || 0) + valor;
    }

    const years = Array.from(yearsSet).sort((a, b) => a - b);

    const matriz = [];
    for (let mes = 1; mes <= 12; mes++) {
      matriz.push({
        mes,
        valores: years.map((y) => map[mes]?.[y] || 0),
      });
    }

    const totalesPorAnio = years.map((y) =>
      Object.values(map).reduce((acc, byYear) => acc + (byYear[y] || 0), 0)
    );

    return NextResponse.json({ years, matriz, totalesPorAnio });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
