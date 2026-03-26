"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Galeria() {
  const images = [
    { src: "/images/real/NOdomoaereo.jpeg", alt: "Vista aérea de los domos" },
    { src: "/images/Galeria/domonieve2.jpeg", alt: "Domo en la nieve" },
    { src: "/images/wellness/Tinaja3.jpeg", alt: "Tinaja privada" },
    { src: "/images/interiors/interior-domo-acogedor-78-2.jpg", alt: "Interior del domo" },
    { src: "/images/interiors/interior-domo-acogedor-84-2.jpg", alt: "Cocina equipada" },
    { src: "/images/Galeria/lastrancas-exterior-domo-14-2.jpg", alt: "Acceso al domo" },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="py-24 max-w-7xl mx-auto text-center px-4" id="galeria">
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Espacios <span className="text-primary italic">reales</span>, tal como los encontrarás.
        </h2>
        <p className="text-text-sub text-lg md:text-xl font-bold">
          Imágenes auténticas de la experiencia TreePod. Sin filtros, solo la naturaleza y el refugio.
        </p>
      </div>

      {/* Grid de Imágenes Locales */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-24">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group border border-black/5">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-[2s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-16 border-t border-black/5">
        <div className="inline-block mb-10">
          <span className="text-primary text-xs font-black tracking-[0.3em] uppercase bg-primary/5 px-6 py-2 rounded-full border border-primary/10">Momentos Compartidos</span>
        </div>
        {/* Elfsight Photo Gallery | Galeria de Fotos */}
        <div
          className="elfsight-app-95014e6a-2fd5-4219-b0c5-e50cd23e4e72"
          data-elfsight-app-lazy
        ></div>
      </div>
    </section>
  );
}
