import NotForEveryone from "./components/NotForEveryone";
import Hero from "./components/Hero";
import TreePodDomes from "./components/TreePodDomes";
import SeasonalSelector from "./components/SeasonalSelector";
import DomoAmenities from "./components/DomoAmenities";
import News from "./components/News";
import Testimonios from "./components/Testimonios";
import Ubicacion from "./components/Ubicacion";
import Gallery from "./components/Gallery";

export default function Home() {
  return (
    <main className="min-h-screen font-display">
      <Hero />
      <div className="space-y-0">
        <div id="concepto"><NotForEveryone /></div>

        {/* Separator between Concept and Domes */}
        <div className="container mx-auto px-6 max-w-7xl">
          <hr className="border-t border-black/10" />
        </div>

        <div id="domos"><TreePodDomes /></div>

        <div className="container mx-auto px-6 max-w-7xl">
          <hr className="border-t border-black/10" />
        </div>

        <SeasonalSelector />

        <div className="container mx-auto px-6 max-w-7xl">
          <hr className="border-t border-black/10" />
        </div>

        <div id="servicios"><DomoAmenities /></div>

        <div className="container mx-auto px-6 max-w-7xl">
          <hr className="border-t border-black/10" />
        </div>

        <div id="reviews"><Testimonios /></div>

        <div className="container mx-auto px-6 max-w-7xl">
          <hr className="border-t border-black/10" />
        </div>

        <div id="news"><News /></div>

        <div className="container mx-auto px-6 max-w-7xl">
          <hr className="border-t border-black/10" />
        </div>

        <div id="contacto"><Ubicacion /></div>
      </div>
    </main>
  );
}
