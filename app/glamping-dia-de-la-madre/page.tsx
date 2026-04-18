import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Heart, Waves, TreePine, Star, Gift, Check, MapPin } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Glamping Día de la Madre en Ñuble | Domos con Tinaja — TreePod',
    description: 'Regala glamping para el Día de la Madre en Chillán: domos geodésicos con tinaja privada en Valle Las Trancas. La escapada perfecta para mamá. Desde $110.000/noche.',
    keywords: [
        'glamping día de la madre',
        'glamping día de la madre chillán',
        'glamping chillán',
        'domos de lujo ñuble',
        'glamping con tinaja',
        'escapada romántica con tinaja',
        'domos en chillán',
        'regalo día de la madre experiencia',
        'glamping ñuble',
        'alojamiento día de la madre chile',
    ],
    alternates: {
        canonical: '/glamping-dia-de-la-madre',
    },
    openGraph: {
        title: 'Glamping para el Día de la Madre | Domos TreePod Valle Las Trancas',
        description: 'Regala una noche en domos geodésicos con tinaja privada en Valle Las Trancas. Una escapada que mamá va a recordar siempre.',
        images: ['/images/wellness/Tinaja1.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Glamping Día de la Madre en Ñuble | TreePod',
        description: 'Domos geodésicos con tinaja privada para mamá. Valle Las Trancas, a minutos de Nevados de Chillán.',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa regalar una estadía para el Día de la Madre. ¿Tienen disponibilidad para el 10 de mayo?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "TreePod Glamping — Día de la Madre",
    "description": "Glamping en domos geodésicos con tinaja privada para el Día de la Madre en Valle Las Trancas, Ñuble.",
    "url": "https://domostreepod.cl/glamping-dia-de-la-madre",
    "telephone": "+56984643307",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ruta N-55 km 71 hacia Nevados de Chillán",
        "addressLocality": "Valle Las Trancas",
        "addressRegion": "Ñuble",
        "addressCountry": "CL"
    },
    "priceRange": "Desde $110.000 CLP por noche",
    "starRating": { "@type": "Rating", "ratingValue": "4.9" },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "47"
    },
};

export default function GlampingDiaDeLaMadrePage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <Script
                id="json-ld-dia-madre"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TrackView eventName="view_dia_de_la_madre" />

            {/* HERO */}
            <section className="relative h-[85vh] min-h-[550px] md:min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/wellness/Tinaja1.jpg"
                        alt="Tinaja privada en Domos TreePod Valle Las Trancas — regalo Día de la Madre"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/60 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                    <div className="inline-block mb-6 bg-rose-700/30 backdrop-blur-md border border-rose-400/30 px-6 py-2 rounded-full">
                        <span className="text-white text-xs font-black tracking-[0.2em] uppercase">10 de Mayo 2026</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-lg max-w-4xl">
                        Un regalo que<br />
                        <span className="text-rose-300">mamá va a recordar siempre</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow leading-relaxed">
                        Glamping en domos geodésicos con tinaja privada en el corazón de los Andes de Ñuble.
                        No es una cosa — es una experiencia.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <TrackedLink
                            href="/reserva"
                            eventName="cta_dia_madre_hero_reserva"
                            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-base"
                        >
                            <Gift className="w-5 h-5" />
                            Ver disponibilidad 10 mayo
                            <ArrowRight className="w-4 h-4" />
                        </TrackedLink>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 text-base"
                        >
                            Consultar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* POR QUÉ UN GLAMPING */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-sm font-bold px-4 py-2 rounded-full mb-6">
                        <Heart className="w-4 h-4" />
                        El regalo diferente
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 leading-tight">
                        Hay regalos que se usan y se olvidan.<br />
                        <span className="text-rose-600">Hay experiencias que se cuentan por años.</span>
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Lo que la mayoría de las mamás más necesita no es una cosa — es tiempo. Tiempo sin agenda,
                        sin deberes, sin ruido de fondo. En Domos TreePod, en el Valle Las Trancas, eso es
                        exactamente lo que entregamos.
                    </p>
                </div>
            </section>

            {/* QUÉ INCLUYE */}
            <section className="py-20 bg-stone-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            La experiencia TreePod
                        </h2>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">
                            Todo lo que mamá merece, en un solo lugar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                <Waves className="w-6 h-6 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Tinaja privada de ciprés</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Agua caliente, vista a la montaña y cielo estrellado. El contraste con el aire
                                fresco de la cordillera hace que la experiencia sea única. Disponible cada noche.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <TreePine className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Domo geodésico premium</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Cama doble o twin, ropa de cama de calidad, calefacción, baño privado y vistas
                                al bosque nativo de Ñuble. Diseño único que no existe en ningún hotel.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">A minutos de las Termas</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Nevados de Chillán — termas y ski — está a solo 10 minutos. La estadía en TreePod
                                da acceso a uno de los destinos naturales más completos de Chile.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Certificados por SERNATUR</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Somos un establecimiento turístico certificado. Eso significa estándares reales
                                de calidad, seguridad y servicio — no solo buenas fotos.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Mascotas bienvenidas</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Si mamá no concibe una escapada sin sus peludos, en TreePod los recibimos.
                                La familia completa incluye a todos.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col gap-4">
                            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                                <Gift className="w-6 h-6 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Cocina equipada</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Cada domo tiene cocina completa para que preparen juntos el desayuno del
                                Día de la Madre con vista a la cordillera. Un momento que no se compra en ningún restaurante.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* IMAGEN + TEXTO */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/images/interiors/interior-domo-acogedor-18.jpg"
                                alt="Interior domo geodésico TreePod — cama con vista al bosque"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                Despertar con la montaña<br />
                                <span className="text-rose-600">desde la cama</span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Las mamás que han estado en TreePod siempre describen lo mismo: el silencio
                                de la montaña, el olor a madera, el calor de la tinaja cuando la temperatura cae.
                                Cosas que no caben en una foto pero que se llevan guardadas.
                            </p>
                            <ul className="flex flex-col gap-3">
                                {[
                                    'Check-in desde las 15:00, check-out a las 11:00',
                                    'Ropa de cama y toallas incluidas',
                                    'WiFi Starlink — conexión garantizada',
                                    'Estacionamiento privado sin costo',
                                    'Acceso a áreas comunes del glamping',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-gray-700">
                                        <Check className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* OPCIONES DE ESTADÍA */}
            <section className="py-20 bg-stone-50">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            Opciones para el Día de la Madre
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 border-2 border-stone-200 flex flex-col gap-4">
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Opción 1</div>
                            <h3 className="text-2xl font-black text-gray-900">Una noche</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Llegan el sábado 9 en la tarde, disfrutan la tinaja al anochecer y se despiertan
                                el domingo 10 — el Día de la Madre — con el paisaje de los Andes desde la cama.
                            </p>
                            <p className="text-rose-600 font-bold text-lg mt-auto">Desde $110.000 CLP/noche</p>
                        </div>

                        <div className="bg-rose-600 rounded-2xl p-8 border-2 border-rose-600 flex flex-col gap-4 text-white shadow-xl">
                            <div className="text-sm font-bold text-rose-200 uppercase tracking-widest">Opción 2 — Recomendada</div>
                            <h3 className="text-2xl font-black">Dos noches</h3>
                            <p className="text-rose-100 leading-relaxed">
                                Viernes 8 + sábado 9. Con dos noches hay tiempo para explorar Las Trancas con
                                calma, visitar las termas y disfrutar la experiencia completa sin apuro.
                            </p>
                            <p className="text-white font-bold text-lg mt-auto">Desde $110.000 CLP/noche</p>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-8">
                        Las fechas del Día de la Madre se agotan rápido. Si quieres asegurar disponibilidad para el 10 de mayo, reserva esta semana.
                    </p>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-24 bg-gradient-to-br from-rose-700 to-rose-900 text-white text-center">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <div className="text-5xl mb-6">🌸</div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                        El regalo que mamá va a contar por años
                    </h2>
                    <p className="text-rose-200 text-lg mb-10 leading-relaxed">
                        Reserva directamente en domostreepod.cl — sin intermediarios, con confirmación inmediata.
                        O escríbenos por WhatsApp si tienes preguntas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <TrackedLink
                            href="/reserva"
                            eventName="cta_dia_madre_final_reserva"
                            className="inline-flex items-center gap-2 bg-white text-rose-700 font-bold px-8 py-4 rounded-full transition-all duration-200 hover:bg-rose-50 shadow-lg text-base"
                        >
                            <Gift className="w-5 h-5" />
                            Reservar para el 10 de mayo
                            <ArrowRight className="w-4 h-4" />
                        </TrackedLink>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 text-base"
                        >
                            Consultar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
