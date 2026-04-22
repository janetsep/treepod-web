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

import TrackView from "./components/TrackView";

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <TrackView eventName="view_home" />
      <Hero />
      <div className="space-y-0">
        <div id="concepto"><NotForEveryone /></div>
        <div id="domos"><TreePodDomes /></div>
        <div id="servicios"><DomoAmenities /></div>
        <div id="reviews"><Testimonios /></div>
        <div id="news"><News /></div>
        {/* Sección de tarifas removida - se maneja desde admin */}
        {/* <div id="galeria"><Galeria /></div> */}
        <div id="contacto"><Ubicacion /></div>
      </div>
    </main>
  );
}
