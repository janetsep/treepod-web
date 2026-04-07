import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, Shield, Thermometer, Wifi, Check, Ruler } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Domos Geodésicos en Chillán | Glamping TreePod - Valle Las Trancas',
    description: 'Domos geodésicos habitables en Chillán, Valle Las Trancas. Estructura de 6 metros, tinaja privada, estufa a pellet y WiFi Starlink. A 15 min de Nevados de Chillán. Desde $110.000/noche.',
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
        description: 'Domos geodésicos de 6m con tinaja privada en bosque nativo. A 15 min de Nevados de Chillán.',
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
    "name": "TreePod - Domos Geodésicos en Chillán",
    "description": "Domos geodésicos habitables con tinaja privada en Valle Las Trancas, Chillán. A 15 minutos de Nevados de Chillán.",
    "url": "https://domostreepod.cl/domos-geodesicos-chillan",
    "telephone": "+56984643307",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Camino a Termas de Chillán km 28",
        "addressLocality": "Valle Las Trancas",
        "addressRegion": "Ñuble",
        "addressCountry": "CL"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": -36.8972,
        "longitude": -71.4741
    },
    "priceRange": "Desde $110.000 CLP por noche",
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "47"
    }
};

export default function DomosGeodesicosChillanPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_domos_geodesicos_chillan" />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* HERO */}
            <section className="relative h-[85vh] min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/Galeria/noche-domo-iluminado-2-2.jpg"
                        alt="Domo geodésico iluminado de noche en Valle Las Trancas, Chillán"
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
                            Domos Geodésicos · Valle Las Trancas · Chillán
                        </span>
                    </div>

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
                        Domos geodésicos en Chillán: <br className="hidden md:block" />
                        duerme bajo las estrellas <span className="text-primary italic-display block md:inline">sin pasar frío</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <div className="inline-block bg-primary/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl">
                            <span className="text-white text-2xl md:text-3xl font-black tracking-wide">
                                Desde $110.000 por noche
                            </span>
                            <span className="block text-white/80 text-sm font-bold mt-1">
                                Domos de 6m con equipamiento completo
                            </span>
                        </div>
                    </div>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 max-w-4xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Estructura geodésica de 6 metros de diámetro con vista panorámica al bosque nativo. Tinaja privada, estufa automática y todo el confort que no esperas en la montaña.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan"
                            secondEventName="begin_checkout_domos_chillan"
                            secondParams={{ event: "domos_geodesicos_chillan" }}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-6 px-12 rounded-full transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-1 tracking-widest uppercase"
                        >
                            <span className="text-xl md:text-2xl">RESERVAR UN DOMO</span>
                            <span className="text-sm font-normal opacity-90">(Mejor precio directo)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-bold uppercase tracking-tighter text-sm">¿Preguntas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_domos_chillan"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center gap-2"
                            >
                                Consultar por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN – ESPECIFICACIONES DEL DOMO */}
            <section className="py-24 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">¿Qué hace especial a un domo geodésico <span className="italic-display text-primary">TreePod</span>?</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Ruler,
                                title: "6 metros de diámetro, vista panorámica total",
                                desc: "La estructura geodésica permite ventanales que cubren gran parte del domo. Desde tu cama ves el bosque nativo, las estrellas y la cordillera de Ñuble."
                            },
                            {
                                icon: Shield,
                                title: "Estructura que soporta nieve y viento extremo",
                                desc: "El diseño geodésico distribuye la carga uniformemente. Soporta las nevadas del invierno cordillerano sin problemas. Probado en temporadas de ski intensas."
                            },
                            {
                                icon: Thermometer,
                                title: "Climatización inteligente con pellet",
                                desc: "Estufa a pellet programable que mantiene 22°C toda la noche. No necesitas levantarte a alimentar fuego. El domo amanece caliente incluso cuando afuera está nevando."
                            },
                            {
                                icon: Waves,
                                title: "Tu propia tinaja de ciprés en el bosque",
                                desc: "Cada domo tiene acceso exclusivo a una tinaja de agua caliente rodeada de bosque nativo. Sin compartir, sin horarios, sin reservar turno."
                            },
                            {
                                icon: Mountain,
                                title: "A 15 minutos de Nevados de Chillán",
                                desc: "Ski, snowboard, termas y trekking a minutos de tu domo. La ubicación ideal en el km 28 del camino a Termas de Chillán."
                            },
                            {
                                icon: Wifi,
                                title: "WiFi Starlink: internet real en la montaña",
                                desc: "Conexión satelital de alta velocidad. Ideal para trabajo remoto, streaming o simplemente subir las fotos de tu estadía sin esperar."
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-black/5 flex flex-col md:flex-row gap-8 items-start group hover:shadow-2xl transition-all duration-300">
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

            {/* GALERÍA */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Así son los domos TreePod por dentro y por fuera</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/Galeria/lastrancas-exterior-domo-8-2.jpg"
                                alt="Exterior del domo geodésico TreePod en el bosque"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Estructura geodésica</p>
                                <p className="text-xs opacity-80">6 metros de diámetro</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/interiors/interior-vista-bosque.jpg"
                                alt="Vista panorámica del bosque desde el interior del domo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Vista panorámica</p>
                                <p className="text-xs opacity-80">Ventanales al bosque nativo</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/wellness/Tinaja5.jpg"
                                alt="Tinaja privada de ciprés rodeada de bosque nativo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Tinaja privada</p>
                                <p className="text-xs opacity-80">Exclusiva por domo</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/interior-domo-acogedor-21-3.jpg"
                                alt="Interior acogedor del domo geodésico con iluminación cálida"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Ambiente acogedor</p>
                                <p className="text-xs opacity-80">Diseño cálido y funcional</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all shadow-lg items-center justify-center gap-2 tracking-wide uppercase text-lg"
                        >
                            Ver disponibilidad de domos
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* RESEÑAS */}
            <section className="py-24 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Reseñas reales de huéspedes</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">4.9 estrellas en Google con 47 reseñas verificadas</p>
                    </div>

                    <div className="w-full relative min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-[2rem]">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-3 opacity-50">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-text-sub">Cargando reseñas...</span>
                            </div>
                        </div>
                    </div>
                    <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" defer />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-2xl text-center">
                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            Reserva tu domo geodésico al mejor precio
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
                            Reserva directa en domostreepod.cl, sin comisiones de intermediarios. Precio más bajo garantizado y atención personalizada.
                        </p>
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan_final"
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
