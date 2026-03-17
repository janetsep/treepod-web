"use client";

import Script from "next/script";

export default function Testimonios() {
  return (
    <section className="py-12 md:py-20 bg-white border-t border-black/[0.06]" id="testimonios">
      <div className="container mx-auto px-6 text-center max-w-7xl">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
          <span className="text-primary text-base font-black tracking-[0.2em] uppercase">El escape perfecto, vengas con quien vengas</span>
        </div>

        <h2 className="h2-display mb-10 text-text-main">
          No importa si buscas un fin de semana romántico, un viaje con niños sin estrés o desconectar de la rutina con amigos.
        </h2>

        <p className="text-lg md:text-xl text-text-sub mb-20 max-w-3xl mx-auto leading-relaxed font-bold">
          No nos creas a nosotros, mira lo que dicen quienes ya lo vivieron:
        </p>

        {/* Elfsight Reviews Widget - All-in-One - Standard Load */}
        <div className="w-full relative min-h-[500px]">
          <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab"></div>
        </div>

        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
          defer
        />


      </div>
    </section>
  );
}
