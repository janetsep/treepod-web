import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, Shield, Thermometer, Wifi, Check, Ruler } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

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

export default function DomosGeodesicosChillanPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_domos_geodesicos_chillan" />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* HERO */}
            <section className="relative h-[85vh] min-h-[550px] md:min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
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

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-4xl mx-auto animate-fade-in-up delay-100 !text-white leading-tight">
                        Domos geodésicos en Chillán: <br className="hidden md:block" />
                        duerme bajo las estrellas <span className="text-primary italic-display block md:inline">sin pasar frío</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <p className="text-white/90 text-sm md:text-base font-bold tracking-wide max-w-2xl mx-auto">
                            Estufa a pellet · cocina equipada · WiFi Starlink incluidos
                        </p>
                    </div>

                    <p className="text-base md:text-xl text-white/95 font-bold mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Estructura geodésica con 38 m² de interior y vista al bosque nativo. Estufa a pellet automática, cocina equipada y WiFi Starlink. La tinaja privada es servicio de temporada, vuelve en primavera.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan"
                            secondEventName="begin_checkout_domos_chillan"
                            secondParams={{ event: "domos_geodesicos_chillan" }}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 md:py-5 md:px-10 rounded-full transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="text-lg md:text-xl">Reservar un domo</span>
                            <span className="text-sm font-normal opacity-90">(Mejor precio directo)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-semibold text-sm">¿Preguntas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_domos_chillan"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-full transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Consultar por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN – ESPECIFICACIONES DEL DOMO */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">¿Qué hace especial a un domo geodésico <span className="italic-display text-primary">TreePod</span>?</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Ruler,
                                title: "38 m² de interior, vista panorámica",
                                desc: "La estructura geodésica permite ventanales que cubren gran parte del domo. Desde tu cama ves el bosque nativo y la cordillera de Ñuble."
                            },
                            {
                                icon: Shield,
                                title: "Estructura preparada para nieve y viento",
                                desc: "El diseño geodésico distribuye la carga de forma pareja. Resiste las nevadas del invierno cordillerano, temporada tras temporada de ski."
                            },
                            {
                                icon: Thermometer,
                                title: "Climatización inteligente con pellet",
                                desc: "Estufa a pellet programable que mantiene el domo cálido toda la noche. No necesitas levantarte a alimentar el fuego: el domo amanece tibio incluso cuando afuera está nevando."
                            },
                            {
                                icon: Waves,
                                title: "Tinaja de ciprés privada (de temporada)",
                                desc: "Cada domo tiene acceso a su propia tinaja de agua caliente, sin compartir. Es un servicio de temporada: no opera en invierno y vuelve en primavera."
                            },
                            {
                                icon: Mountain,
                                title: "A 12 minutos de Nevados de Chillán",
                                desc: "Ski, snowboard, termas y trekking a minutos de tu domo. La ubicación ideal en el km 72 de la Ruta N-55 hacia Nevados de Chillán."
                            },
                            {
                                icon: Wifi,
                                title: "WiFi Starlink: internet real en la montaña",
                                desc: "Conexión satelital de alta velocidad. Ideal para trabajo remoto, streaming o simplemente subir las fotos de tu estadía sin esperar."
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

            {/* GALERÍA */}
            <section className="py-16 md:py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Así son los domos TreePod por dentro y por fuera</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
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
                                <p className="text-xs opacity-80">38 m² + terraza privada</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
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

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
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
                                <p className="text-xs opacity-80">Servicio de temporada</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
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
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg active:scale-95 items-center justify-center gap-2 text-base"
                        >
                            Ver disponibilidad de domos
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* RESEÑAS */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Reseñas reales de huéspedes</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">4,9 estrellas en Google con 59 reseñas verificadas</p>
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
                    <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" defer />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 border border-white/20 shadow-2xl text-center">
                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            Reserva tu domo geodésico al mejor precio
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
                            Reserva directa en domostreepod.cl, sin comisiones de intermediarios. Mejor precio directo y atención personalizada por WhatsApp.
                        </p>
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=domos-chillan"
                            eventName="click_reservar_domos_chillan_final"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-9 rounded-full transition-all shadow-xl active:scale-95 items-center justify-center gap-2"
                        >
                            <span className="text-lg md:text-xl">Ver disponibilidad ahora</span>
                        </TrackedLink>
                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Mejor Precio Directo</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Reserva con el 50%</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Registro Sernatur</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
