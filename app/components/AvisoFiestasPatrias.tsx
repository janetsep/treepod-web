"use client";

import Link from "next/link";
import { trackEvent } from "../lib/analytics";

// Franja de temporada bajo la portada. El 18 y el 19 de septiembre de 2026 caen
// viernes y sábado, así que el fin de semana largo es del 17 al 21 y es la mayor
// venta del año. La landing existía sin ninguna puerta de entrada: esta franja y
// el enlace del menú son esa puerta.
//
// Va en rojo bandera y no en el charcoal de la marca a propósito: es la única
// pieza del sitio que debe interrumpir la lectura. La versión anterior en tono
// oscuro se confundía con el resto de la página y pasaba desapercibida.
//
// Se apaga sola el 22 de septiembre: no hay que acordarse de sacarla.
const FIN = new Date("2026-09-22T00:00:00-03:00");

function BanderaChile({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 20"
      className={className}
      aria-hidden="true"
    >
      <rect width="30" height="10" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#D52B1E" />
      <rect width="10" height="10" fill="#0039A6" />
      <polygon points="5,2 5.9,4.7 8.8,4.7 6.4,6.3 7.3,9 5,7.3 2.7,9 3.6,6.3 1.2,4.7 4.1,4.7" fill="#fff" />
    </svg>
  );
}

export default function AvisoFiestasPatrias() {
  if (new Date() >= FIN) return null;

  return (
    <div className="relative">
      {/* Guirnalda tricolor: dos hilos finos que enmarcan la franja */}
      <div className="h-[3px] w-full bg-[linear-gradient(90deg,#0039A6_0_33.33%,#FFFFFF_33.33%_66.66%,#D52B1E_66.66%_100%)] bg-[length:60px_100%]" />

      <Link
        href="/fiestas-patrias-las-trancas"
        onClick={() => trackEvent("click_franja_fiestas_patrias")}
        className="group block bg-[#D52B1E] text-white hover:bg-[#c0241a] transition-colors"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-10 py-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
          <BanderaChile className="w-8 h-[21px] rounded-sm shadow-[0_1px_6px_rgba(0,0,0,0.35)] shrink-0" />

          <span className="font-display text-[22px] md:text-[26px] leading-none font-semibold tracking-tight">
            18 de Septiembre
          </span>

          <span className="hidden md:inline text-white/40 text-[20px] leading-none">/</span>

          <span className="text-[14px] md:text-[16px] text-white/95">
            El 18 y el 19 caen viernes y sábado: cuatro días en el bosque, del 17 al 21.
          </span>

          <span className="inline-flex items-center gap-2 bg-white text-[#D52B1E] font-semibold text-[13px] md:text-[14px] px-5 py-2 rounded-[2px] shadow-sm group-hover:bg-[#FFF6D9] transition-colors">
            Ver disponibilidad
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </span>

          <BanderaChile className="w-8 h-[21px] rounded-sm shadow-[0_1px_6px_rgba(0,0,0,0.35)] shrink-0" />
        </div>
      </Link>

      <div className="h-[3px] w-full bg-[linear-gradient(90deg,#D52B1E_0_33.33%,#FFFFFF_33.33%_66.66%,#0039A6_66.66%_100%)] bg-[length:60px_100%]" />
    </div>
  );
}
