import { supabase } from "@/lib/supabase";

// Precio "desde" de la TEMPORADA VIGENTE hoy para 2 ADULTOS (la reserva típica).
// Busca la temporada activa cuyo rango de fechas contiene la fecha de hoy y toma su
// tarifa nocturna más baja para 2 personas. Devuelve también noches_min para poder
// avisar si esa tarifa exige estadía mínima. Compartida entre ValueBand (banda bajo
// el hero) y MobileReserveBar (barra fija de reserva en mobile).
export async function precioDesde(): Promise<{ precio: number; nochesMin: number }> {
  const RESPALDO = { precio: 160000, nochesMin: 1 };
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const { data: temps } = await supabase
      .from("temporadas")
      .select("id")
      .eq("activa", true)
      .lte("fecha_inicio", hoy)
      .gte("fecha_fin", hoy)
      .order("prioridad", { ascending: false })
      .limit(1);
    const tempId = temps?.[0]?.id;
    if (tempId) {
      const { data } = await supabase
        .from("tarifas")
        .select("precio_noche, noches_min")
        .eq("temporada_id", tempId)
        .eq("adultos", 2)
        .gt("precio_noche", 0)
        .order("precio_noche", { ascending: true })
        .limit(1);
      if (data?.[0]?.precio_noche) {
        return { precio: data[0].precio_noche, nochesMin: data[0].noches_min || 1 };
      }
    }
    const { data } = await supabase
      .from("tarifas").select("precio_noche, noches_min").eq("adultos", 2).gt("precio_noche", 0)
      .order("precio_noche", { ascending: true }).limit(1);
    if (data?.[0]?.precio_noche) {
      return { precio: data[0].precio_noche, nochesMin: data[0].noches_min || 1 };
    }
    return RESPALDO;
  } catch {
    return RESPALDO;
  }
}

export const fmtCLP = (n: number) => "$" + n.toLocaleString("es-CL");
