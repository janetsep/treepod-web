import type { Metadata } from 'next';
import NotForEveryone from "./components/NotForEveryone";

export const metadata: Metadata = {
    alternates: {
        canonical: '/',
    },
};
import Hero from "./components/Hero";
import TreePodDomes from "./components/TreePodDomes";
import Testimonios from "./components/Testimonios";
import Ubicacion from "./components/Ubicacion";
import ValueBand from "./components/ValueBand";
import FAQ from "./components/FAQ";
import AvisoFiestasPatrias from "./components/AvisoFiestasPatrias";
import CinematicSection from "./components/CinematicSection";
import FinalReserveCta from "./components/FinalReserveCta";
import GeoDivider from "./components/deco/GeoDivider";
import { FaqJsonLd } from "./components/JsonLdSchemas";

import TrackView from "./components/TrackView";

// Orden de la página pensado como embudo: hero con reserva, confianza inmediata,
// razones para elegir TreePod, experiencia/fotos, reseñas, ubicación, preguntas y
// un CTA final. Blog y detalle de servicios viven en sus rutas propias.
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
      <AvisoFiestasPatrias />

      <div className="space-y-0">
        <div id="por-que-treepod" className="reveal"><NotForEveryone /></div>
        <GeoDivider left="20%" />
        <CinematicSection
          image="/images/Galeria/Domo3noche.jpeg"
          alt="Domo TreePod iluminado de noche en el bosque nativo"
          eyebrow="La experiencia"
          title={<>Tu domo bajo las estrellas,<br className="hidden md:block" /> en el bosque nativo</>}
          text="Domos cálidos y bien equipados en medio del bosque. Sin frío y sin apuro."
          ctaText="Ver disponibilidad y precio"
          ctaHref="/disponibilidad#reservar"
          photoCaption="Domo de noche, Valle Las Trancas"
        />
        <GeoDivider left="32%" />
        <div id="domos" className="reveal"><TreePodDomes /></div>
        <GeoDivider left="44%" />
        <div id="reviews" className="reveal"><Testimonios /></div>
        <GeoDivider left="55%" />
        <div id="contacto" className="reveal"><Ubicacion /></div>
        <GeoDivider left="72%" />
        <div id="faq" className="reveal"><FAQ /></div>
        <GeoDivider left="88%" />
        <FinalReserveCta />
      </div>
    </main>
  );
}
