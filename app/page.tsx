import type { Metadata } from 'next';
import NotForEveryone from "./components/NotForEveryone";

export const metadata: Metadata = {
    alternates: {
        canonical: '/',
    },
};
import Hero from "./components/Hero";
import TreePodDomes from "./components/TreePodDomes";
import DomoAmenities from "./components/DomoAmenities";
import News from "./components/News";
import Testimonios from "./components/Testimonios";
import Ubicacion from "./components/Ubicacion";
import Galeria from "./components/Galeria";
import ValueBand from "./components/ValueBand";
import ComoReservar from "./components/ComoReservar";
import FAQ from "./components/FAQ";
import CinematicSection from "./components/CinematicSection";

import TrackView from "./components/TrackView";

// Orden de la página pensado como embudo: enganche emocional (hero + cinemática),
// precio y confianza de inmediato, el producto (domos), prueba social ANTES de la
// mitad de la página, beneficios, temporada, cómo reservar y cierre con FAQ/ubicación.
// El blog (News) va al final: es contenido de apoyo, no de conversión. El botón de
// reservar siempre visible en mobile lo aporta StickyReservar (global, con precio).
export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <TrackView eventName="view_home" />
      <Hero />
      <ValueBand />

      <CinematicSection
        image="/images/Galeria/Domo3noche.jpeg"
        alt="Domo TreePod iluminado de noche en el bosque nativo"
        eyebrow="La experiencia"
        title={<>Tu refugio bajo las estrellas,<br className="hidden md:block" /> lejos del ruido del mundo</>}
        text="Domos cálidos y bien equipados, rodeados de naturaleza real. Sin ruido, sin frío, sin apuro."
        ctaText="Ver disponibilidad"
        ctaHref="/disponibilidad"
      />

      <div className="space-y-0">
        <div id="domos" className="reveal"><TreePodDomes /></div>
        <div id="reviews" className="reveal"><Testimonios /></div>
        <div id="concepto" className="reveal"><NotForEveryone /></div>
        <CinematicSection
          image="/images/Galeria/domopiscinainvierno.jpg"
          alt="Domos TreePod en invierno, a pasos de la nieve"
          eyebrow="Invierno en Las Trancas"
          title={<>A pasos de la nieve de<br className="hidden md:block" /> Nevados de Chillán</>}
          text="Vuelve del cerro a una cama tibia y una estufa a pellet que mantiene tu domo cálido toda la noche."
          ctaText="Ver disponibilidad"
          ctaHref="/disponibilidad"
        />
        <div id="servicios" className="reveal"><DomoAmenities /></div>
        <div id="como-reservar" className="reveal"><ComoReservar /></div>
        {/* Sección de tarifas removida - se maneja desde admin */}
        {/* <div id="galeria"><Galeria /></div> */}
        <div id="faq" className="reveal"><FAQ /></div>
        <div id="contacto" className="reveal"><Ubicacion /></div>
        <div id="news" className="reveal"><News /></div>
      </div>
    </main>
  );
}
