import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, TreePine, Thermometer, Wifi, Check, MapPin } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Domos en Las Trancas | Glamping en Bosque Nativo — TreePod',
    description: 'Domos geodésicos en Valle Las Trancas, Chillán. Estufa a pellet, cocina equipada, WiFi Starlink y bosque nativo. A 15 min de Nevados de Chillán. Reserva directo.',
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
        description: 'Domos geodésicos en Valle Las Trancas. Estufa a pellet, bosque nativo y WiFi Starlink. A 15 min de Nevados de Chillán.',
        images: ['/images/Galeria/lastrancas-exterior-domo-14-2.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Glamping en Valle Las Trancas | Domos TreePod',
        description: 'Domos geodésicos en bosque nativo, con estufa a pellet y WiFi Starlink.',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa reservar un domo en Valle Las Trancas. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "TreePod Glamping - Valle Las Trancas",
    "description": "Domos geodésicos en Valle Las Trancas con estufa a pellet, cocina equipada y bosque nativo. A 15 minutos de Nevados de Chillán.",
    "url": "https://domostreepod.cl/glamping-valle-las-trancas",
    "telephone": "+56984643307",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ruta N-55 km 71 hacia Nevados de Chillan",
        "addressLocality": "Valle Las Trancas",
        "addressRegion": "Ñuble",
        "addressCountry": "CL"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": -36.8972,
        "longitude": -71.4741
    },
    "priceRange": "$$",
    "starRating": { "@type": "Rating", "ratingValue": "4.9" },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "59"
    },
    "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Bosque nativo privado", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Estufa a pellet automática", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "WiFi Starlink", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Cocina equipada", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Estacionamiento privado", "value": true }
    ]
};

export default function GlampingValleLasTrancasPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_glamping_valle_las_trancas" />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* HERO SECTION */}
            <section className="relative h-[85vh] min-h-[550px] md:min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/Galeria/lastrancas-exterior-domo-14-2.jpg"
                        alt="Domo geodésico TreePod en Valle Las Trancas rodeado de bosque nativo"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/60 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                    <div className="inline-block mb-8 bg-primary/20 backdrop-blur-md border border-primary/30 px-6 py-2 rounded-full animate-fade-in-up">
                        <span className="text-white text-xs font-black tracking-[0.2em] uppercase">
                            <MapPin className="inline w-3 h-3 mr-1" /> Valle Las Trancas · Nevados de Chillán
                        </span>
                    </div>

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-4xl mx-auto animate-fade-in-up delay-100 !text-white leading-tight">
                        Domos en Las Trancas: <br className="hidden md:block" />
                        glamping geodésico <span className="text-primary italic-display block md:inline">en bosque nativo</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <p className="text-white/90 text-sm md:text-base font-bold tracking-wide max-w-2xl mx-auto">
                            Estufa a pellet · cocina equipada · WiFi Starlink incluidos
                        </p>
                    </div>

                    <p className="text-base md:text-xl text-white/95 font-bold mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Tu propio refugio en la cordillera. Sin vecinos ruidosos, sin pasillos de hotel. Solo tú, el bosque nativo y la montaña a un paso del domo.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=glamping-las-trancas"
                            eventName="click_reservar_glamping_trancas"
                            secondEventName="begin_checkout_glamping_trancas"
                            secondParams={{ event: "glamping_valle_las_trancas" }}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-5 px-8 md:py-6 md:px-12 rounded-full transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-1 tracking-widest uppercase"
                        >
                            <span className="text-lg md:text-xl">VER DISPONIBILIDAD Y TARIFAS</span>
                            <span className="text-sm font-normal opacity-90">(Reserva directa, mejor precio)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-bold uppercase tracking-tighter text-sm">¿Preguntas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_glamping_trancas"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center gap-2"
                            >
                                Consultar por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 1 – QUÉ INCLUYE */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">Todo lo que necesitas para una estadía perfecta <span className="italic-display text-primary">en Las Trancas</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            No es una cabaña tradicional. Es un domo geodésico de 6 metros con todo incluido.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Waves,
                                title: "Tinaja privada de ciprés (de temporada)",
                                desc: "Cada domo tiene su propia tinaja de agua caliente con pasarela por el bosque, sin compartir con nadie. Es un servicio de temporada: no opera en invierno y vuelve en primavera."
                            },
                            {
                                icon: Thermometer,
                                title: "Estufa a pellet automática: 22°C siempre",
                                desc: "Olvídate de pasar frío. La estufa programable mantiene tu domo cálido toda la noche. Afuera puede estar bajo cero, adentro estarás en polera."
                            },
                            {
                                icon: TreePine,
                                title: "Bosque nativo real, no un jardín decorado",
                                desc: "Los domos están inmersos en bosque nativo de robles, coigües y ñirres. No hay cabañas pegadas ni vecinos a pocos metros. Privacidad de verdad."
                            },
                            {
                                icon: Mountain,
                                title: "A 15 minutos de Nevados de Chillán",
                                desc: "Ski en invierno, trekking en verano, termas todo el año. La ubicación perfecta en el kilómetro 71 de la ruta N-55 hacia Nevados de Chillan."
                            },
                            {
                                icon: Wifi,
                                title: "WiFi Starlink de alta velocidad",
                                desc: "Internet satelital real en la montaña. Trabaja remoto, sube fotos o haz streaming sin cortes. Conectado cuando lo necesites, tranquilo cuando no."
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-black/5 flex flex-col md:flex-row gap-8 items-start group hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <item.icon size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-display font-black mb-4 text-text-main leading-tight">{item.title}</h3>
                                    <p className="text-text-sub text-lg font-bold leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECCIÓN 2 – GALERÍA */}
            <section className="py-16 md:py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Así se ve tu alojamiento en Las Trancas</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            Fotos reales de los domos TreePod. Sin filtros, sin IA, sin trucos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/Galeria/domo-iluminado-noche.jpg"
                                alt="Domo geodésico iluminado de noche en Valle Las Trancas"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Domo panorámico</p>
                                <p className="text-xs opacity-80">Vista al bosque nativo</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg"
                                alt="Interior cálido del domo con cama king y estufa a pellet"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Interior equipado</p>
                                <p className="text-xs opacity-80">Cama king + estufa a pellet</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/wellness/Tinaja1.jpg"
                                alt="Tinaja privada de ciprés en el bosque nativo de Las Trancas"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Tinaja privada</p>
                                <p className="text-xs opacity-80">Ciprés · servicio de temporada</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/Cocina.jpg"
                                alt="Cocina completamente equipada del domo en Las Trancas"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Cocina completa</p>
                                <p className="text-xs opacity-80">Cafetera Nespresso incluida</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=glamping-las-trancas"
                            eventName="click_reservar_glamping_trancas"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all shadow-lg items-center justify-center gap-2 tracking-wide uppercase text-lg"
                        >
                            Ver disponibilidad y precios
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3 – QUÉ INCLUYE CADA DOMO */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Todo incluido en tu domo <span className="italic-display text-primary">TreePod</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            Cada detalle pensado para que no eches nada de menos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-black/5">
                            <h3 className="text-2xl font-display font-black mb-6 text-primary">Equipamiento</h3>
                            <ul className="space-y-4">
                                {[
                                    "Tinaja privada de ciprés (servicio de temporada)",
                                    "Estufa a pellet automática y programable",
                                    "Cama king con ropa de cama de calidad",
                                    "Cocina equipada con Nespresso",
                                    "Baño completo con agua caliente",
                                    "WiFi Starlink de alta velocidad",
                                    "Terraza privada con vista al bosque",
                                    "Estacionamiento en la puerta",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check size={20} className="text-primary flex-shrink-0 mt-1" />
                                        <span className="text-text-sub font-bold">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-black/5">
                            <h3 className="text-2xl font-display font-black mb-6 text-primary">Experiencia</h3>
                            <ul className="space-y-4">
                                {[
                                    "Vista panorámica del bosque nativo",
                                    "Privacidad real, sin vecinos cercanos",
                                    "Check-in flexible y autónomo",
                                    "Guía de experiencias locales",
                                    "A 15 min de Nevados de Chillán",
                                    "Senderos de trekking desde el glamping",
                                    "Registro Sernatur verificado",
                                    "Atención directa por WhatsApp",
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check size={20} className="text-primary flex-shrink-0 mt-1" />
                                        <span className="text-text-sub font-bold">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 4 – RESEÑAS */}
            <section className="py-16 md:py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Lo que dicen quienes ya se quedaron en TreePod</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            4.9 estrellas en Google con 59 reseñas verificadas
                        </p>
                    </div>

                    <div className="w-full relative min-h-[250px] md:min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-[2rem]">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-3 opacity-50">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-text-sub">Cargando reseñas...</span>
                            </div>
                        </div>
                    </div>

                    <Script
                        src="https://elfsightcdn.com/platform.js"
                        strategy="afterInteractive"
                        defer
                    />
                </div>
            </section>

            {/* SECCIÓN 5 – UBICACIÓN Y CONTEXTO */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Dónde estamos en Valle Las Trancas</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { title: "15 min", desc: "a Nevados de Chillán (ski, termas, trekking)" },
                            { title: "5.5 hrs", desc: "desde Santiago por ruta 5 Sur" },
                            { title: "1 hr", desc: "desde Chillán ciudad" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 md:p-8 rounded-xl md:rounded-[2rem] shadow-lg border border-black/5 text-center">
                                <p className="text-4xl font-display font-black text-primary mb-3">{item.title}</p>
                                <p className="text-text-sub font-bold text-lg">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 max-w-4xl mx-auto text-center">
                        <p className="text-lg text-text-sub font-bold leading-relaxed mb-8">
                            TreePod está en el kilómetro 71 de la ruta N-55 hacia Nevados de Chillan, en el corazón del Valle Las Trancas. Rodeados de bosque nativo, con acceso directo a senderos de trekking, rutas de mountain bike, cascadas y la Laguna del Huemul. En invierno, a minutos del centro de ski. En verano, el punto de partida perfecto para explorar la cordillera de Ñuble.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 border border-white/20 shadow-2xl text-center">

                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            Reserva directo y obtén el mejor precio
                        </h2>

                        <p className="text-lg md:text-xl text-white/80 font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
                            Sin comisiones de Airbnb ni Booking. Al reservar directo en domostreepod.cl tienes el precio más bajo garantizado y atención personalizada por WhatsApp.
                        </p>

                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=glamping-las-trancas"
                            eventName="click_reservar_glamping_trancas_final"
                            secondEventName="begin_checkout_glamping_trancas"
                            secondParams={{ event: "glamping_valle_las_trancas" }}
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-5 px-10 rounded-full transition-all shadow-xl items-center justify-center gap-2 tracking-widest uppercase transform hover:scale-105"
                        >
                            <span className="text-lg md:text-xl">VER DISPONIBILIDAD AHORA</span>
                        </TrackedLink>

                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Mejor Precio Directo</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Confirmación Inmediata</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Registro Sernatur</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
