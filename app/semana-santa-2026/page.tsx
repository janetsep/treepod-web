import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, Waves, Coffee, Info, Check, Sparkles, Heart } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Semana Santa 2026 en TreePod | Valle Las Trancas',
    description: 'Vive una Semana Santa de descanso real en nuestros domos. Tinaja caliente privada, bosque nativo y desconexión profunda en Nevados de Chillán.',
    openGraph: {
        title: 'Semana Santa 2026 en TreePod | Valle Las Trancas',
        description: 'Vive una Semana Santa de descanso real en nuestros domos. Tinaja caliente privada, bosque nativo y desconexión profunda.',
        images: ['/images/exteriors/domo-exterior-arrival.jpg'],
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
            <section className="relative h-[80vh] min-h-[600px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/exteriors/domo-exterior-arrival.jpg"
                        alt="Semana Santa en TreePod"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                    <div className="inline-block mb-6 md:mb-8 bg-primary/20 backdrop-blur-md border border-primary/30 px-6 py-2 rounded-full animate-fade-in-up">
                        <span className="text-white text-xs font-black tracking-[0.2em] uppercase">
                            Relajo · Bosque · Nevados de Chillán
                        </span>
                    </div>

                    <h1 className="h1-display mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
                        Semana Santa <br /><span className="text-primary italic">2026</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-10 max-w-3xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Una invitación al descanso real en el corazón del bosque nativo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                            eventName="click_reservar_semana_santa"
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all transform hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-2 tracking-widest uppercase text-sm"
                        >
                            Reservar ahora <span className="font-normal opacity-80">(02–05 abril)</span>
                            <ArrowRight size={18} />
                        </TrackedLink>

                        <TrackedLink
                            href={whatsappUrl}
                            eventName="click_whatsapp_semana_santa"
                            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-4 px-8 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center"
                        >
                            Consultar por WhatsApp
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 1 – LA EXPERIENCIA DE DESCANSO */}
            <section className="py-20 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">El Refugio <span className="italic-display text-primary">que Necesitas</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-6"></div>
                        <p className="text-text-sub text-lg font-bold">
                            Olvida la rutina. Aquí el único sonido es el del viento entre los árboles y la calma de la cordillera.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Sparkles, title: "Silencio Absoluto", desc: "Ubicación estratégica lejos del ruido para un descanso profundo." },
                            { icon: Waves, title: "Relajo en Tinaja", desc: "Agua caliente bajo las estrellas en la privacidad de tu domo." },
                            { icon: Coffee, title: "Mañanas Sin Prisa", desc: "Despierta con la luz natural y disfruta un café en tu terraza." },
                            { icon: Heart, title: "Conexión Real", desc: "El escenario perfecto para reencontrarse con lo esencial." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl border border-black/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <item.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-display font-black mb-3 text-text-main">{item.title}</h3>
                                <p className="text-text-sub font-bold">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECCIÓN 2 – TINAJA Y BOSQUE */}
            <section className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/Tinaja5.jpg"
                                alt="Tinaja caliente privada en el bosque"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        </div>

                        <div>
                            <div className="inline-block mb-6">
                                <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">
                                    Bienestar Auténtico
                                </span>
                            </div>
                            <h2 className="h2-display text-text-main mb-8">Tinaja Caliente <span className="italic-display text-primary">de Uso Exclusivo</span></h2>
                            <p className="text-xl text-text-sub leading-relaxed font-bold mb-8">
                                No compartas tu momento de relajo. En TreePod, cada domo cuenta con su propia tinaja de ciprés, lista para que disfrutes de un baño de agua termal en el horario que prefieras.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Acceso mediante pasarela privada por el bosque",
                                    "Uso exclusivo para los huéspedes de tu domo",
                                    "Atmósfera única rodeada de árboles nativos"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-text-main font-bold">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3 – PACK SEMANA SANTA */}
            <section className="py-20 md:py-32 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="h2-display text-white mb-6">Estadía <span className="italic text-primary drop-shadow-md">Semana Santa</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-6"></div>
                        <p className="text-white/80 text-lg font-bold">
                            Asegura tu refugio con anticipación y vive un fin de semana sagrado de descanso.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-2 px-6 rounded-bl-2xl">
                            Cupos Limitados
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 text-primary"><Check size={24} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Domo Geodésico</h4>
                                        <p className="text-white/70 text-sm">Arquitectura única diseñada para maximizar el confort y la calidez.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 text-primary"><Check size={24} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Calefacción Garantizada</h4>
                                        <p className="text-white/70 text-sm">Estufa a pellet programada para mantener tu espacio siempre cálido.</p>
                                    </div>
                                </li>
                            </ul>

                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 text-primary"><Waves size={24} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Tinaja Privada</h4>
                                        <p className="text-white/70 text-sm">Tu propio spa de ciprés al aire libre incluido en tu estadía.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 text-primary"><Coffee size={24} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Conectividad Starlink</h4>
                                        <p className="text-white/70 text-sm">Internet satelital de alta velocidad por si necesitas estar conectado.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-12 p-6 bg-black/40 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 uppercase">
                            <div className="flex items-center gap-4 text-primary">
                                <Info size={32} />
                                <div className="font-black tracking-widest">
                                    <span className="block text-white text-lg">Reserva Anticipada</span>
                                    <span className="text-xs">Mínimo 3 noches (02 - 05 abril)</span>
                                </div>
                            </div>

                            <div className="text-center md:text-right">
                                <div className="inline-block bg-white text-black text-xs font-black tracking-widest py-2 px-4 rounded-full mb-2 animate-pulse">
                                    ⚠️ Alta demanda para estas fechas
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <TrackedLink
                                href="/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa"
                                eventName="click_reservar_semana_santa"
                                className="w-full md:w-auto inline-flex bg-primary hover:bg-primary-dark text-white font-black py-5 px-10 rounded-full transition-all shadow-2xl items-center justify-center gap-3 tracking-widest uppercase text-sm"
                            >
                                Reservar mi lugar ahora
                                <ArrowRight size={20} />
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
