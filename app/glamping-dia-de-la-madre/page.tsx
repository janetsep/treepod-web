import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimaryDark, linkLineDark } from '../components/deco/cta';

export const metadata: Metadata = {
    title: 'Glamping Día de la Madre en Ñuble | Domos en Las Trancas — TreePod',
    description: 'Regala glamping para el Día de la Madre en Chillán: domos geodésicos en Valle Las Trancas, a minutos de Nevados de Chillán. Una escapada para mamá.',
    keywords: [
        'glamping día de la madre',
        'glamping día de la madre chillán',
        'glamping chillán',
        'domos equipados ñuble',
        'glamping con tinaja',
        'escapada romántica con tinaja',
        'domos en chillán',
        'regalo día de la madre experiencia',
        'glamping ñuble',
        'alojamiento día de la madre chile',
    ],
    // Landing de fecha pasada (Día de la Madre, 10 mayo 2026): noindex hasta
    // reutilizarla para la próxima edición, para no invitar a reservar fechas vencidas.
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/glamping-dia-de-la-madre',
    },
    openGraph: {
        title: 'Glamping para el Día de la Madre | Domos TreePod Valle Las Trancas',
        description: 'Regala una noche en domos geodésicos en Valle Las Trancas. Una escapada para mamá, entre bosque nativo y montaña.',
        images: ['/images/wellness/Tinaja1.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Glamping Día de la Madre en Ñuble | TreePod',
        description: 'Domos geodésicos para mamá en Valle Las Trancas, a minutos de Nevados de Chillán.',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa regalar una estadía para el Día de la Madre. ¿Tienen disponibilidad para el 10 de mayo?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "TreePod Glamping — Día de la Madre",
    "description": "Glamping en domos geodésicos para el Día de la Madre en Valle Las Trancas, Ñuble.",
    "url": "https://domostreepod.cl/glamping-dia-de-la-madre",
    "telephone": "+56984643307",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ruta N-55 Km 72 hacia Nevados de Chillán",
        "addressLocality": "Valle Las Trancas",
        "addressRegion": "Ñuble",
        "addressCountry": "CL"
    },
    "priceRange": "$$",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "59"
    },
};

// La experiencia como índice numerado de revista, sin iconos ni tarjetas
const experiencia = [
    {
        title: "Tinaja de ciprés (de temporada)",
        desc: "Agua caliente, vista a la montaña y cielo estrellado. Es un servicio de temporada que vuelve en primavera; en invierno no opera. Consúltanos por la disponibilidad de tu fecha."
    },
    {
        title: "Domo geodésico equipado",
        desc: "Cama matrimonial y dos camas individuales, ropa de cama de calidad, calefacción, baño privado y vistas al bosque nativo de Ñuble."
    },
    {
        title: "A minutos de las Termas",
        desc: "Nevados de Chillán — termas y ski — está a pocos minutos en auto. Desde TreePod tienes acceso fácil a uno de los principales destinos de montaña de Ñuble."
    },
    {
        title: "Registro SERNATUR N° 36806",
        desc: "Somos un establecimiento turístico registrado en SERNATUR. Eso respalda nuestros estándares de calidad, seguridad y servicio."
    },
    {
        title: "Un domo propio en el bosque",
        desc: "Cada domo está separado del resto y rodeado de bosque nativo. Sin pasillos de hotel: el descanso que mamá merece."
    },
    {
        title: "Cocina equipada",
        desc: "Cada domo tiene cocina completa para que preparen juntos el desayuno del Día de la Madre con vista a la cordillera, a su propio ritmo."
    },
];

export default function GlampingDiaDeLaMadrePage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <Script
                id="json-ld-dia-madre"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TrackView eventName="view_dia_de_la_madre" />

            {/* PORTADA — foto a sangre, leyenda abajo-izquierda */}
            <CinematicSection
                image="/images/wellness/Tinaja1.jpg"
                alt="Tinaja de ciprés en Domos TreePod Valle Las Trancas — Día de la Madre"
                eyebrow="10 de Mayo 2026 · Día de la Madre"
                eyebrowKicker
                title={<>Un regalo que mamá va a recordar siempre</>}
                text="Glamping en domos geodésicos en Valle Las Trancas, entre bosque nativo y la montaña de Ñuble. Un regalo distinto: tiempo para mamá."
                priority
                titleAs="h1"
                stat="10"
                statCaption="de mayo · Día de la Madre"
                photoCaption="Tinaja de ciprés, Valle Las Trancas"
                ctaSlot={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <TrackedLink
                            href="/reserva"
                            eventName="cta_dia_madre_hero_reserva"
                            className={btnPrimaryDark}
                        >
                            Ver disponibilidad 10 mayo
                        </TrackedLink>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkLineDark} !text-sm`}
                        >
                            Consultar por WhatsApp <span aria-hidden="true">→</span>
                        </a>
                    </div>
                }
            />

            <GeoDivider left="14%" />

            {/* N° 01 — EL REGALO DIFERENTE: declaración editorial asimétrica */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 01" label="El regalo diferente" />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
                        <div className="col-span-12 lg:col-span-9">
                            <h2 className="display-lg text-[#1E1B16]">
                                Hay regalos que se usan y se olvidan.{' '}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                    Hay experiencias que se cuentan por años.
                                </span>
                            </h2>
                            <p className="lead text-[#5B5348] mt-6 max-w-2xl">
                                Lo que la mayoría de las mamás más necesita no es una cosa — es tiempo. Tiempo sin agenda,
                                sin deberes ni pendientes. En Domos TreePod, en el Valle Las Trancas, eso es
                                exactamente lo que entregamos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <GeoDivider left="32%" />

            {/* N° 02 — LA EXPERIENCIA: índice numerado entre filetes */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 02" label="La experiencia" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                La experiencia <span className="italic">TreePod</span>
                            </h2>
                            <p className="lead text-[#5B5348] mt-5">
                                Todo lo que mamá merece, en un solo lugar.
                            </p>
                        </div>
                    </div>

                    <div className="border-b border-[#1E1B16]/12">
                        {experiencia.map((item, idx) => (
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

            <GeoDivider left="52%" />

            {/* N° 03 — IMAGEN + TEXTO: artículo asimétrico */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 03" label="Desde la cama" />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-center">
                        <figure className="col-span-12 lg:col-span-7">
                            <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-domo-acogedor-18.jpg"
                                    alt="Interior domo geodésico TreePod — cama con vista al bosque"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                            <figcaption className="mt-2 flex items-center gap-2">
                                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                <span className="caption-editorial">Interior del domo, con vista al bosque</span>
                            </figcaption>
                        </figure>
                        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                            <h2 className="display-lg text-[#1E1B16]">
                                Despertar con la montaña <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">desde la cama</span>
                            </h2>
                            <p className="text-[15px] md:text-base text-[#5B5348] leading-relaxed">
                                Las mamás que han estado en TreePod suelen describir lo mismo: el bosque
                                al despertar, el olor a madera y el calor del domo cuando la temperatura cae.
                                Cosas que no caben en una foto pero que se quedan.
                            </p>
                            <ul className="flex flex-col gap-3">
                                {[
                                    'Check-in desde las 16:00, check-out a las 12:00',
                                    'Ropa de cama y toallas incluidas',
                                    'WiFi Starlink de alta velocidad',
                                    'Estacionamiento privado sin costo',
                                    'Acceso a áreas comunes del glamping',
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
                                        <span className="text-[15px] text-[#1E1B16] leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <GeoDivider left="70%" />

            {/* N° 04 — OPCIONES DE ESTADÍA: fichas técnicas */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 04" label="Opciones de estadía" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Opciones para el <span className="italic">Día de la Madre</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white rounded-[2px] border border-[#1E1B16]/12 p-7 md:p-8 flex flex-col gap-4">
                            <p className="flex items-baseline gap-3">
                                <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">01</span>
                                <span className="dato text-[#5B5348]">Opción 1</span>
                                <span className="flex-1 h-px bg-[#1E1B16]/15 self-center" aria-hidden="true" />
                            </p>
                            <h3 className="display-md text-[#1E1B16]">Una noche</h3>
                            <p className="text-[15px] text-[#5B5348] leading-relaxed">
                                Llegan el sábado 9 en la tarde, cenan tranquilos en el domo y se despiertan
                                el domingo 10 — el Día de la Madre — con el paisaje de los Andes desde la cama.
                            </p>
                            <p className="caption-editorial mt-auto">Tarifa por noche según temporada — revísala en el calendario</p>
                        </div>

                        <div className="bg-white rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] p-7 md:p-8 flex flex-col gap-4">
                            <p className="flex items-baseline gap-3">
                                <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">02</span>
                                <span className="dato text-[#1E1B16]">Opción 2 — Recomendada</span>
                                <span className="flex-1 h-px bg-[#1E1B16]/15 self-center" aria-hidden="true" />
                            </p>
                            <h3 className="display-md text-[#1E1B16]">Dos noches</h3>
                            <p className="text-[15px] text-[#5B5348] leading-relaxed">
                                Viernes 8 + sábado 9. Con dos noches hay tiempo para explorar Las Trancas con
                                calma, visitar las termas y disfrutar la experiencia completa sin apuro.
                            </p>
                            <p className="caption-editorial mt-auto">Tarifa por noche según temporada — revísala en el calendario</p>
                        </div>
                    </div>

                    <p className="mt-8 flex items-center gap-2 caption-editorial">
                        <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                        Las fechas del Día de la Madre se agotan rápido. Si quieres asegurar disponibilidad para el 10 de mayo, reserva esta semana.
                    </p>
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
                                Un regalo que mamá <span className="italic text-[#00ADEF]">va a recordar</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Reserva directamente en domostreepod.cl — sin intermediarios, con abono del 50% y saldo en el check-in.
                                O escríbenos por WhatsApp si tienes preguntas.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-6">
                            <TrackedLink
                                href="/reserva"
                                eventName="cta_dia_madre_final_reserva"
                                className={btnPrimaryDark}
                            >
                                Reservar para el 10 de mayo
                            </TrackedLink>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${linkLineDark} !text-sm`}
                            >
                                Consultar por WhatsApp <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
