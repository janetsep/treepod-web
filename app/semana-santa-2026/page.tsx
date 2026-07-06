import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, Coffee, Info, Check } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Semana Santa 2026 en TreePod | Glamping Valle Las Trancas',
    description: 'Pasa Semana Santa con calma en nuestros domos geodésicos del Valle Las Trancas. Bosque nativo, estufa a pellet y descanso real cerca de Nevados de Chillán.',
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/semana-santa-2026',
    },
    openGraph: {
        title: 'Semana Santa 2026 en TreePod | Valle Las Trancas',
        description: 'Pasa Semana Santa con calma en nuestros domos del Valle Las Trancas: bosque nativo, estufa a pellet y descanso real.',
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
                        Pasa Semana Santa lejos del bullicio <br className="hidden md:block" />
                        en un domo entre el bosque <span className="text-primary italic-display block md:inline">de Valle Las Trancas</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <div className="inline-block bg-primary/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl">
                            <span className="text-white text-2xl md:text-3xl font-black tracking-wide">
                                Tarifas según temporada
                            </span>
                            <span className="block text-white/80 text-sm font-bold mt-1">
                                Revisa el precio de tus fechas en el calendario de reservas
                            </span>
                        </div>
                    </div>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 max-w-4xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Mientras los destinos de siempre se llenan, aquí tienes bosque nativo, aire puro <br className="hidden md:block" />
                        y un domo cálido en plena cordillera de Ñuble. Sin filas, sin ruido, sin apuro.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa"
                            secondEventName="begin_checkout_semana_santa"
                            secondParams={{ event: "semana_santa_2026" }}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 md:py-5 md:px-10 rounded-full transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="text-xl md:text-2xl">Reserva tu refugio ahora</span>
                            <span className="text-sm font-normal opacity-90">(02–05 Abril)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-semibold text-sm">¿Dudas rápidas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_semana_santa"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-full transition-all text-sm flex items-center justify-center gap-2"
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
                                title: "El sonido del viento y poco más",
                                desc: "Estás lo bastante lejos del bullicio para descansar de verdad. Duerme hasta la hora que quieras y despierta rodeado de bosque nativo."
                            },
                            {
                                icon: Waves,
                                title: "Bosque nativo y cielo estrellado",
                                desc: "Domos separados entre sí e inmersos en bosque nativo, cada uno con su pasarela. De noche, el cielo despejado de Las Trancas. La tinaja de ciprés es un servicio de temporada que vuelve en primavera."
                            },
                            { 
                                icon: Info, 
                                title: "Afuera hace frío, adentro estás en polera",
                                desc: "Nada de pasar frío en la montaña. Tu domo tiene una estufa a pellet automática que lo mantiene cálido de día y de noche."
                            },
                            { 
                                icon: Coffee, 
                                title: "Mañanas sin prisa", 
                                desc: "Despierta con la luz natural y tómate un café caliente en tu terraza, sin apuro."
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
                            Interior cálido, cocina equipada y todo lo necesario para descansar tranquilo
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
                                alt="Tinaja de ciprés rodeada de bosque nativo"
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
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg active:scale-95 items-center justify-center gap-2 text-base"
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
                    <div className="w-full relative min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-[2rem]">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        {/* Loading placeholder */}
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

                    <div className="text-center mt-16">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg active:scale-95 items-center justify-center gap-2 text-base"
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
                            Semana Santa se llena rápido en el Valle
                        </h2>

                        <p className="text-lg md:text-xl text-white/80 font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
                            Es uno de los fines de semana más buscados del año y tenemos pocos domos disponibles para estas fechas. Si te interesa, conviene reservar con tiempo.
                        </p>

                        <div className="text-center mb-10">
                            <p className="text-primary text-xl font-black italic mx-auto">
                                (Estadía mínima de 3 noches: 02 al 05 de abril)
                            </p>
                        </div>

                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa_final"
                            secondEventName="begin_checkout_semana_santa"
                            secondParams={{ event: "semana_santa_2026" }}
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-9 rounded-full transition-all shadow-xl active:scale-95 items-center justify-center gap-2"
                        >
                            <span className="text-lg md:text-xl">Reserva antes de que se agoten las fechas</span>
                        </TrackedLink>

                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Pago Verificado</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Reserva con el 50%</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Entorno Natural</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
