"use client";

import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";


export default function Hero() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    { src: "/images/hero/interior-domo-acogedor-105-2.jpg", alt: "Refugio cálido diseñado para el descanso profundo en TreePod" },
    { src: "/images/hero/interior-domo-acogedor-79-2.jpg", alt: "Cama matrimonial con vistas al bosque nativo de Las Trancas" },
    { src: "/images/hero/interior-domo-acogedor-21-2.jpg", alt: "Detalles en madera y confort moderno en la cordillera" },
    { src: "/images/hero/interior-domo-acogedor-95-2.jpg", alt: "Ventanales panorámicos que integran la naturaleza" },
    { src: "/images/hero/interior-domo-acogedor-28-3.jpg", alt: "Espacios luminosos y armónicos dentro del domo" },
    { src: "/images/hero/interior-domo-acogedor-74-2.jpg", alt: "Vistas directas al bosque desde la comodidad de tu refugio" },
    { src: "/images/hero/interior-domo-acogedor-83-3.jpg", alt: "Diseño único que combina tranquilidad y elegancia" },
    { src: "/images/hero/interior-domo-acogedor-27-2.jpg", alt: "Fachada exterior del domo integrada en el paisaje" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative h-screen min-h-[700px] text-white overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 bg-background-dark">
        {heroImages.map((img, index) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Darkening overlays for maximum text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 md:from-black/50 md:via-transparent md:to-black/60 z-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex flex-col justify-center items-center text-center pt-24 md:pt-32 pb-32">

        {/* Badge with high contrast */}
        <span className="subtitle-caps mb-8 border-2 border-primary px-8 py-2.5 rounded-full bg-black/40 backdrop-blur-md shadow-2xl animate-fade-in-up !text-white !font-black !text-[12px]">
          ★ Opiniones verificadas Google · Las Trancas, Chile
        </span>



        <h1 className="h1-display mb-6 md:mb-10 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
          <span className="!text-white">Domo Geodésico en</span><br />
          <span className="text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,1)] italic block mt-3 !font-black">Valle Las Trancas</span>
        </h1>

        <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 md:mb-20 max-w-3xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
          Bosque nativo, privacidad real, comodidad sin concesiones.
          <br className="hidden md:block" />
          Domo geodésico con vistas directas a la naturaleza.
        </p>

        <div className="flex flex-col w-full max-w-sm mx-auto md:max-w-none md:flex-row md:justify-center gap-4 animate-fade-in-up delay-300">
          <button
            onClick={() => router.push('/disponibilidad')}
            className="w-full md:w-64 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/30 text-sm tracking-widest uppercase flex items-center justify-center gap-2"
          >
            <span>Ver Disponibilidad</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full md:w-64 border-2 border-white/70 hover:border-white text-white font-bold py-4 rounded-full transition-all transform hover:-translate-y-1 text-sm tracking-widest uppercase backdrop-blur-sm bg-white/10 hover:bg-white/20"
          >
            Conocer los Domos
          </button>

        </div>

        {/* Aura: Animated Scroll Mouse - Visible on All Devices to prevent False Floor */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-90 cursor-pointer group hover:opacity-100 transition-opacity z-20"
          onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-7 h-11 border-2 border-white/50 rounded-full flex justify-center pt-2 group-hover:border-primary transition-colors shadow-lg backdrop-blur-sm bg-black/20">
            <div className="w-1 h-2 bg-white rounded-full animate-scroll group-hover:bg-primary"></div>
          </div>
          <ChevronDown className="text-white/50 w-5 h-5 animate-bounce mt-1" />
        </div>


      </div>
      {/* Script principal de Elfsight cargado con prioridad */}
      <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
    </section>
  );
}
