import GoogleMapsSection from './GoogleMapsSection';
import { Mountain, Utensils, Fuel } from "lucide-react";

export default function Ubicacion() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-white" id="ubicacion">

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Info Side - Pluma Style */}
          <div className="lg:w-1/3 space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                <span className="text-primary text-[11px] font-bold tracking-[0.2em] uppercase">Estratégico</span>
              </div>
              <h2 className="h2-display leading-[1.0] text-text-main">
                Punto de <br />
                <span className="text-primary italic-display">Partida</span>
              </h2>
            </div>

            <p className="text-text-sub font-bold leading-relaxed text-lg md:text-xl">
              Ubicados en el Km 72 de la ruta a Nevados de Chillán, TreePod te sitúa en el centro del valle, pero te resguarda en la profundidad del bosque nativo.
            </p>

            <div className="space-y-8 pt-4">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Mountain className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">Nevados de Chillán</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">A solo 12 minutos del centro de Ski y termas.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Utensils className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">Gastronomía</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">Rodeados de los mejores restaurantes típicos del valle.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Fuel className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">Servicios</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">Acceso rápido a minimarkets y servicios básicos.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Map Side - Professional Embed */}
          <div className="lg:w-2/3 w-full">
            <div className="relative group">

              {/* The Map Frame */}
              <div className="w-full h-[500px] md:h-[600px] rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white/5 relative">
                <GoogleMapsSection apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} />
              </div>

              {/* Decorative elements to simulate location tracking */}
              <div className="absolute -bottom-4 right-10 text-primary text-[11px] font-black uppercase tracking-[0.3em] drop-shadow-md z-20">
                A 10 min del Centro de Ski
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

