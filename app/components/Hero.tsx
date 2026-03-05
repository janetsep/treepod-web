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
    { src: "/images/hero/interior-domo-acogedor-83-3.jpg", alt: "Vistas al bosque nativo desde el interior del domo" },
    { src: "/images/hero/interior-domo-acogedor-105-2.jpg", alt: "Cama matrimonial acogedora con vistas al bosque nativo" },
    { src: "/images/hero/interior-domo-acogedor-79-2.jpg", alt: "Detalles del diseño interior cálido y auténtico" },
    { src: "/images/hero/interior-domo-acogedor-95-2.jpg", alt: "Experiencia de descanso profundo en el bosque" },
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

        {/* Cambio #1: Hero Rating Badge (Visibilidad Máxima) */}
        <div
          onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className="hero-badge animate-fade-in-up cursor-pointer mb-10 md:mb-14 group relative overflow-hidden"
        >
          {/* Brillo dinámico al pasar el ratón */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:scale-[1.03]">
            <span className="star text-primary flex">
              ★★★★★
            </span>
            <div className="w-[1px] h-4 bg-primary/20 hidden md:block"></div>
            <span className="rating-text font-black tracking-widest text-[#001D2D] md:text-[14px]">
              4.9/5 · <span className="opacity-60">+200 Huéspedes Felices</span>
            </span>
          </div>
        </div>



        <h1 className="h1-display mb-12 md:mb-20 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white">
          <span className="!text-white">Domo Geodésico en</span><br />
          <span className="text-primary drop-shadow-[0_4px_12px_rgba(0,0,0,1)] italic block mt-6 md:mt-10 !font-black">Valle Las Trancas</span>
        </h1>




        {/* Invitación Elegante (Sin Estilo Botón) */}
        <button
          onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
          className="group relative flex flex-col items-center gap-4 transition-all duration-500 hover:scale-105 mt-16 md:mt-24 mb-32"
        >
          <span className="text-white text-[14px] md:text-[16px] font-black tracking-[0.5em] uppercase drop-shadow-2xl">
            CONOCER NUESTRO GLAMPING
          </span>
          {/* Línea decorativa Cyan C que crece al hover */}
          <div className="w-16 h-[3px] bg-primary transition-all duration-500 group-hover:w-48 group-hover:shadow-[0_0_15px_rgba(0,173,239,0.8)]"></div>
        </button>

        {/* Aura: Animated Scroll Mouse - Visible on All Devices to prevent False Floor */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-90 cursor-pointer group hover:opacity-100 transition-opacity z-20"
          onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-9 h-14 border-[3px] border-white rounded-full flex justify-center pt-2 group-hover:border-primary transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.6)] backdrop-blur-xl bg-black/50 ring-4 ring-white/5">
            <div className="w-2 h-4 bg-primary rounded-full animate-scroll shadow-[0_0_10px_rgba(0,173,239,0.8)]"></div>
          </div>
          <ChevronDown className="text-white w-6 h-6 animate-bounce mt-1 drop-shadow-lg" />
        </div>


      </div>
      {/* Script principal de Elfsight cargado con prioridad */}
      <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
    </section>
  );
}
