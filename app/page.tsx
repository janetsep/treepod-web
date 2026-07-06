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
import ValueBand from "./components/ValueBand";
import ComoReservar from "./components/ComoReservar";
import FAQ from "./components/FAQ";
import CinematicSection from "./components/CinematicSection";
import GeoDivider from "./components/deco/GeoDivider";
import { FaqJsonLd } from "./components/JsonLdSchemas";

import TrackView from "./components/TrackView";

// Orden de la página pensado como embudo: enganche emocional (hero + cinemática),
// precio y confianza de inmediato, el producto (domos), prueba social ANTES de la
// mitad de la página, beneficios, temporada, cómo reservar y cierre con FAQ/ubicación.
// El blog (News) va al final: es contenido de apoyo, no de conversión. El botón de
// reservar siempre visible en mobile lo aporta StickyReservar (global, con precio).
//
// La marca de kilómetro del GeoDivider AVANZA de 8% a 92% (footer) a medida que se
// baja: la página es el camino al Km 72.
export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <TrackView eventName="view_home" />
      {/* FAQPage JSON-LD solo en el home: refleja las preguntas visibles de <FAQ /> */}
      <FaqJsonLd />
      <Hero />
      <GeoDivider left="8%" />
      <ValueBand />

      <CinematicSection
        image="/images/Galeria/Domo3noche.jpeg"
        alt="Domo TreePod iluminado de noche en el bosque nativo"
        eyebrow="La experiencia"
        title={<>Tu refugio bajo las estrellas,<br className="hidden md:block" /> en el bosque nativo</>}
        text="Domos cálidos y bien equipados en medio del bosque. Sin frío y sin apuro."
        ctaText="Ver disponibilidad"
        ctaHref="/disponibilidad"
        photoCaption="Domo de noche, Valle Las Trancas"
      />

      <div className="space-y-0">
        <div id="domos" className="reveal"><TreePodDomes /></div>
        <GeoDivider left="20%" />
        <div id="reviews" className="reveal"><Testimonios /></div>
        <GeoDivider left="32%" />
        <div id="concepto" className="reveal"><NotForEveryone /></div>
        <GeoDivider left="44%" />
        <CinematicSection
          image="/images/Galeria/domopiscinainvierno.jpg"
          alt="Domos TreePod en invierno, a 12 minutos de la nieve"
          eyebrow="Invierno en Las Trancas"
          title={<>A 12 minutos de la nieve de<br className="hidden md:block" /> Nevados de Chillán</>}
          text="Pasas el día en la nieve o en las termas y vuelves a tu propio refugio en el bosque, con todo listo."
          ctaText="Ver disponibilidad"
          ctaHref="/disponibilidad"
          stat="12"
          statCaption="minutos a Nevados de Chillán"
          photoCaption="Invierno en el valle, Las Trancas"
        />
        <GeoDivider left="55%" />
        <div id="servicios" className="reveal"><DomoAmenities /></div>
        <GeoDivider left="66%" />
        <div id="como-reservar" className="reveal"><ComoReservar /></div>
        {/* Sección de tarifas removida - se maneja desde admin */}
        <GeoDivider left="76%" />
        <div id="faq" className="reveal"><FAQ /></div>
        <GeoDivider left="84%" />
        <div id="contacto" className="reveal"><Ubicacion /></div>
        <GeoDivider left="88%" />
        <div id="news" className="reveal"><News /></div>
      </div>
    </main>
  );
}
