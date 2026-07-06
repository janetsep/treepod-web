import Link from "next/link";
import { CalendarCheck, CreditCard, MapPin, ArrowRight } from "lucide-react";

// "Cómo reservar en 3 pasos": muestra que reservar es simple y seguro, reduciendo la
// incertidumbre del proceso (principal motivo de abandono hacia las OTA). Datos reales.
const pasos = [
  {
    Icon: CalendarCheck,
    n: "1",
    t: "Elige tus fechas",
    d: "Revisa la disponibilidad y el precio al instante, sin compromiso.",
  },
  {
    Icon: CreditCard,
    n: "2",
    t: "Reserva con el 50%",
    d: "Pago seguro con Webpay o transferencia. El saldo se paga en el check-in.",
  },
  {
    Icon: MapPin,
    n: "3",
    t: "Llega y disfruta",
    d: "Te enviamos la ubicación exacta y dejamos todo listo para tu llegada.",
  },
];

export default function ComoReservar() {
  return (
    <section className="bg-white py-16 md:py-24" id="como-reservar">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-4 block">Reservar es simple</span>
          <h2 className="h2-display text-text-main">Tu escapada, en tres pasos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {pasos.map(({ Icon, n, t, d }) => (
            <div key={n} className="relative text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[#00ADEF]" strokeWidth={2} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00ADEF] text-white text-xs font-black flex items-center justify-center shadow">
                    {n}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">{t}</h3>
              <p className="text-text-sub leading-relaxed text-[15px]">{d}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/disponibilidad"
            className="inline-flex items-center gap-2 bg-[#00ADEF] hover:bg-[#0098d4] text-white font-semibold px-8 py-3.5 rounded-full shadow-md active:scale-95 transition-all"
          >
            Ver disponibilidad y reservar <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
