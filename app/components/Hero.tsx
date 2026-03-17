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
    { src: "/images/hero/interior-domo-acogedor-74-2.jpg", alt: "Confort y diseño en cada detalle" },
    { src: "/images/hero/interior-domo-acogedor-28-3.jpg", alt: "Ambiente cálido y acogedor" },
    { src: "/images/hero/domo-treepod-ok-12.jpg", alt: "Arquitectura geodésica única" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
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
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Darkening overlays for maximum text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 md:from-black/50 md:via-transparent md:to-black/60 z-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex flex-col justify-center items-center text-center">

        {/* Cambio #1: Hero Rating Badge (Mejorado Visualmente) */}
        <div
          onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className="hero-badge group"
        >
          <span className="star">⭐⭐⭐⭐⭐</span>
          <span className="rating-text">EXPERIENCIAS REALES</span>
        </div>



        <h1 className="h1-display mb-6 md:mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white !text-2xl md:!text-5xl lg:!text-6xl !leading-tight">
          Duerme en medio del bosque, <br className="hidden md:block" />
          en una cama increíble <br className="hidden md:block" />
          <span className="text-primary italic-display">sin pasar una gota de frío.</span>
        </h1>

        <p className="text-white text-base md:text-xl font-medium mb-12 animate-fade-in-up delay-200 tracking-wide opacity-90 drop-shadow-md max-w-2xl">
          Tu propio refugio panorámico en Valle Las Trancas.
        </p>

        <div className="animate-fade-in-up delay-300">
          <Link 
            href="/disponibilidad"
            className="inline-flex items-center justify-center px-10 py-5 bg-primary text-white font-black text-sm md:text-lg uppercase tracking-[0.2em] rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 shadow-[0_20px_40px_-10px_rgba(0,173,239,0.5)] border-2 border-white/20"
          >
            Reservar mi escapada ahora
          </Link>
        </div>




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
