import Image from "next/image";
import Link from "next/link";
import SectionFolio from "./SectionFolio";
import { linkLine } from "./deco/cta";

// Artículo 03 — página de texto impreso: los tres párrafos vigentes compuestos en
// columnas de imprenta con capitular, y el croquis aéreo como figura numerada.
export default function NotForEveryone() {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 03" label="Por qué TreePod" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12 items-start">
          <div className="col-span-12 lg:col-span-7 lg:col-start-2 relative">
            {/* Numeral fantasma */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-10 -left-2 font-display italic text-[clamp(6rem,16vw,13rem)] leading-none text-[#1E1B16]/[0.05]"
            >
              03
            </span>

            <h2 className="display-lg text-[#1E1B16] relative z-10">
              Para tu{" "}
              <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                próxima escapada
              </span>
            </h2>

            <div className="mt-10 lg:columns-2 lg:gap-10 text-base md:text-[17px] leading-relaxed text-[#1E1B16]/85 space-y-5 [&>p:first-child]:first-letter:font-display [&>p:first-child]:first-letter:text-6xl [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2 [&>p:first-child]:first-letter:leading-[0.8] [&>p:first-child]:first-letter:text-[#1E1B16]">
              <p>
                <strong>A minutos de todo:</strong> despiertas en medio del bosque nativo y en pocos
                minutos estás en las termas o las pistas de Nevados de Chillán.
              </p>
              <p>
                <strong>Espacio de sobra:</strong> un domo amplio solo para ustedes, con baño privado
                incluido. Sin compartir con nadie.
              </p>
              <p>
                <strong>No necesitas traer nada:</strong> Nespresso, WiFi Starlink y el domo
                completamente equipado. Dejas el bolso y ya estás de vacaciones.
              </p>
            </div>

            <div className="mt-10">
              <Link href="/disponibilidad#reservar" className={linkLine}>
                Reservar mi escapada <span aria-hidden="true">→</span>
              </Link>
              <p className="caption-editorial mt-3">
                Reservas con el 50%. El saldo lo pagas en el check-in.
              </p>
            </div>
          </div>

          {/* Figura: croquis aéreo del glamping */}
          <div className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-3 lg:col-start-10">
            <figure className="border border-[#1E1B16]/15 rounded-[2px] p-3 bg-white">
              <div className="relative aspect-square">
                <Image
                  src="/images/concept/croquis-aereo-nuevo.png"
                  alt="Nuestro glamping - Ubicación estratégica"
                  fill
                  sizes="(max-width: 1024px) 66vw, 25vw"
                  className="object-contain object-center"
                />
              </div>
              <figcaption className="mt-3 flex items-center gap-2 border-t border-[#1E1B16]/10 pt-3">
                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                <span className="caption-editorial">Fig. 01 — Plano del glamping</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
