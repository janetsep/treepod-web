import Link from "next/link";
import Image from "next/image";
import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";

// Artículo 08 — el quiosco: las notas del valle como portadas de revista en tira
// (scroll horizontal en mobile, escalonadas en desktop), sin cajas ni sombras.
export default function News() {
  const activities = [
    {
      image: "/images/Galeria/domoinvierno.jpeg",
      title: "Qué Hacer en Valle Las Trancas",
      description:
        "Ski y termas en invierno, trekking en verano, colores de bosque en otoño. Una guía del valle para elegir cuándo venir.",
      tag: "Guía por temporada",
      details: "Ver la guía del valle",
      href: "/blog/que-hacer-valle-las-trancas-por-temporada",
    },
    {
      image: "/images/hero/domonieve2.jpeg",
      title: "Domos Geodésicos Chillán",
      description:
        "Domos geodésicos con estufa a pellet, a minutos de las pistas de ski de Nevados de Chillán. Vuelve del cerro a una cama tibia.",
      tag: "Temporada de nieve",
      details: "Ver domos en Chillán",
      href: "/domos-geodesicos-chillan",
    },
    {
      image: "/images/Galeria/Las Trancas Bosque Nativo.jpeg",
      title: "Glamping Valle Las Trancas",
      description:
        "Bosque nativo, montaña y aventura a un paso de tu domo. Naturaleza y comodidad en un mismo lugar del Valle Las Trancas.",
      tag: "Valle Las Trancas",
      details: "Ver domos en Las Trancas",
      href: "/glamping-valle-las-trancas",
    },
    {
      image: "/images/wellness/Tinaja5.jpg",
      title: "Escapada Romántica",
      description:
        "Una escapada para dos: cena íntima, bosque nativo, el cielo estrellado de Las Trancas y un domo solo para ustedes.",
      tag: "Solo para dos",
      details: "Ver escapada romántica",
      href: "/escapada-romantica-las-trancas",
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 08" label="Guía del valle" />

        <div className="max-w-2xl">
          <h2 className="display-lg text-[#1E1B16]">
            Panoramas en{" "}
            <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
              Valle Las Trancas
            </span>
          </h2>
          <p className="lead text-[#5B5348] mt-5">
            Ski, termas, trekking y buena comida, todo a minutos del domo.
          </p>
        </div>

        {/* Tira de portadas: scroll con snap en mobile, escalonadas en desktop */}
        <div className="mt-12 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {activities.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group block shrink-0 w-[72vw] max-w-[300px] snap-start lg:w-auto lg:max-w-none ${
                index % 2 === 1 ? "lg:mt-10" : ""
              }`}
            >
              <div className="relative aspect-[3/4] rounded-[2px] border border-[#1E1B16]/15 overflow-hidden">
                <Image
                  alt={item.title}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  src={item.image}
                  fill
                  sizes="(max-width: 1024px) 72vw, 25vw"
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TriBullet />
                <span className="dato text-[#5B5348]">{item.tag}</span>
              </div>
              <h3 className="display-md text-[#1E1B16] mt-2 decoration-[#00ADEF] decoration-[3px] underline-offset-[6px] group-hover:underline">
                {item.title}
              </h3>
              <p className="text-sm text-[#5B5348] leading-relaxed mt-2">{item.description}</p>
              <span className="mt-3 inline-flex items-center gap-2 font-semibold text-[14px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] group-hover:decoration-[#008CBF] transition-colors">
                {item.details} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
