import Image from "next/image";
import Link from "next/link";
import SectionFolio from "./SectionFolio";
import { btnPrimary } from "./deco/cta";

const imageBlurDataURL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4JyBoZWlnaHQ9JzYnPjxyZWN0IHdpZHRoPSc4JyBoZWlnaHQ9JzYnIGZpbGw9JyNlOGU1ZGYnLz48L3N2Zz4=";

// La foto y el texto se mantienen en columnas independientes: el domo debe verse
// completo y el titular nunca puede invadir ni quedar cortado por la imagen.
export default function TreePodDomes() {
  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 01" label="Tu domo" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-10 gap-y-10 items-center">
          <figure className="col-span-12 lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E5DF]">
              <Image
                alt="Domo geodésico bajo TreePod integrado en el bosque nativo"
                className="object-cover object-[center_85%]"
                src="/images/real/domo-bajo-bosque.jpg"
                fill
                placeholder="blur"
                blurDataURL={imageBlurDataURL}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <figcaption className="mt-2 flex items-center gap-2">
              <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
              <span className="caption-editorial">Domo bajo TreePod entre robles y lupinos</span>
            </figcaption>
          </figure>

          <div className="col-span-12 lg:col-span-6 relative lg:py-8">
            {/* Numeral fantasma */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-8 -left-2 font-display italic text-[clamp(6rem,16vw,13rem)] leading-none text-[#1E1B16]/[0.05]"
            >
              01
            </span>

            <h2 className="display-lg text-[#1E1B16] relative z-10">
              Un domo propio{" "}
              <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                en medio del bosque
              </span>
            </h2>

            <div className="mt-8 space-y-6 text-[#1E1B16]/85 text-base md:text-[17px] leading-relaxed">
              <p>
                <strong>Tu espacio propio:</strong> un domo geodésico privado entre los árboles.
                Desde adentro ves el bosque por las panorámicas.
              </p>
              <p>
                <strong>Noches de estrellas:</strong> lejos de las luces de la ciudad, el cielo se
                llena de estrellas sobre el valle.
              </p>
            </div>

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

            <div className="mt-10">
              <Link href="/disponibilidad#reservar" className={btnPrimary}>
                Ver disponibilidad y precio
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
