"use client";

import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { trackEvent } from "../lib/analytics";


export default function Hero() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    { src: "/images/exteriors/domo-exterior-arrival.jpg", alt: "Domo geodésico TreePod en Valle Las Trancas rodeado de bosque nativo" },
    { src: "/images/exteriors/domo-iluminado-noche.jpg", alt: "Domo iluminado en la noche, Valle Las Trancas" },
    { src: "/images/hero/interior-domo-acogedor-105-2.jpg", alt: "Interior acogedor del domo con estufa a pellet" },
    { src: "/images/hero/interior-domo-acogedor-79-2.jpg", alt: "Cama matrimonial con vistas al bosque nativo de Las Trancas" },
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

        {/* Subtitle text link without button styles */}
        <button
          onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className="mb-8 animate-fade-in-up text-white font-black text-sm uppercase tracking-widest drop-shadow-md hover:text-white/80 transition-colors cursor-pointer"
        >
          ★ Opiniones verificadas Google · Las Trancas, Chile
        </button>



        <h1 className="h1-display mb-6 md:mb-10 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
          <span className="!text-white">Domo Geodésico en</span><br />
          <span className="text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,1)] italic block mt-3 !font-black">Valle Las Trancas</span>
        </h1>

        <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 md:mb-20 max-w-3xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
          Bosque nativo · Tranquilidad real · Comodidad sin concesiones.
        </p>

        <div className="flex flex-col w-full max-w-sm mx-auto md:max-w-none md:flex-row md:justify-center gap-4 animate-fade-in-up delay-300">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => { trackEvent("click_ver_disponibilidad_home", { origen: "hero" }); router.push('/disponibilidad'); }}
              className="w-full md:w-64 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/30 text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <span>Ver Disponibilidad</span>
              <ArrowRight size={18} />
            </button>
            {/* Precio ancla junto al CTA */}
            <p className="text-white/70 text-xs font-bold tracking-wide">
              Desde <span className="text-white font-black">$98.000</span> / noche · 2 personas
            </p>
          </div>
        </div>

        {/* Botón secundario como link discreto */}
        <button
          onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-4 text-white/60 hover:text-white text-xs tracking-widest uppercase underline underline-offset-4 transition-colors animate-fade-in-up delay-300"
        >
          Conocer los Domos
        </button>

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
