import { supabase } from "@/lib/supabase";
import { BadgePercent, CalendarClock, ShieldCheck, MessageCircle } from "lucide-react";

// Banda de valor + confianza bajo el hero. Visible de inmediato, comunica el precio
// "desde" real y las palancas de RESERVA DIRECTA que más convierten (precio directo,
// abono 50%, registro SERNATUR, respuesta instantánea). Server component: trae el
// precio mínimo en vivo para que nunca quede desactualizado.
// Precio "desde" de la TEMPORADA VIGENTE hoy (no el mínimo histórico de temporada
// baja). Busca la temporada activa cuyo rango de fechas contiene la fecha de hoy y
// toma su tarifa nocturna más baja. Si falla, usa el mínimo global como respaldo.
async function precioDesde(): Promise<number> {
  const RESPALDO = 130000;
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
        .select("precio_noche")
        .eq("temporada_id", tempId)
        .gt("precio_noche", 0)
        .order("precio_noche", { ascending: true })
        .limit(1);
      if (data?.[0]?.precio_noche) return data[0].precio_noche;
    }
    const { data } = await supabase
      .from("tarifas").select("precio_noche").gt("precio_noche", 0)
      .order("precio_noche", { ascending: true }).limit(1);
    return data?.[0]?.precio_noche || RESPALDO;
  } catch {
    return RESPALDO;
  }
}

const fmtCLP = (n: number) => "$" + n.toLocaleString("es-CL");

const items = [
  { Icon: BadgePercent, t: "Mejor precio directo", s: "Sin comisión de intermediarios" },
  { Icon: CalendarClock, t: "Reserva con el 50%", s: "El saldo se paga en el check-in" },
  { Icon: ShieldCheck, t: "Registro SERNATUR", s: "N° 36806 · operación formal" },
  { Icon: MessageCircle, t: "Respuesta rápida", s: "Te asesoramos por WhatsApp" },
];

export default async function ValueBand() {
  const desde = await precioDesde();
  return (
    <section className="bg-white border-b border-black/[0.06]">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-7">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          {/* Precio desde */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Domos desde</span>
            <span className="text-3xl md:text-4xl font-black text-[#00ADEF] leading-none">{fmtCLP(desde)}</span>
            <span className="text-sm font-semibold text-gray-500">/ noche</span>
          </div>

          {/* Separador */}
          <div className="hidden lg:block w-px h-12 bg-black/10" />

          {/* Palancas de reserva directa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 sm:gap-y-4 flex-1">
            {items.map(({ Icon, t, s }) => (
              <div key={t} className="flex items-start gap-2.5">
                <Icon className="w-5 h-5 text-[#00ADEF] shrink-0 mt-0.5" strokeWidth={2.2} />
                <div className="min-w-0">
                  <div className="text-sm sm:text-[13px] font-bold text-gray-900 leading-tight">{t}</div>
                  <div className="text-xs sm:text-[11px] text-gray-500 leading-tight mt-0.5">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
