import { ResenasGrid } from "../components/Testimonios";
import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimary, btnPrimaryDark, linkLineDark } from '../components/deco/cta';

export const metadata: Metadata = {
    title: 'Domos en Las Trancas | Glamping en Bosque Nativo — TreePod',
    description: 'Domos geodésicos en Valle Las Trancas, Chillán. Estufa a pellet, WiFi Starlink y bosque nativo, a 12 min de Nevados de Chillán. Reserva directo.',
    keywords: [
        'glamping valle las trancas',
        'glamping las trancas',
        'alojamiento valle las trancas',
        'domos las trancas',
        'glamping las trancas chillán',
        'donde dormir en las trancas',
        'alojamiento nevados de chillán',
        'alojamiento termas de chillán',
        'glamping con tinaja las trancas',
        'domos geodésicos las trancas',
    ],
    alternates: {
        canonical: '/glamping-valle-las-trancas',
    },
    openGraph: {
        title: 'Domos en Las Trancas | Glamping TreePod',
        description: 'Domos geodésicos en Valle Las Trancas. Estufa a pellet, bosque nativo y WiFi Starlink. A 12 min de Nevados de Chillán.',
        images: ['/images/Galeria/lastrancas-exterior-domo-14-2.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa reservar un domo en Valle Las Trancas. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    // Mismo @id que el LodgingBusiness global (JsonLdSchemas.tsx): Google
    // fusiona ambos bloques como una sola entidad en vez de ver dos negocios.
    "@id": "https://domostreepod.cl/#lodging",
    "name": "TreePod Glamping",
    "description": "Domos geodésicos en Valle Las Trancas con estufa a pellet, cocina equipada y bosque nativo. A 12 minutos de Nevados de Chillán.",
    "url": "https://domostreepod.cl/glamping-valle-las-trancas",
    "telephone": "+56984643307",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ruta N-55, Km 72, hacia Nevados de Chillán",
        "addressLocality": "Valle Las Trancas",
        "addressRegion": "Ñuble",
        "addressCountry": "CL"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": -36.9116,
        "longitude": -71.5069
    },
    "priceRange": "$$",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "209"
    },
    "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Bosque nativo privado", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Estufa a pellet automática", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "WiFi Starlink", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Cocina equipada", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Estacionamiento privado", "value": true }
    ]
};

// Índice de lo que incluye la estadía: filas numeradas, sin iconos ni tarjetas
const queIncluye = [
    {
        title: "Tinaja privada de ciprés (de temporada)",
        desc: "Cada domo tiene su propia tinaja de agua caliente con pasarela por el bosque, sin compartir con nadie. Es un servicio de temporada: no opera en invierno y vuelve en primavera."
    },
    {
        title: "Estufa a pellet automática: calor constante",
        desc: "Olvídate de pasar frío. La estufa programable mantiene tu domo cálido toda la noche. Afuera puede estar bajo cero, adentro estarás en polera."
    },
    {
        title: "Bosque nativo real, no un jardín decorado",
        desc: "Los domos están inmersos en bosque nativo de robles, coigües y ñirres, cada uno con su propio espacio entre los árboles."
    },
    {
        title: "A 12 minutos de Nevados de Chillán",
        desc: "Ski en invierno, trekking en verano, termas todo el año. La ubicación perfecta en el kilómetro 72 de la Ruta N-55 hacia Nevados de Chillán."
    },
    {
        title: "WiFi Starlink de alta velocidad",
        desc: "Internet satelital real en la montaña. Trabaja remoto, sube fotos o haz streaming sin cortes. Conectado cuando lo necesites, tranquilo cuando no."
    },
];

const galeria = [
    {
        src: "/images/Galeria/domo-iluminado-noche.jpg",
        alt: "Domo geodésico iluminado de noche en Valle Las Trancas",
        caption: "Domo panorámico · vista al bosque nativo",
    },
    {
        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
        alt: "Interior cálido del domo con cama matrimonial y estufa a pellet",
        caption: "Interior equipado · cama matrimonial y estufa a pellet",
    },
    {
        src: "/images/wellness/Tinaja1.jpg",
        alt: "Tinaja privada de ciprés en el bosque nativo de Las Trancas",
        caption: "Tinaja privada · ciprés, servicio de temporada",
    },
    {
        src: "/images/EquipamientoParaTuEstadia/Cocina.jpg",
        alt: "Cocina completamente equipada del domo en Las Trancas",
        caption: "Cocina completa · cafetera Nespresso incluida",
    },
];

export default function GlampingValleLasTrancasPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <TrackView eventName="view_glamping_valle_las_trancas" />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* PORTADA — foto a sangre, leyenda abajo-izquierda, dato duro a la derecha */}
            <CinematicSection
                image="/images/Galeria/lastrancas-exterior-domo-14-2.jpg"
                alt="Domo geodésico TreePod en Valle Las Trancas rodeado de bosque nativo"
                eyebrow="Valle Las Trancas · Nevados de Chillán"
                title={<>Domos en Las Trancas: glamping geodésico <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[8px]">en bosque nativo</span></>}
                text="Tu propio refugio en la cordillera, sin pasillos de hotel: un domo entre árboles, con el bosque nativo y la montaña a un paso."
                priority
                titleAs="h1"
                stat="12"
                statCaption="minutos a Nevados de Chillán"
                photoCaption="Ruta N-55, Km 72 · Valle Las Trancas"
                ctaSlot={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=glamping-las-trancas"
                            eventName="click_reservar_glamping_trancas"
                            secondEventName="begin_checkout_glamping_trancas"
                            secondParams={{ event: "glamping_valle_las_trancas" }}
                            className={btnPrimaryDark}
                        >
                            Ver disponibilidad y tarifas
                        </TrackedLink>
                        <TrackedLink
                            href={whatsappUrl}
                            eventName="click_whatsapp_glamping_trancas"
                            className={`${linkLineDark} !text-sm`}
                        >
                            Consultar por WhatsApp <span aria-hidden="true">→</span>
                        </TrackedLink>
                    </div>
                }
            />

            <GeoDivider left="14%" />

            {/* N° 01 — QUÉ INCLUYE: índice numerado entre filetes */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 01" label="La estadía" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14">
                        <div className="col-span-12 lg:col-span-9">
                            <h2 className="display-lg text-[#1E1B16]">
                                Todo lo que necesitas para una estadía perfecta{' '}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">en Las Trancas</span>
                            </h2>
                            <p className="lead text-[#5B5348] mt-6 max-w-2xl">
                                No es una cabaña tradicional. Es un domo geodésico de 38 m² con todo incluido.
                            </p>
                        </div>
                    </div>

                    <div className="border-b border-[#1E1B16]/12">
                        {queIncluye.map((item, idx) => (
                            <div
                                key={idx}
                                className="border-t border-[#1E1B16]/12 py-6 md:py-7 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-2 items-baseline"
                            >
                                <span
                                    className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums"
                                    aria-hidden="true"
                                >
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                <h3 className="col-span-10 md:col-span-4 display-md text-[#1E1B16]">{item.title}</h3>
                                <p className="col-span-12 md:col-span-7 text-[15px] text-[#5B5348] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <GeoDivider left="30%" />

            {/* N° 02 — GALERÍA: retícula asimétrica con pies de foto, sin gradientes negros */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 02" label="Fotos reales" note="Sin filtros, sin IA, sin trucos" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Así se ve tu alojamiento <span className="italic">en Las Trancas</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        {galeria.map((foto, idx) => (
                            <figure
                                key={foto.src}
                                className={`col-span-12 sm:col-span-6 ${idx % 3 === 0 ? "lg:col-span-5" : idx % 3 === 1 ? "lg:col-span-4" : "lg:col-span-3"}`}
                            >
                                <div className={`relative rounded-[2px] overflow-hidden group ${idx % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/4.4]"}`}>
                                    <Image
                                        src={foto.src}
                                        alt={foto.alt}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                                <figcaption className="mt-2 flex items-center gap-2">
                                    <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                    <span className="caption-editorial">{foto.caption}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>

                    <div className="mt-14">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=glamping-las-trancas"
                            eventName="click_reservar_glamping_trancas"
                            className={btnPrimary}
                        >
                            Ver disponibilidad y precios
                        </TrackedLink>
                    </div>
                </div>
            </section>

            <GeoDivider left="46%" />

            {/* N° 03 — FICHA TÉCNICA: dos columnas de leyenda con viñetas triángulo */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 03" label="Ficha técnica" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Todo incluido en tu domo <span className="italic text-[#008CBF]">TreePod</span>
                            </h2>
                            <p className="lead text-[#5B5348] mt-5">
                                Cada detalle pensado para que no eches nada de menos
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-12">
                        <div className="bg-white p-6 md:p-8 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF]">
                            <h3 className="dato text-[#1E1B16] mb-6">Equipamiento</h3>
                            <ul className="space-y-3.5">
                                {[
                                    "Tinaja privada de ciprés (servicio de temporada)",
                                    "Estufa a pellet automática y programable",
                                    "Cama matrimonial y dos individuales, ropa de cama de calidad",
                                    "Cocina equipada con Nespresso",
                                    "Baño completo con agua caliente",
                                    "WiFi Starlink de alta velocidad",
                                    "Terraza privada con vista al bosque",
                                    "Estacionamiento en la puerta",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
                                        <span className="text-[15px] text-[#5B5348] leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF]">
                            <h3 className="dato text-[#1E1B16] mb-6">Experiencia</h3>
                            <ul className="space-y-3.5">
                                {[
                                    "Vista panorámica del bosque nativo",
                                    "Domo y baño de uso exclusivo",
                                    "Check-in coordinado por WhatsApp",
                                    "Guía de experiencias locales",
                                    "A 12 min de Nevados de Chillán",
                                    "Senderos de trekking a minutos",
                                    "Registro Sernatur verificado",
                                    "Atención directa por WhatsApp",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
                                        <span className="text-[15px] text-[#5B5348] leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <GeoDivider left="60%" />

            {/* N° 04 — RESEÑAS */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 04" label="Reseñas reales" note="4,9 · 209 reseñas" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Lo que dicen quienes ya se quedaron <span className="italic">en TreePod</span>
                            </h2>
                            <p className="mt-5 flex items-center gap-2 dato text-[#5B5348]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                4,9 estrellas con 209 reseñas en todas las plataformas
                            </p>
                        </div>
                    </div>

                    <ResenasGrid />

                </div>
            </section>

            <GeoDivider left="74%" />

            {/* N° 05 — UBICACIÓN: datos duros como leyenda de mapa */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 05" label="Cómo llegar" note="Ruta N-55, Km 72" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12">
                        <div className="col-span-12 lg:col-span-5">
                            <h2 className="display-lg text-[#1E1B16]">
                                Dónde estamos en <span className="italic">Valle Las Trancas</span>
                            </h2>
                        </div>

                        <div className="col-span-12 lg:col-span-7">
                            <div className="border-b border-[#1E1B16]/12">
                                {[
                                    { title: "12 min", desc: "a Nevados de Chillán (ski, termas, trekking)" },
                                    { title: "6 a 7 hrs", desc: "desde Santiago por Ruta 5 Sur" },
                                    { title: "1 hr", desc: "desde Chillán ciudad" },
                                ].map((item, idx) => (
                                    <div key={idx} className="border-t border-[#1E1B16]/12 py-5 flex items-baseline gap-4 md:gap-6">
                                        <span className="font-display italic text-[clamp(1.8rem,3.5vw,2.8rem)] leading-none tabular-nums text-[#1E1B16] w-32 md:w-44 shrink-0">
                                            {item.title}
                                        </span>
                                        <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 self-center min-w-4" aria-hidden="true" />
                                        <span className="text-[15px] text-[#5B5348] leading-relaxed text-right max-w-[55%]">{item.desc}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[15px] text-[#5B5348] leading-relaxed mt-10">
                                TreePod está en el kilómetro 72 de la Ruta N-55 hacia Nevados de Chillán, en el corazón del Valle Las Trancas. Rodeados de bosque nativo, cerca de senderos de trekking, rutas de mountain bike, cascadas y la Laguna del Huemul. En invierno, a minutos del centro de ski. En verano, el punto de partida perfecto para explorar la cordillera de Ñuble.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <GeoDivider left="86%" />

            {/* CIERRE — banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Reserva directa" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                Reserva directo y obtén <span className="italic text-[#00ADEF]">el mejor precio</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Sin comisiones de Airbnb ni Booking. Al reservar directo en domostreepod.cl tienes el mejor precio y atención personalizada por WhatsApp.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-8">
                            <TrackedLink
                                href="/disponibilidad?adultos=2&event=glamping-las-trancas"
                                eventName="click_reservar_glamping_trancas_final"
                                secondEventName="begin_checkout_glamping_trancas"
                                secondParams={{ event: "glamping_valle_las_trancas" }}
                                className={btnPrimaryDark}
                            >
                                Ver disponibilidad ahora
                            </TrackedLink>
                        </div>
                    </div>

                    <div className="mt-14 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-3">
                        {["Mejor Precio Directo", "Reserva con el 50%", "Registro Sernatur"].map((t) => (
                            <span key={t} className="inline-flex items-center gap-2 dato text-[#F7F3EC]/70">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
