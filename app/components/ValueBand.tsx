import { BadgePercent, CalendarClock, ShieldCheck, MessageCircle, Star } from "lucide-react";
import { precioDesde, fmtCLP } from "@/lib/precio-desde";

// Banda de valor + confianza bajo el hero. Visible de inmediato, comunica el precio
// "desde" real (2 adultos, temporada vigente — ver lib/precio-desde) junto al rating
// y las palancas de RESERVA DIRECTA que más convierten (precio directo, abono 50%,
// registro SERNATUR, respuesta instantánea). Server component: precio en vivo.

const items = [
  { Icon: BadgePercent, t: "Mejor precio directo", s: "Sin comisión de intermediarios" },
  { Icon: CalendarClock, t: "Reserva con el 50%", s: "El saldo se paga en el check-in" },
  { Icon: ShieldCheck, t: "Registro SERNATUR", s: "N° 36806 · operación formal" },
  { Icon: MessageCircle, t: "Respuesta rápida", s: "Te asesoramos por WhatsApp" },
];

export default async function ValueBand() {
  const { precio: desde, nochesMin } = await precioDesde();
  return (
    <section className="bg-white border-b border-black/[0.06]">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-7">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          {/* Precio desde */}
          <div className="flex flex-col shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Domos desde</span>
              <span className="text-3xl md:text-4xl font-black text-[#4A7C2E] leading-none">{fmtCLP(desde)}</span>
              <span className="text-sm font-semibold text-gray-500">/ noche</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-400 mt-0.5">
              2 personas{nochesMin > 1 ? ` · para estadías de ${nochesMin} noches o más` : ""}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 mt-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4,9 · 59 reseñas en Google
            </span>
          </div>

          {/* Separador */}
          <div className="hidden lg:block w-px h-12 bg-black/10" />

          {/* Palancas de reserva directa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 sm:gap-y-4 flex-1">
            {items.map(({ Icon, t, s }) => (
              <div key={t} className="flex items-start gap-2.5">
                <Icon className="w-5 h-5 text-[#4A7C2E] shrink-0 mt-0.5" strokeWidth={2.2} />
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
