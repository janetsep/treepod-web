import Image from "next/image";
import BookingWidget from "./BookingWidget";
import GeoArc from "./deco/GeoArc";

// Portada de revista: UNA foto fija (una revista tiene una portada; además es el
// único priority de la página → mejor LCP que el carrusel de 6 fotos anterior),
// masthead con los datos reales del lugar, titular abajo-izquierda a sangre y la
// ficha de reserva como recorte de papel a la derecha.
export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#1E1B16] text-white">
      <Image
        src="/images/hero/IMG_8987.JPG"
        alt="Domo TreePod en medio del bosque nativo de Valle Las Trancas"
        fill
        priority
        fetchPriority="high"
        quality={75}
        sizes="100vw"
        className="object-cover object-center ken-burns"
      />

      {/* Scrim cálido (charcoal, nunca negro stock): solo el 55% inferior */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#1E1B16]/85 via-[#1E1B16]/15 to-transparent"
        aria-hidden="true"
      />
      {/* Velo superior fino para el navbar transparente */}
      <div
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#1E1B16]/50 to-transparent"
        aria-hidden="true"
      />

      {/* Arco geodésico detrás de la ficha de reserva */}
      <GeoArc className="absolute bottom-0 right-0 w-[420px] max-w-[70vw] text-white/25 pointer-events-none" />

      {/* Pie de foto vertical, borde derecho */}
      <span
        className="absolute right-3 bottom-24 z-10 hidden md:block [writing-mode:vertical-rl] text-[10px] tracking-[0.12em] uppercase text-white/70"
        aria-hidden="true"
      >
        Domo en bosque nativo, Valle Las Trancas
      </span>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-10 min-h-[100dvh] flex flex-col">
        {/* Masthead: cabecera tipográfica con los datos duros del camino */}
        <div className="mt-28 md:mt-36 flex flex-wrap justify-between items-baseline gap-x-6 gap-y-1 border-b border-white/30 pb-3 dato text-white">
          <span>Valle Las Trancas — Ñuble, Chile</span>
          <span className="hidden sm:inline">Ruta N-55 · Km 72</span>
          <a href="#reviews" className="hover:text-[#00ADEF] transition-colors">
            4,9 · 209 reseñas
          </a>
        </div>

        {/* Cuerpo de portada: titular a sangre + ficha de reserva */}
        <div className="flex-1 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-8 items-end content-end pb-8 pt-10">
          <div className="col-span-12 lg:col-span-8">
            {/* !text-white: la regla base h1..h6 de globals.css va sin capa y le gana
                a las utilidades; misma convención que el resto del sitio.
                Tamaño algo menor que display-xl para que la ficha de reserva quede
                dentro del primer viewport en desktop (prioridad de conversión). */}
            <h1 className="font-normal text-[clamp(2.4rem,7vw,6.5rem)] leading-[0.98] tracking-[-0.02em] !text-white drop-shadow-[0_2px_20px_rgba(30,27,22,0.7)]">
              <span className="block">Glamping en Valle Las Trancas:</span>
              <span className="block italic text-[#00ADEF]">domos en el bosque nativo.</span>
            </h1>
            <p className="lead text-white/90 mt-5 max-w-xl drop-shadow-[0_2px_12px_rgba(30,27,22,0.7)]">
              Domos geodésicos cálidos en pleno bosque, a minutos de las termas y la nieve. Llegas y
              todo está listo.
            </p>
            {/* Fila de confianza: sin repetir lo que ya dice la nota de la ficha */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/80 text-[12px] font-medium">
              <span>Mejor precio directo</span>
              <span className="text-white/40" aria-hidden="true">
                ·
              </span>
              <span>Registro SERNATUR N° 36806</span>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 self-end">
            <BookingWidget embedded />
          </div>
        </div>
      </div>
    </section>
  );
}
