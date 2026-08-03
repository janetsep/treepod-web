"use client";

import Link from "next/link";
import TriBullet from "./deco/TriBullet";
import { trackEvent } from "../lib/analytics";

// Franja de temporada bajo la portada. El 18 y el 19 de septiembre de 2026 caen
// viernes y sábado, así que el fin de semana largo es del 17 al 21 y es la mayor
// venta del año. La landing existía sin ninguna puerta de entrada: esta franja y
// el enlace del menú son esa puerta.
//
// Se apaga sola el 22 de septiembre: no hay que acordarse de sacarla.
const FIN = new Date("2026-09-22T00:00:00-03:00");

export default function AvisoFiestasPatrias() {
  if (new Date() >= FIN) return null;

  return (
    <Link
      href="/fiestas-patrias-las-trancas"
      onClick={() => trackEvent("click_franja_fiestas_patrias")}
      className="block bg-[#1E1B16] text-white hover:bg-[#2a251d] transition-colors"
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-10 py-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          Fiestas Patrias
        </span>
        <span className="text-[14px] md:text-[15px]">
          El 18 y el 19 caen viernes y sábado: cuatro días en el bosque, del 17 al 21 de septiembre.
        </span>
        <span className="text-[14px] md:text-[15px] font-semibold text-[#00ADEF] underline underline-offset-4">
          Ver disponibilidad
        </span>
      </div>
    </Link>
  );
}
