import NotForEveryone from "./components/NotForEveryone";
import Hero from "./components/Hero";
import TreePodDomes from "./components/TreePodDomes";
import DomoAmenities from "./components/DomoAmenities";
import News from "./components/News";
import Testimonios from "./components/Testimonios";
import Ubicacion from "./components/Ubicacion";
import Galeria from "./components/Galeria";
import SeasonRates from "./components/SeasonRates";

export default function Home() {
  return (
    <main className="min-h-screen font-display">
      <Hero />
      <div className="space-y-0">
        <div id="concepto"><NotForEveryone /></div>
        <div id="domos"><TreePodDomes /></div>
        <div id="servicios"><DomoAmenities /></div>
        <div id="reviews"><Testimonios /></div>
        <div id="news"><News /></div>
        <div id="tarifas"><SeasonRates /></div>
        {/* <div id="galeria"><Galeria /></div> */}
        <div id="contacto"><Ubicacion /></div>
      </div>
    </main>
  );
}
