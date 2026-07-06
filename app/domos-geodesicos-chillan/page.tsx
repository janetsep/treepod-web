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
    title: 'Domos Geodésicos en Chillán | TreePod Las Trancas',
    description: 'Domos geodésicos en Valle Las Trancas, Chillán. 38 m² de interior, estufa a pellet, cocina equipada y WiFi Starlink, a 12 min de Nevados de Chillán.',
    keywords: [
        'domos chillan',
        'domos en chillan',
        'domos termas de chillan',
        'domos geodésicos chillán',
        'domos las trancas',
        'domos nevados de chillan',
        'domos en las trancas chillan',
        'domos con tinaja chillán',
    ],
    alternates: {
        canonical: '/domos-geodesicos-chillan',
    },
    openGraph: {
        title: 'Domos Geodésicos en Chillán | Glamping TreePod',
        description: 'Domos geodésicos de 38 m² en bosque nativo, con estufa a pellet y WiFi Starlink. A 12 min de Nevados de Chillán.',
        images: ['/images/Galeria/noche-domo-iluminado-2-2.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesan los domos geodésicos en Chillán. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    // Mismo @id que el LodgingBusiness global (JsonLdSchemas.tsx): Google
    // fusiona ambos bloques como una sola entidad en vez de ver dos negocios.
    "@id": "https://domostreepod.cl/#lodging",
    "name": "TreePod Glamping",
    "description": "Domos geodésicos habitables en Valle Las Trancas, Chillán, con estufa a pellet, cocina equipada y WiFi Starlink. A 12 minutos de Nevados de Chillán.",
    "url": "https://domostreepod.cl/domos-geodesicos-chillan",
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
        "reviewCount": "59"
    }
};

// Especificaciones como índice numerado de revista, sin iconos ni tarjetas
const especificaciones = [
    {
        title: "38 m² de interior, vista panorámica",
        desc: "La estructura geodésica permite panorámicas que cubren gran parte del domo. Desde tu cama ves el bosque nativo y la cordillera de Ñuble."
    },
    {
        title: "Estructura preparada para nieve y viento",
        desc: "El diseño geodésico distribuye la carga de forma pareja. Resiste las nevadas del invierno cordillerano, temporada tras temporada de ski."
    },
    {
        title: "Climatización inteligente con pellet",
        desc: "Estufa a pellet programable que mantiene el domo cálido toda la noche. No necesitas levantarte a alimentar el fuego: el domo amanece tibio incluso cuando afuera está nevando."
    },
    {
        title: "Tinaja de ciprés privada (de temporada)",
        desc: "Cada domo tiene acceso a su propia tinaja de agua caliente, sin compartir. Es un servicio de temporada: no opera en invierno y vuelve en primavera."
    },
    {
        title: "A 12 minutos de Nevados de Chillán",
        desc: "Ski, snowboard, termas y trekking a minutos de tu domo. La ubicación ideal en el km 72 de la Ruta N-55 hacia Nevados de Chillán."
    },
    {
        title: "WiFi Starlink: internet real en la montaña",
        desc: "Conexión satelital de alta velocidad. Ideal para trabajo remoto, streaming o simplemente subir las fotos de tu estadía sin esperar."
    },
];

const galeria = [
    {
        src: "/images/Galeria/lastrancas-exterior-domo-8-2.jpg",
        alt: "Exterior del domo geodésico TreePod en el bosque",
        caption: "Estructura geodésica · 38 m² + terraza privada",
    },
    {
        src: "/images/interiors/interior-vista-bosque.jpg",
        alt: "Vista panorámica del bosque desde el interior del domo",
        caption: "Vista panorámica al bosque nativo",
    },
    {
        src: "/images/wellness/Tinaja5.jpg",
        alt: "Tinaja privada de ciprés rodeada de bosque nativo",
        caption: "Tinaja privada · servicio de temporada",
    },
    {
        src: "/images/EquipamientoParaTuEstadia/interior-domo-acogedor-21-3.jpg",
        alt: "Interior acogedor del domo geodésico con iluminación cálida",
        caption: "Ambiente acogedor · diseño cálido y funcional",
    },
];

export default function DomosGeodesicosChillanPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <TrackView eventName="view_domos_geodesicos_chillan" />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* PORTADA — foto a sangre, leyenda abajo-izquierda, dato duro a la derecha */}
            <CinematicSection
                image="/images/Galeria/noche-domo-iluminado-2-2.jpg"
                alt="Domo geodésico iluminado de noche en Valle Las Trancas, Chillán"
                eyebrow="Domos Geodésicos · Valle Las Trancas · Chillán"
                title={<>Domos geodésicos en Chillán: duerme bajo las estrellas <span className="italic">sin pasar frío</span></>}
                text="Estructura geodésica con 38 m² de interior y vista al bosque nativo. Estufa a pellet automática, cocina equipada y WiFi Starlink. La tinaja privada es servicio de temporada, vuelve en primavera."
                priority
                titleAs="h1"
                stat="38"
                statCaption="m² de interior geodésico"
                photoCaption="Ruta N-55, Km 72 · Valle Las Trancas"
                ctaSlot={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan"
                            secondEventName="begin_checkout_domos_chillan"
                            secondParams={{ event: "domos_geodesicos_chillan" }}
                            className={btnPrimaryDark}
                        >
                            Reservar un domo
                        </TrackedLink>
                        <TrackedLink
                            href={whatsappUrl}
                            eventName="click_whatsapp_domos_chillan"
                            className={`${linkLineDark} !text-sm`}
                        >
                            Consultar por WhatsApp <span aria-hidden="true">→</span>
                        </TrackedLink>
                    </div>
                }
            />

            <GeoDivider left="16%" />

            {/* N° 01 — ESPECIFICACIONES: índice numerado entre filetes */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 01" label="La estructura" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14">
                        <div className="col-span-12 lg:col-span-9">
                            <h2 className="display-lg text-[#1E1B16]">
                                ¿Qué hace especial a un domo geodésico{' '}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">TreePod</span>?
                            </h2>
                        </div>
                    </div>

                    <div className="border-b border-[#1E1B16]/12">
                        {especificaciones.map((item, idx) => (
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

            <GeoDivider left="34%" />

            {/* N° 02 — GALERÍA: retícula asimétrica con pies de foto */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 02" label="Fotos reales" note="Sin filtros, sin IA, sin trucos" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Así son los domos TreePod <span className="italic">por dentro y por fuera</span>
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
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan"
                            className={btnPrimary}
                        >
                            Ver disponibilidad de domos
                        </TrackedLink>
                    </div>
                </div>
            </section>

            <GeoDivider left="56%" />

            {/* N° 03 — RESEÑAS */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 03" label="Reseñas verificadas" note="4,9 en Google · 59 reseñas" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Reseñas reales <span className="italic">de huéspedes</span>
                            </h2>
                            <p className="mt-5 flex items-center gap-2 dato text-[#5B5348]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                4,9 estrellas en Google con 59 reseñas verificadas
                            </p>
                        </div>
                    </div>

                    <div className="w-full relative min-h-[250px] md:min-h-[400px] flex items-center justify-center rounded-[2px] border border-[#1E1B16]/10 bg-white">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="caption-editorial opacity-60">Cargando reseñas…</span>
                        </div>
                    </div>
                    <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" defer />
                </div>
            </section>

            <GeoDivider left="80%" />

            {/* CIERRE — banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Reserva directa" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                Reserva tu domo geodésico <span className="italic text-[#00ADEF]">al mejor precio</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Reserva directa en domostreepod.cl, sin comisiones de intermediarios. Mejor precio directo y atención personalizada por WhatsApp.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-8">
                            <TrackedLink
                                href="/disponibilidad?adultos=2&event=domos-chillan"
                                eventName="click_reservar_domos_chillan_final"
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
