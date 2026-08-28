import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guía: 10 experiencias en Valle Las Trancas | Domos TreePod",
  description:
    "Termas, Nevados de Chillán, Cueva de los Pincheira, carpintero negro y más: la guía del valle escrita por anfitriones locales.",
  robots: { index: false }, // se llega tras dejar el email; no canibalizar el SEO del blog
};

/**
 * Contenido de la guía (lead magnet). Cada dato proviene del cerebro TreePod
 * (fuentes verificadas). Regla de marca: nada no comprobable.
 */
const EXPERIENCIAS: Array<{ titulo: string; texto: string }> = [
  {
    titulo: "Termas de Chillán y el Valle de Aguas Calientes",
    texto:
      "Aguas termales entre 30 y 50°C en plena montaña, con fumarolas visibles en el Valle de Aguas Calientes. En invierno, pasar del frío de la nieve al agua caliente es la experiencia que define al valle. Ve temprano en días de semana para evitar los peaks de temporada de ski.",
  },
  {
    titulo: "Nevados de Chillán: la pista más larga de Sudamérica",
    texto:
      "El centro de ski tiene 10.000 hectáreas y la pista 'Tres Marías' de 13 kilómetros, la más larga de Sudamérica. Dato clave en días de alta demanda: rigen horarios de subida (08:00–14:00) y bajada (14:30–19:00) en el camino — planifica para no quedar fuera. Con nieve, las cadenas son obligatorias.",
  },
  {
    titulo: "Cueva de los Pincheira (km 67)",
    texto:
      "En el siglo XIX, los hermanos Pincheira lideraron desde esta caverna un ejército realista de unos 2.000 hombres. Hoy es una visita corta e imperdible camino al valle, ideal para la tarde de llegada.",
  },
  {
    titulo: "Laguna del Huemul",
    texto:
      "Caminata clásica del valle hacia una laguna cordillerana. En la Reserva Nacional Ñuble vive el huemul, uno de los ciervos más amenazados del mundo — verlo es raro, pero estás en su territorio.",
  },
  {
    titulo: "Refugio Garganta del Diablo y las cascadas",
    texto:
      "El refugio data de 1937 y es parte de la historia del montañismo en la zona. Las cascadas del sector son accesibles en caminatas de medio día según la temporada.",
  },
  {
    titulo: "El carpintero negro en los robles",
    texto:
      "El pájaro carpintero más grande de Sudamérica (Campephilus magellanicus) trabaja los robles del bosque nativo del valle. El macho tiene la cabeza roja intensa. Se escucha antes de verse: un golpeteo profundo y lento. En el bosque de TreePod lo hemos filmado en pleno cortejo.",
  },
  {
    titulo: "Digüeñes en primavera",
    texto:
      "Si vienes en primavera, busca en los robles los digüeñes (Cyttaria espinosae), un hongo comestible nativo que se come fresco, en ensalada. Es un clásico de la cocina campesina de Ñuble.",
  },
  {
    titulo: "Flores del valle: lupinos y añañucas",
    texto:
      "De fines de noviembre a mediados de diciembre los lupinos tiñen los bordes del camino (son introducidos, pero el espectáculo es real). En verano florece la añañuca, bulbosa nativa con leyenda propia.",
  },
  {
    titulo: "Cicloturismo y trail en la montaña",
    texto:
      "El valle se está consolidando como destino de mountain bike y trail running fuera de la temporada de nieve: senderos de bosque y cordillera con ~4.000 camas de infraestructura turística alrededor.",
  },
  {
    titulo: "Una noche en el bosque nativo",
    texto:
      "La experiencia que nadie te cuenta: el silencio del bosque de noche, el cielo cordillerano estrellado y despertar entre robles. Es lo que nosotros ofrecemos en Domos TreePod (km 72): domos geodésicos calefaccionados en pleno bosque nativo, con tinaja de ciprés en temporada (primavera a otoño).",
  },
];

const DATOS_PRACTICOS = [
  "Cómo llegar: 71 km desde Chillán por la Ruta N-55 (~1h10); entre 6 y 7 horas desde Santiago.",
  "Sin auto: bus RemBus desde Chillán aproximadamente cada hora (~$2.700).",
  "En invierno lleva cadenas: son obligatorias cuando hay nieve en la ruta.",
  "El volcán opera en Alerta Amarilla permanente con el turismo funcionando normal bajo protocolos oficiales.",
];

export default function GuiaContenidoPage() {
  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1E1B16]">
      <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B5348] mb-6">
          Guía TreePod · escrita desde el km 72
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-10">
          10 experiencias reales en Valle Las Trancas
        </h1>

        <ol className="space-y-8">
          {EXPERIENCIAS.map((exp, i) => (
            <li key={exp.titulo} className="bg-white border border-[#1E1B16]/12 rounded-[2px] p-6">
              <h2 className="flex items-baseline gap-3 font-display text-xl mb-3">
                <span className="italic text-[#008CBF] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {exp.titulo}
              </h2>
              <p className="text-[15px] text-[#5B5348] leading-relaxed">{exp.texto}</p>
            </li>
          ))}
        </ol>

        <section className="mt-12 bg-white border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] rounded-[2px] p-6">
          <h2 className="dato mb-4">Datos prácticos</h2>
          <ul className="space-y-2 text-[15px] text-[#5B5348]">
            {DATOS_PRACTICOS.map((d) => (
              <li key={d}>· {d}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12 text-center">
          <p className="text-lg mb-4">
            ¿Quieres vivir el valle durmiendo dentro del bosque?
          </p>
          <Link
            href="/disponibilidad"
            className="inline-flex items-center justify-center bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold px-8 py-4 rounded-[2px] transition-colors"
          >
            Ver disponibilidad en Domos TreePod
          </Link>
          <p className="caption-editorial mt-3">
            4,9★ · 209 reseñas · Registro SERNATUR N° 36805
          </p>
        </section>
      </main>
    </div>
  );
}
