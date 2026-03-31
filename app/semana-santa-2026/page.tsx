import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, Coffee, Info, Check } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Semana Santa 2026 en TreePod | Valle Las Trancas',
    description: 'Vive una Semana Santa de descanso real en nuestros domos. Tinaja caliente exclusiva, bosque nativo y descanso auténtico en Nevados de Chillán.',
    openGraph: {
        title: 'Semana Santa 2026 en TreePod | Valle Las Trancas',
        description: 'Vive una Semana Santa de descanso real en nuestros domos. Tinaja caliente exclusiva, bosque nativo y descanso auténtico.',
        images: ['/images/Semana Santa en el bosque.png'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me gustaría consultar por la estadía de Semana Santa 2026.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export default function SemanaSantaPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_semana_santa_page" />

            {/* HERO SECTION */}
            <section className="relative h-[85vh] min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/Semana Santa en el bosque.png"
                        alt="Semana Santa en TreePod"
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
                            Semana Santa 2026 · Valle Las Trancas
                        </span>
                    </div>

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
                        Escapa del caos de Semana Santa <br className="hidden md:block" />
                        y enciérrate en el bosque <span className="text-primary italic-display block md:inline">(con tu propia tinaja hirviendo)</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <div className="inline-block bg-primary/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl">
                            <span className="text-white text-2xl md:text-3xl font-black tracking-wide">
                                Desde $110.000 por noche
                            </span>
                            <span className="block text-white/80 text-sm font-bold mt-1">
                                Estadía mínima 3 noches · Abril 2026
                            </span>
                        </div>
                    </div>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 max-w-4xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        El 99% de la gente pasará sus vacaciones estresada en lugares llenos. <br className="hidden md:block" />
                        Tú estarás en medio de la cordillera, sin escuchar a nadie y con el calor perfecto 24/7.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa"
                            secondEventName="begin_checkout_semana_santa"
                            secondParams={{ event: "semana_santa_2026" }}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-6 px-12 rounded-full transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-1 tracking-widest uppercase"
                        >
                            <span className="text-xl md:text-2xl">BLOQUEA TU REFUGIO AHORA</span>
                            <span className="text-sm font-normal opacity-90">(02–05 Abril)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-bold uppercase tracking-tighter text-sm">¿Dudas rápidas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_semana_santa"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center gap-2"
                            >
                                Consultar disponibilidad por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 1 – BENEFICIOS */}
            <section className="py-24 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">Olvida la rutina. Tu único trabajo aquí será <span className="italic-display text-primary">descansar</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            { 
                                icon: Mountain, 
                                title: "El único sonido será el del viento", 
                                desc: "Estás lo suficientemente lejos del bullicio para relajarte de verdad. Duerme hasta la hora que quieras y despierta rodeado de bosque nativo." 
                            },
                            { 
                                icon: Waves, 
                                title: "Tu propia Tinaja bajo las estrellas (Cero extraños)", 
                                desc: "No compartas tu agua termal. Cruza tu pasarela exclusiva por el bosque y aíslate del mundo en tu propia tina de ciprés, siempre lista para ti (Reserva tu hora exclusiva sin compartir con otros)." 
                            },
                            { 
                                icon: Info, 
                                title: "Afuera hace frío, adentro estás en polera", 
                                desc: "Olvídate de sufrir o pasar frío en la montaña. Tu domo tiene una estufa a pellet automática que mantiene el espacio cálido y perfecto de día y de noche." 
                            },
                            { 
                                icon: Coffee, 
                                title: "Mañanas sin prisa", 
                                desc: "Despierta con la luz natural y tómate un café caliente en tu terraza exclusiva sin estrés." 
                            },
                            { 
                                icon: Check, 
                                title: "Aislado de todo, pero conectado (si quieres)", 
                                desc: "Internet satelital Starlink de alta velocidad. Perfecto por si quieres subir fotos o ver una película por la noche sin cortes." 
                            }
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

            {/* SECCIÓN 2 – GALERÍA INTERIOR */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Tu refugio privado en el bosque</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            Interior cálido, tinaja exclusiva y todo lo necesario para desconectarte del mundo
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg"
                                alt="Interior acogedor del domo con cama y estufa"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Interior cálido</p>
                                <p className="text-xs opacity-80">Estufa a pellet automática</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/Cocina.jpg"
                                alt="Cocina completa del domo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Cocina equipada</p>
                                <p className="text-xs opacity-80">Todo para cocinar</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/wellness/Tinaja1.jpg"
                                alt="Tinaja de agua termal privada"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Tu tinaja privada</p>
                                <p className="text-xs opacity-80">Solo para ti</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/interior-domo-acogedor-21-3.jpg"
                                alt="Ambiente acogedor del interior"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Espacio para relajar</p>
                                <p className="text-xs opacity-80">Ambiente perfecto</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all shadow-lg items-center justify-center gap-2 tracking-wide uppercase text-lg"
                        >
                            Ver disponibilidad para estas fechas
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3 – RESEÑAS REALES */}
            <section className="py-24 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Lo que dicen nuestros huéspedes</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            Reseñas reales de quienes ya vivieron la experiencia TreePod
                        </p>
                    </div>

                    {/* Widget de Elfsight Reviews - Igual que página principal */}
                    <div className="w-full relative min-h-[500px]">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab"></div>
                    </div>

                    <Script
                        src="https://elfsightcdn.com/platform.js"
                        strategy="afterInteractive"
                        defer
                    />

                    <div className="text-center mt-16">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all shadow-lg items-center justify-center gap-2 tracking-wide uppercase text-lg"
                        >
                            Únete a nuestros huéspedes satisfechos
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 4 – URGENCIA Y CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-2xl text-center">
                        
                        <div className="inline-flex items-center gap-3 bg-primary/20 text-primary border border-primary/30 px-5 py-1.5 rounded-full mb-8">
                            <Info size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Atención: Cupos Limitados</span>
                        </div>

                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            Semana Santa siempre colapsa en el Valle
                        </h2>

                        <p className="text-lg md:text-xl text-white/80 font-bold mb-6 leading-relaxed max-w-2xl mx-auto">
                            Este es el fin de semana más buscado del año y tenemos una disponibilidad muy limitada. Si lo dejas para después, te quedarás atrapado en la ciudad o pagando de más por lugares repletos de gente.
                        </p>

                        <p className="text-primary text-xl font-black mb-10 italic">
                            (Estadía exclusiva de mínimo 3 noches: 02 al 05 de abril)
                        </p>

                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa_final"
                            secondEventName="begin_checkout_semana_santa"
                            secondParams={{ event: "semana_santa_2026" }}
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-5 px-10 rounded-full transition-all shadow-xl items-center justify-center gap-2 tracking-widest uppercase transform hover:scale-105"
                        >
                            <span className="text-lg md:text-xl">ASEGURA TU ESCAPE ANTES DE QUE SE AGOTEN</span>
                        </TrackedLink>

                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Pago Verificado</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Confirmación Inmediata</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Entorno Natural</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
