"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown, Star } from "lucide-react";
import BookingWidget from "./BookingWidget";


export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Solo montamos las imágenes ya "alcanzadas" por el carrusel (más la siguiente
  // precargada). Evita descargar las 6 fotos del hero al cargar la portada: la 1ª
  // es el LCP (priority) y el resto entra de a poco cada 5s. Mucho más liviano.
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0, 1]));

  // Blur placeholder con tonos verde-bosque (matchea hero images, no gris)
  // Generado como JPEG 4x4 con tonos #1a2e1d / #0d1a10 (sombra de bosque nativo)
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAEAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAA//9k=";

  const heroImages = [
    { src: "/images/hero/IMG_8987.JPG", alt: "Tu refugio en medio del bosque nativo" },
    { src: "/images/hero/domo-iluminado-noche.jpg", alt: "Domo TreePod iluminado bajo las estrellas" },
    { src: "/images/hero/domonieve2.jpeg", alt: "Domo TreePod en invierno nevado" },
    { src: "/images/hero/Las Trancas Bosque Nativo 4.jpeg", alt: "Entorno natural del bosque nativo" },
    { src: "/images/hero/domo-treepod-camara-18-2.jpg", alt: "Vista interior acogedora" },
    { src: "/images/hero/hero-night-2.jpg", alt: "Noche mágica en el bosque" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const next = (prev + 1) % heroImages.length;
        const after = (next + 1) % heroImages.length;
        // Precarga la siguiente para que el cross-fade no muestre el blur.
        setLoadedIndices((s) => {
          if (s.has(next) && s.has(after)) return s;
          const n = new Set(s);
          n.add(next);
          n.add(after);
          return n;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-white overflow-hidden py-20">
      {/* Background Slideshow */}
      <div className="absolute inset-0 bg-background-dark">
        {heroImages.map((img, index) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
          >
            {loadedIndices.has(index) && (
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={index === 0} // Solo la 1ª (es el LCP); las demás cargan al avanzar el carrusel
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                placeholder="blur"
                blurDataURL={blurDataURL}
                quality={75}
                className="object-cover object-center ken-burns"
                sizes="100vw"
              />
            )}
          </div>
        ))}

        {/* Darkening overlays for maximum text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 md:from-black/50 md:via-transparent md:to-black/60 z-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex flex-col justify-center items-center text-center py-24">

        {/* Calificación real (Google) */}
        <div
          onClick={() => document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 cursor-pointer hover:bg-white/15 transition-colors animate-fade-in-up"
        >
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-[13px] font-bold tracking-wide">4,9 · 59 reseñas verificadas</span>
        </div>

        <h1 className="h1-display mb-5 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] max-w-5xl animate-fade-in-up delay-100 !text-white !text-[1.7rem] sm:!text-4xl md:!text-5xl lg:!text-7xl !leading-[1.15] font-bold px-1 sm:px-0">
          <span className="block">Glamping en Valle Las Trancas:</span>
          <span className="text-[#00ADEF] italic-display block mt-1.5 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)] !text-[1.7rem] sm:!text-4xl md:!text-6xl lg:!text-7xl">
            domos en el bosque nativo.
          </span>
        </h1>

        <p className="text-white text-sm sm:text-lg md:text-xl font-medium mb-8 animate-fade-in-up delay-200 tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] max-w-2xl">
          Duerme en una cama increíble sin pasar una gota de frío.
        </p>

        {/* Buscador de reserva integrado (rediseño) */}
        <div className="w-full max-w-3xl animate-fade-in-up delay-300">
          <BookingWidget embedded />
        </div>

        {/* Fila de confianza: sin repetir lo que ya dice la nota del buscador */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-white/85 text-[12px] md:text-[13px] font-medium animate-fade-in-up delay-300">
          <span>Mejor precio directo</span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">Registro SERNATUR N° 36806</span>
        </div>

        {/* Indicador de scroll */}
        <div
          className="hidden md:flex flex-col items-center gap-2 opacity-90 cursor-pointer group hover:opacity-100 transition-opacity mt-8"
          onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-8 h-12 border-[2.5px] border-white rounded-full flex justify-center pt-2 group-hover:border-primary transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.4)] backdrop-blur-sm bg-black/10">
            <div className="w-1.5 h-3 bg-white rounded-full animate-scroll shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
          </div>
          <ChevronDown className="text-white w-5 h-5 animate-bounce mt-1 drop-shadow-md" />
        </div>

      </div>
    </section>
  );
}
