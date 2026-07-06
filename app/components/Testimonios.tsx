import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";

// Artículo 02 — el dato real como titular: "4,9" gigante en Fraunces con la marca
// de kilómetro al costado. Reseñas DINÁMICAS con Elfsight (se actualizan solas
// desde Google): el widget NO se toca. platform.js se carga una sola vez de forma
// global (layout.tsx, lazyOnload) y data-elfsight-app-lazy difiere el widget hasta
// que entra en viewport.
export default function Testimonios() {
  return (
    <section className="bg-[#F7F3EC] py-14 md:py-20" id="testimonios">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 02" label="Huéspedes" note="Estas aguas tienen fama desde 1869" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className="sr-only">Lo que dicen nuestros huéspedes</h2>
              <div className="flex items-start gap-3" aria-hidden="true">
                <TriBullet className="w-4 h-3.5 text-[#00ADEF] shrink-0 mt-5" />
                <span className="font-display font-medium text-[clamp(5rem,10vw,9rem)] leading-none tabular-nums text-[#1E1B16]">
                  4,9
                </span>
              </div>
              <p className="caption-editorial mt-3">59 reseñas verificadas en Google</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="w-full relative min-h-[320px] md:min-h-[500px]">
              <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab" data-elfsight-app-lazy></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
