import GoogleMapsSection from './GoogleMapsSection';
import { Mountain, Utensils, Fuel, Trees, Wine } from "lucide-react";

export default function Ubicacion() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-white border-t border-black/[0.06]" id="ubicacion">

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Info Side - Pluma Style */}
          <div className="lg:w-1/3 space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Estratégico</span>
              </div>
              <h2 className="h2-display leading-tight text-text-main">
                En medio de la nada, pero a un <span className="text-primary italic-display">paso de todo</span> lo que importa
              </h2>
            </div>

            <div className="space-y-8 pt-4">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Trees className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">Tu refugio secreto (pero fácil de llegar)</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">Estás en el centro del valle, pero escondido en la profundidad del bosque nativo. Nadie te molestará y no tendrás que sufrir caminos imposibles para llegar.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Mountain className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">A solo 12 minutos de la nieve y las termas</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">Despierta, tómate un café y en lo que duran tus canciones favoritas en el auto ya estás esquiando o relajándote en el agua termal.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Utensils className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">Come increíble (sin tener que cocinar)</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">¿Cero ganas de ensuciar ollas? Perfecto. Estás a un paso de los mejores restaurantes típicos del valle para ir a comer a lo grande.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Wine className="text-primary w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-base md:text-lg uppercase tracking-tight text-text-main">¿Olvidaste algo? Cero estrés</h4>
                  <p className="text-sm md:text-base text-text-sub font-bold">Tienes minimarkets justo al lado. Si se acaba el hielo, el vino o necesitas cualquier cosa básica, lo resuelves en un par de minutos.</p>
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
                A 12 min del centro de ski
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

