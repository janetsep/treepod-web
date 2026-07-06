import GoogleMapsSection from "./GoogleMapsSection";
import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";

// Artículo 07 — página de mapa con leyenda: la información como tabla de leyenda
// con líneas punteadas y datos cortos tabulares; el mapa en marco de imprenta.
const leyenda = [
  {
    t: "Escondido en el bosque, fácil de encontrar",
    dato: "Km 72",
    d: "Estás en el centro del valle, pero escondido en la profundidad del bosque nativo, con acceso fácil por la ruta principal.",
  },
  {
    t: "A solo 12 minutos de la nieve y las termas",
    dato: "12 min",
    d: "Tómate un café con calma: a 12 minutos en auto están las pistas de ski y las termas.",
  },
  {
    t: "Come rico sin cocinar",
    dato: "a minutos",
    d: "¿Sin ganas de cocinar? A pocos minutos tienes los restaurantes típicos del valle.",
  },
  {
    t: "¿Olvidaste algo? No pasa nada",
    dato: "a minutos",
    d: "Hay minimarkets muy cerca: si se acaba el hielo o el vino, lo compras en minutos.",
  },
  {
    t: "La Cueva de los Pincheira, camino al domo",
    dato: "Km 67",
    d: "En este mismo camino está la cueva que la tradición local señala como refugio de los hermanos Pincheira en la década de 1820. Se puede visitar.",
  },
];

export default function Ubicacion() {
  return (
    <section className="bg-white py-20 md:py-28" id="ubicacion">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 07" label="Cómo llegar" note="Ruta N-55 · Km 72" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12 items-start">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="font-display font-medium text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] text-[#1E1B16]">
              En medio del bosque, pero a un{" "}
              <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                paso de todo
              </span>{" "}
              lo que importa
            </h2>

            {/* Tabla de leyenda: título + línea punteada + dato tabular */}
            <div className="mt-8">
              {leyenda.map(({ t, dato, d }) => (
                <div key={t} className="py-3.5 border-b border-[#1E1B16]/10 last:border-b-0">
                  <div className="flex items-baseline gap-3">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                    <span className="text-[14px] font-semibold text-[#1E1B16] leading-snug">{t}</span>
                    <span
                      className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-6"
                      aria-hidden="true"
                    />
                    <span className="dato text-[#1E1B16] whitespace-nowrap">{dato}</span>
                  </div>
                  <p className="text-sm text-[#5B5348] leading-relaxed mt-1.5 pl-[22px]">{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa en marco de imprenta */}
          <div className="col-span-12 lg:col-span-8">
            <figure>
              <div className="relative w-full h-[460px] md:h-[560px] rounded-[2px] border border-[#1E1B16]/20 overflow-hidden">
                <GoogleMapsSection apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} />
              </div>
              <figcaption className="mt-2 flex items-center gap-2">
                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                <span className="caption-editorial">A 12 min del centro de ski</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
