"use client";

import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";


export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Blur placeholder para evitar fondo gris durante carga
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

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
              priority={index < 2} // Carga prioritaria para las 2 primeras para evitar parpadeo
              loading={index < 2 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={blurDataURL}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Darkening overlays for maximum text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70 md:from-black/50 md:via-transparent md:to-black/60 z-10"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex flex-col justify-center items-center text-center">

        {/* Social Proof Badge - Hidden on mobile */}
        <div
          onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className="hero-badge group !hidden lg:flex"
        >
          <span className="star">⭐</span>
          <span className="rating-text">4.9/5 - 200+ HUÉSPEDES</span>
        </div>



        <h1 className="h1-display mb-8 md:mb-12 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] max-w-5xl animate-fade-in-up delay-100 !text-white !text-2xl sm:!text-3xl md:!text-5xl lg:!text-7xl !leading-[1.3] sm:!leading-[1.2] font-bold px-4 sm:px-0">
          <span className="block mb-2">Glamping en Valle Las Trancas:</span>
          <span className="block mb-4"> domos con tinaja privada</span>
          <span className="text-[#00ADEF] italic-display block mt-2 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)] !text-2xl sm:!text-3xl md:!text-6xl lg:!text-7xl">
            en el bosque nativo.
          </span>
        </h1>

        <p className="text-white text-base sm:text-lg md:text-xl font-semibold mb-12 animate-fade-in-up delay-200 tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] max-w-3xl bg-black/10 backdrop-blur-[2px] px-4 sm:px-6 py-3 sm:py-2 rounded-full border border-white/10 italic leading-relaxed">
          Duerme en una cama increíble sin pasar una gota de frío.
        </p>

        <div className="animate-fade-in-up delay-300 mb-16">
          <Link 
            href="/disponibilidad"
            className="cta-hero group"
          >
            Reservar mi escapada ahora
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>




        {/* Aura: Animated Scroll Mouse - Moved down to avoid overlapping the CTA */}
        <div
          className="flex flex-col items-center gap-2 opacity-90 cursor-pointer group hover:opacity-100 transition-opacity mt-8 mb-4 scale-110"
          onClick={() => document.getElementById('domos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-8 h-12 border-[2.5px] border-white rounded-full flex justify-center pt-2 group-hover:border-primary transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.4)] backdrop-blur-sm bg-black/10">
            <div className="w-1.5 h-3 bg-white rounded-full animate-scroll shadow-[0_0_8px_rgba(255,255,255,1)]"></div>
          </div>
          <ChevronDown className="text-white w-5 h-5 animate-bounce mt-1 drop-shadow-md" />
        </div>


      </div>
      {/* Script principal de Elfsight cargado con prioridad */}
      <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
    </section>
  );
}
