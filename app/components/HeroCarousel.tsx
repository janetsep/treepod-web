"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [activo, setActivo] = useState(0);
  const [montarResto, setMontarResto] = useState(false);

  useEffect(() => {
    // Quien pidió menos animación se queda con la portada fija.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const alta = setTimeout(() => setMontarResto(true), 2500);
    const avance = setInterval(() => setActivo((i) => (i + 1) % SLIDES.length), INTERVALO);
    return () => {
      clearTimeout(alta);
      clearInterval(avance);
    };
  }, []);

  return (
    <>
      {SLIDES.map((s, i) => {
        if (i > 0 && !montarResto) return null;
        return (
          <Image
            key={s.src}
            src={s.src}
            alt={i === 0 ? s.alt : ""}
            aria-hidden={i === 0 ? undefined : true}
            fill
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : "auto"}
            quality={72}
            sizes="100vw"
            style={{ objectPosition: s.position }}
            className={`object-cover transition-opacity duration-[1400ms] ease-in-out ${
              i === activo ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}

      {/* Marcadores: barras finas, la activa en cyan. Sirven además para saltar de foto. */}
      <div className="absolute bottom-6 right-5 md:right-10 z-20 flex gap-1.5" role="group" aria-label="Fotos de portada">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setActivo(i)}
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
