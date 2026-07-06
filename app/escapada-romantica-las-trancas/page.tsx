import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Heart, Waves, Moon, Thermometer, Wine, Check, Star } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Escapada Romántica con Tinaja en Las Trancas | TreePod',
    description: 'Domo privado para dos en el bosque de Las Trancas: tinaja de ciprés en temporada, estufa a pellet y cielo estrellado. Reserva directo, sin comisiones.',
    keywords: [
        'escapada romantica las trancas',
        'escapada romantica chile',
        'glamping romantico chile',
        'domos romanticos las trancas',
        'escapada de pareja chile',
        'aniversario las trancas',
        'tinaja privada pareja',
        'glamping parejas chile',
        'noche romantica domos',
        'escapada romantica con tinaja',
    ],
    alternates: {
        canonical: '/escapada-romantica-las-trancas',
    },
    openGraph: {
        title: 'Escapada Romántica con Tinaja en Las Trancas | TreePod',
        description: 'Domo privado para dos en el bosque de Las Trancas: tinaja de ciprés en temporada, estufa a pellet y cielo estrellado.',
        images: ['/images/Galeria/domo-iluminado-noche.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa una escapada romántica en los domos. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export default function EscapadaRomanticaPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_escapada_romantica" />

            {/* HERO */}
            <section className="relative h-[85vh] min-h-[550px] md:min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/Galeria/domo-iluminado-noche.jpg"
                        alt="Domo TreePod iluminado de noche para una escapada romántica"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/60 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                    <div className="inline-block mb-8 bg-rose-700/30 backdrop-blur-md border border-rose-400/30 px-6 py-2 rounded-full animate-fade-in-up">
                        <span className="text-white text-xs font-black tracking-[0.2em] uppercase">
                            <Heart className="inline w-3 h-3 mr-1" /> Escapada para Dos · Todo el Año
                        </span>
                    </div>

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-4xl mx-auto animate-fade-in-up delay-100 !text-white leading-tight">
                        Tu escapada romántica: <br className="hidden md:block" />
                        un domo en el bosque <span className="text-rose-400 italic-display block md:inline">solo para ustedes dos</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <p className="text-white/90 text-sm md:text-base font-bold tracking-wide max-w-2xl mx-auto">
                            Estufa a pellet · cocina equipada · WiFi Starlink · tinaja de ciprés en temporada
                        </p>
                    </div>

                    <p className="text-base md:text-xl text-white/95 font-bold mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Una escapada para dos: bosque nativo, el cielo estrellado de Las Trancas y privacidad, sin nadie más alrededor.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=escapada-romantica"
                            eventName="click_reservar_romantica"
                            secondEventName="begin_checkout_romantica"
                            secondParams={{ event: "escapada_romantica" }}
                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 px-8 md:py-5 md:px-10 rounded-full transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="text-lg md:text-xl">Reserva tu escapada</span>
                            <span className="text-sm font-normal opacity-90">(Mejor precio directo)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-semibold text-sm">¿Sorpresa?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_romantica"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-full transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Coordina por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* POR QUÉ TREEPOD ES PERFECTO PARA PAREJAS */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">Por qué TreePod funciona bien <span className="italic-display text-primary">para una escapada de pareja</span></h2>
                        <div className="h-1.5 w-24 bg-rose-500 mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Waves,
                                title: "Un domo solo para ustedes",
                                desc: "Cada domo está separado del resto e inmerso en bosque nativo, con su propia pasarela. Sin pasillos ni vecinos al lado. La tinaja de ciprés es un servicio de temporada que vuelve en primavera."
                            },
                            {
                                icon: Moon,
                                title: "Noches bajo las estrellas sin salir del domo",
                                desc: "El domo geodésico tiene ventanales amplios. Desde la cama ves las estrellas y el bosque nativo. Sin cortinas si no quieres, sin vecinos al lado."
                            },
                            {
                                icon: Thermometer,
                                title: "Calor automático toda la noche",
                                desc: "La estufa a pellet mantiene el domo cálido sin que tengas que levantarte. Despierta tibio, prepara un café en la Nespresso y quédate en la cama todo lo que quieras."
                            },
                            {
                                icon: Wine,
                                title: "Cocina para preparar algo especial",
                                desc: "Cocina completamente equipada para preparar una cena para dos. Trae tu vino favorito y tu receta especial, o preparen algo simple y cenen sin prisa."
                            },
                            {
                                icon: Star,
                                title: "Privacidad en el bosque",
                                desc: "Los domos están separados entre sí e inmersos en bosque nativo. No hay pasillos de hotel ni recepción con gente. Solo naturaleza y privacidad."
                            },
                            {
                                icon: Heart,
                                title: "Perfecto para celebrar",
                                desc: "Aniversario, cumpleaños, compromiso o simplemente una escapada sin motivo. Escríbenos por WhatsApp si quieres coordinar algo especial para la ocasión."
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-black/5 flex flex-col md:flex-row gap-8 items-start group hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 flex-shrink-0 group-hover:scale-110 transition-transform">
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
                        <h2 className="h2-display text-text-main mb-6">Así se ve una escapada en TreePod</h2>
                        <div className="h-1.5 w-24 bg-rose-500 mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/Galeria/noche-domo-iluminado-2-2.jpg"
                                alt="Domo iluminado para una noche romántica"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Noche en el domo</p>
                                <p className="text-xs opacity-80">Iluminación cálida</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/wellness/Tinaja5.jpg"
                                alt="Tinaja privada de ciprés para dos"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Tinaja de ciprés</p>
                                <p className="text-xs opacity-80">Servicio de temporada (vuelve en primavera)</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/interiors/interior-domo-acogedor-89-2.jpg"
                                alt="Interior acogedor del domo con ambiente romántico"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Ambiente íntimo</p>
                                <p className="text-xs opacity-80">Cama king + vista al bosque</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/Galeria/Desayuno.jpg"
                                alt="Desayuno para dos en el domo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Mañanas sin prisa</p>
                                <p className="text-xs opacity-80">Café Nespresso + tu ritmo</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=escapada-romantica"
                            eventName="click_reservar_romantica"
                            className="inline-flex bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg active:scale-95 items-center justify-center gap-2 text-base"
                        >
                            Ver disponibilidad
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* RESEÑAS */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Parejas que ya vinieron a TreePod</h2>
                        <div className="h-1.5 w-24 bg-rose-500 mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">4.9 estrellas en Google con 59 reseñas verificadas</p>
                    </div>

                    <div className="w-full relative min-h-[250px] md:min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-[2rem]">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-3 opacity-50">
                                <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-text-sub">Cargando reseñas...</span>
                            </div>
                        </div>
                    </div>
                    <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" defer />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-rose-500">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 border border-white/20 shadow-2xl text-center">
                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            La mejor sorpresa es tiempo juntos en el lugar correcto
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
                            Reserva directa, con el mejor precio y sin comisiones de intermediarios. Si es una sorpresa, escríbenos por WhatsApp y te ayudamos a coordinar los detalles.
                        </p>
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=escapada-romantica"
                            eventName="click_reservar_romantica_final"
                            className="inline-flex bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 px-9 rounded-full transition-all shadow-xl active:scale-95 items-center justify-center gap-2"
                        >
                            <span className="text-lg md:text-xl">Reserva tu escapada</span>
                        </TrackedLink>
                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Mejor Precio Directo</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Bosque Nativo</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Privacidad Real</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
