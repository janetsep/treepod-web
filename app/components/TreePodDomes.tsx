import Image from "next/image";
import Link from "next/link";
import SectionFolio from "./SectionFolio";
import { btnPrimary } from "./deco/cta";

// Artículo 01 — spread de revista: foto vertical sangrando al borde izquierdo,
// titular que muerde la foto sobre bloque blanco y una segunda foto pequeña
// desalineada a propósito. Los párrafos son el copy vigente, intacto.
export default function TreePodDomes() {
  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 01" label="Tu refugio" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-start">
          {/* Foto principal sangrada al borde izquierdo (solo desde lg) */}
          <figure className="col-span-12 lg:col-span-7">
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[78vh] overflow-hidden lg:ml-[calc(50%-50vw)]">
              <Image
                alt="Domo TreePod entre los árboles"
                className="object-cover object-center"
                src="/images/Santuario1.jpeg"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <figcaption className="mt-2 flex items-center gap-2">
              <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
              <span className="caption-editorial">Domo TreePod entre los árboles</span>
            </figcaption>
          </figure>

          {/* Columna de texto: el titular muerde la foto */}
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 relative lg:pt-14">
            {/* Numeral fantasma */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-8 -left-2 font-display italic text-[clamp(6rem,16vw,13rem)] leading-none text-[#1E1B16]/[0.05]"
            >
              01
            </span>

            <h2 className="display-lg text-[#1E1B16] relative z-10 lg:-ml-28 lg:bg-white lg:px-4 lg:py-3 lg:inline-block">
              Un refugio propio{" "}
              <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                en medio del bosque
              </span>
            </h2>

            <div className="mt-8 space-y-6 text-[#1E1B16]/85 text-base md:text-[17px] leading-relaxed lg:px-4">
              <p>
                <strong>Solo tú y el bosque:</strong> un domo geodésico privado, sin vecinos al lado
                ni ruido. Desde adentro ves el bosque por los ventanales.
              </p>
              <p>
                <strong>Noches de estrellas:</strong> lejos de las luces de la ciudad, el cielo se
                llena de estrellas y lo único que escuchas es la calma del valle.
              </p>
            </div>

            {/* Foto secundaria desalineada a propósito */}
            <figure className="w-3/5 ml-auto mt-10">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  alt="Cama matrimonial del domo"
                  className="object-cover object-center"
                  src="/images/Santuario2.jpg"
                  fill
                  sizes="(max-width: 1024px) 60vw, 22vw"
                />
              </div>
              <figcaption className="mt-2 flex items-center gap-2">
                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                <span className="caption-editorial">Cama matrimonial del domo</span>
              </figcaption>
            </figure>

            <div className="mt-10 lg:px-4">
              <Link href="/disponibilidad" className={btnPrimary}>
                Reservar mi domo
              </Link>
              <p className="caption-editorial mt-4">
                Ves la disponibilidad y el precio al instante, sin compromiso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
