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
          image="/images/real/NODomoPrimavera.jpg"
          alt="Domo geodésico TreePod rodeado de bosque nativo en primavera"
          eyebrow="La experiencia"
          title={<>El bosque empieza<br className="hidden md:block" /> al abrir tu puerta</>}
          text="Un domo geodésico privado entre los árboles, con la montaña siempre cerca."
          ctaText="Ver disponibilidad y precio"
          ctaHref="/disponibilidad#reservar"
          photoCaption="Domo TreePod en primavera, Valle Las Trancas"
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
