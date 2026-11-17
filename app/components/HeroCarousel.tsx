"use client";

import PhotoImage from "./PhotoImage";
import { useEffect, useRef, useState } from "react";
import { imagePlaceholder } from "@/lib/image-placeholder";

// Carrusel de portada. La versión anterior de 6 fotos se sacó porque cargaba las
// 6 de una y hundía el LCP (73% de las visitas son móviles). Aquí solo la PRIMERA
// foto se carga con prioridad; las demás se montan recién 2,5 s después del
// primer pintado, así el LCP sigue siendo el de una sola imagen.
const SLIDES = [
  {
    src: "/images/Galeria/domo3noche1.jpeg",
    alt: "Domo geodésico elevado iluminado por dentro, de noche, entre los árboles del bosque nativo",
    position: "center 35%",
  },
  {
    src: "/images/hero/domonieve2.jpeg",
    alt: "Domo TreePod cubierto de nieve en el bosque de Valle Las Trancas",
    position: "center",
  },
  {
    src: "/images/hero/domo-iluminado-noche.jpg",
    alt: "Domo iluminado al fondo del bosque nativo al anochecer",
    position: "center",
  },
];

const INTERVALO = 6500;

export default function HeroCarousel() {
  const [{ activo, anterior }, setSlide] = useState({ activo: 0, anterior: 0 });
  const [montarResto, setMontarResto] = useState(false);
  const cargadas = useRef(new Set<number>());
  const seleccionPendiente = useRef<number | null>(null);

  function mostrar(indice: number) {
    setSlide((actual) => actual.activo === indice
      ? actual : { activo: indice, anterior: actual.activo });
  }

  function seleccionar(indice: number) {
    setMontarResto(true);
    if (cargadas.current.has(indice)) {
      seleccionPendiente.current = null;
      mostrar(indice);
    } else {
      seleccionPendiente.current = indice;
    }
  }

  useEffect(() => {
    // Quien pidió menos animación se queda con la portada fija.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const alta = setTimeout(() => setMontarResto(true), 2500);
    // Mantener la foto actual si la siguiente todavía no está descargada y
    // decodificada, también al navegar con una conexión lenta.
    const avance = setInterval(() => {
      setSlide((actual) => {
        const siguiente = (actual.activo + 1) % SLIDES.length;
        return seleccionPendiente.current === null && cargadas.current.has(siguiente)
          ? { activo: siguiente, anterior: actual.activo } : actual;
      });
    }, INTERVALO);
    return () => {
      clearTimeout(alta);
      clearInterval(avance);
    };
  }, []);

  return (
    <>
      {/* La anterior sigue opaca bajo la entrante: el fondo nunca se descubre. */}
      <div className="absolute inset-0 isolate">
        {SLIDES.map((s, i) => {
          if (i > 0 && !montarResto) return null;
          return (
            <PhotoImage
              key={s.src}
              src={s.src}
              alt={i === 0 ? s.alt : ""}
              aria-hidden={i === 0 ? undefined : true}
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "auto"}
              quality={72}
              preview={imagePlaceholder(s.src)}
              onLoad={() => {
                cargadas.current.add(i);
                if (seleccionPendiente.current === i) {
                  seleccionPendiente.current = null;
                  mostrar(i);
                }
              }}
              onError={() => {
                if (seleccionPendiente.current === i) seleccionPendiente.current = null;
              }}
              sizes="100vw"
              style={{ objectPosition: s.position }}
              className="object-cover"
              containerClassName={i === activo
                ? `z-[2] ${activo === anterior ? "opacity-100" : "photo-slide-active"}`
                : i === anterior ? "z-[1] opacity-100" : "z-0 opacity-0"
              }
            />
          );
        })}
      </div>

      {/* Marcadores: barras finas, la activa en cyan. Sirven además para saltar de foto. */}
      <div className="absolute bottom-6 right-5 md:right-10 z-20 flex gap-1.5" role="group" aria-label="Fotos de portada">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            onClick={() => seleccionar(i)}
            aria-label={`Ver foto ${i + 1} de ${SLIDES.length}`}
            aria-current={i === activo}
            className={`h-[3px] w-8 rounded-[1px] transition-colors ${
              i === activo ? "bg-[#00ADEF]" : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </>
  );
}
