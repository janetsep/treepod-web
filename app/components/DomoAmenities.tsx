import Image from "next/image";
import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";
import { btnPrimary } from "./deco/cta";

// Artículo 04 — índice numerado del domo equipado: cada amenity es una FILA de
// índice de revista (numeral itálico, título, descripción, foto pequeña), no una
// tarjeta. El par de fotos del robot va en dos mitades dentro de la misma celda.
const robotImages = [
  "/images/EquipamientoParaTuEstadia/domo-treepod-camara-6-2.jpg",
  "/images/EquipamientoParaTuEstadia/domo-treepod-camara-5-2.jpg",
];

const amenities: {
  title: string;
  description: string;
  seasonal?: boolean;
  image?: string;
  images?: string[];
  imageAlts?: string[];
  objectPosition?: string;
}[] = [
  {
    title: "Tinaja caliente privada al aire libre",
    description:
      "Tu propia tinaja con agua mineralizada y vista al bosque, sin compartir con nadie. Es un servicio de temporada: vuelve en primavera y no opera en invierno.",
    seasonal: true,
    image: "/images/wellness/Tinaja5.jpg",
    objectPosition: "object-center",
  },
  {
    title: "Cero humo, cero frío",
    description:
      "Olvídate de cargar leña: la estufa automática mantiene tu domo cálido las 24 horas.",
    image: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
  },
  {
    title: "Un descanso de verdad",
    description:
      "Una cama cómoda y el silencio del bosque. Vas a dormir profundo y despertar sin apuro.",
    image: "/images/EquipamientoParaTuEstadia/interior-domo-acogedor-84-3.jpg",
  },
  {
    title: "Tu café perfecto al despertar",
    description:
      "Café Nespresso en tu domo. Un café caliente por la mañana, con los pájaros y el viento de fondo.",
    image: "/images/interiors/CafeteraNespresso.jpg",
  },
  {
    title: "Tú solo dedícate a descansar",
    description:
      "Tienes un robot aspirador a tu disposición: lo activas cuando quieras y él barre por ti.",
    images: robotImages,
    imageAlts: [
      "Robot aspirador disponible en el domo TreePod",
      "Interior del domo TreePod con robot aspirador",
    ],
  },
];

export default function DomoAmenities() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 04" label="El domo equipado" />

        <div className="max-w-2xl relative">
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -top-8 -left-2 font-display italic text-[clamp(6rem,16vw,13rem)] leading-none text-[#1E1B16]/[0.05]"
          >
            04
          </span>
          <h2 className="display-lg text-[#1E1B16] relative z-10">
            Diseñado para tu{" "}
            <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
              relajo total
            </span>
          </h2>
          <p className="lead text-[#5B5348] mt-5">Todo pensado para que solo llegues a descansar.</p>
        </div>

        {/* Índice numerado: filas entre filetes, sin tarjetas */}
        <div className="mt-12 border-b border-[#1E1B16]/12">
          {amenities.map((item, index) => (
            <div
              key={item.title}
              className="group border-t border-[#1E1B16]/12 py-6 grid grid-cols-12 gap-4 items-center"
            >
              {/* #008CBF sobre blanco (4,0:1): el cyan puro daba 2,5:1 y fallaba AA */}
              <div
                className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="col-span-10 md:col-span-4">
                {/* h3 (no h4): la sección abre con h2, así no hay salto de jerarquía */}
                <h3 className="display-md text-[#1E1B16]">{item.title}</h3>
                {item.seasonal && (
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B5348] border-b border-dotted border-[#5B5348]/50 pb-0.5">
                    <TriBullet /> De temporada · desde primavera
                  </span>
                )}
              </div>

              <div className="col-span-12 md:col-span-4 text-[15px] text-[#5B5348] leading-relaxed">
                {item.description}
              </div>

              <div className="col-span-12 md:col-span-3">
                <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden">
                  {item.images ? (
                    <div className="flex h-full w-full absolute inset-0">
                      {item.images.map((img, imgIdx) => (
                        <div
                          key={img}
                          className="relative flex-1 h-full overflow-hidden first:border-r border-white/20"
                        >
                          <Image
                            src={img}
                            alt={item.imageAlts?.[imgIdx] || `${item.title} — foto ${imgIdx + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 13vw"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Image
                      src={item.image!}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className={`object-cover ${item.objectPosition || "object-center"} transition-transform duration-700 group-hover:scale-[1.03]`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA de la sección: quien se convenció aquí no debe buscar dónde reservar */}
        <div className="mt-12">
          <a href="/disponibilidad" className={btnPrimary}>
            Quiero mi escapada al bosque
          </a>
        </div>
      </div>
    </section>
  );
}
