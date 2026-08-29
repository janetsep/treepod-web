import Link from "next/link";
import SectionFolio from "./SectionFolio";
import { btnPrimaryDark } from "./deco/cta";

// Artículo 05 — la única banda oscura del cuerpo: numerales gigantes en Fraunces
// itálica cyan sobre charcoal, pasos como filas de índice. Datos reales.
// [CRO P10 — PENDIENTE DE APROBACIÓN DE JANET]: el paso 2 promete "Webpay o
// transferencia" pero el checkout solo ofrece Webpay. Propuesta: quitar
// "o transferencia". Es cambio de copy: NO se toca sin su OK.
const pasos = [
  {
    n: "1",
    t: "Elige tus fechas",
    d: "Revisa la disponibilidad y el precio al instante, sin compromiso.",
  },
  {
    n: "2",
    t: "Reserva con el 50%",
    d: "Pago seguro con Webpay o transferencia. El saldo se paga en el check-in.",
  },
  {
    n: "3",
    t: "Llega y disfruta",
    d: "Te enviamos la ubicación exacta y dejamos todo listo para tu llegada.",
  },
];

export default function ComoReservar() {
  return (
    <section className="bg-[#1E1B16] text-[#F7F3EC] py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 05" label="Reservar es simple" dark />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="display-lg !text-[#F7F3EC]">
              Tu escapada, en <span className="italic text-[#00ADEF]">tres pasos</span>
            </h2>
            <div className="mt-10 hidden lg:block">
              <Link href="/disponibilidad#reservar" className={btnPrimaryDark}>
                Ver disponibilidad y precio
              </Link>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="border-b border-white/15">
              {pasos.map(({ n, t, d }) => (
                <div
                  key={n}
                  className="border-t border-white/15 py-6 grid grid-cols-[auto_1fr] gap-6 items-baseline"
                >
                  <span
                    className="font-display italic text-[clamp(3.5rem,6vw,5.5rem)] text-[#00ADEF] leading-none tabular-nums w-14 md:w-20"
                    aria-hidden="true"
                  >
                    {n}
                  </span>
                  <div>
                    <h3 className="!font-sans text-lg font-semibold !text-[#F7F3EC]">{t}</h3>
                    <p className="text-white/70 mt-1.5 text-[15px] leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Link href="/disponibilidad#reservar" className={btnPrimaryDark}>
                Ver disponibilidad y precio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
