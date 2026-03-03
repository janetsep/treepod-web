import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, Coffee, Info, Check } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Alojamiento Mundial MTB 2026 | Domos TreePod',
    description: 'Domos para 4 personas con tinaja caliente y pack deportivo en Valle Las Trancas. A minutos de Nevados de Chillán.',
    openGraph: {
        title: 'Alojamiento Mundial MTB 2026 | Domos TreePod',
        description: 'Domos para 4 personas con tinaja caliente y pack deportivo en Valle Las Trancas. A minutos de Nevados de Chillán.',
        images: ['/images/exteriors/domo-exterior-arrival.jpg'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me gustaría consultar por el pack especial Alojamiento Mundial MTB 2026.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export default function MundialMtbPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_mundial_page" />

            {/* HERO SECTION */}
            <section className="relative h-[80vh] min-h-[600px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/exteriors/domo-exterior-arrival.jpg"
                        alt="Domo alojamiento Mundial MTB"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                    <div className="inline-block mb-6 md:mb-8 bg-primary/20 backdrop-blur-md border border-primary/30 px-6 py-2 rounded-full animate-fade-in-up">
                        <span className="text-white text-xs font-black tracking-[0.2em] uppercase">
                            Valle Las Trancas · Nevados de Chillán
                        </span>
                    </div>

                    <h1 className="h1-display mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
                        Alojamiento <span className="text-primary italic">Mundial MTB 2026</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-10 max-w-3xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        Domos para 4 personas con tinaja caliente y pack deportivo especial.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-03-26&salida=2026-03-29&adultos=4&event=mundial"
                            eventName="click_reservar_mundial"
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all transform hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-2 tracking-widest uppercase text-sm"
                        >
                            Reservar ahora <span className="font-normal opacity-80">(26–29 marzo)</span>
                            <ArrowRight size={18} />
                        </TrackedLink>

                        <TrackedLink
                            href={whatsappUrl}
                            eventName="click_whatsapp_mundial"
                            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-4 px-8 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center"
                        >
                            Consultar por WhatsApp
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 1 – DOMOS PARA EQUIPOS */}
            <section className="py-20 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Domos Diseñados para <span className="italic-display text-primary">Equipos</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-6"></div>
                        <p className="text-text-sub text-lg font-bold">
                            Descanso absoluto y funcionalidad. Todo lo que tu equipo necesita para la competencia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Mountain, title: "Capacidad 4 personas", desc: "Espacio cómodo y camas preparadas para el mejor descanso." },
                            { icon: Check, title: "Espacio para bicicletas", desc: "Guarda tu equipo con total seguridad dentro o junto al domo." },
                            { icon: Check, title: "Estacionamiento privado", desc: "A pasos de tu domo para facilitar tu logística diaria." },
                            { icon: Check, title: "Cocina equipada", desc: "Prepara tus comidas y suplementos con total libertad." }
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

            {/* SECCIÓN 2 – RECUPERACIÓN DEPORTIVA */}
            <section className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <Image
                                src="/images/wellness/Tinaja1.jpg"
                                alt="Tinaja caliente de relajación"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-10 left-10 text-white">
                                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mb-2">
                                    <Waves size={16} /> Agua Termal
                                </div>
                                <h3 className="font-display font-black text-2xl drop-shadow-md">Exclusividad Post-Carrera</h3>
                            </div>
                        </div>

                        <div>
                            <div className="inline-block mb-6">
                                <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">
                                    Recuperación Muscular
                                </span>
                            </div>
                            <h2 className="h2-display text-text-main mb-8">Tinaja Caliente <span className="italic-display text-primary">Privada</span></h2>
                            <p className="text-xl text-text-sub leading-relaxed font-bold mb-8">
                                El contraste ideal después de horas en la montaña. El agua a temperatura perfecta acelera tu recuperación muscular, mejora la circulación y reduce el riesgo de lesiones para el siguiente día de competencia.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Lista y a temperatura ideal a tu regreso",
                                    "Uso 100% privado y exclusivo para tu domo (1 hora diaria en horario a elección)",
                                    "Entorno silencioso inmerso en el bosque nativo"
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

            {/* SECCIÓN 3 – PACK ESPECIAL MUNDIAL */}
            <section className="py-20 md:py-32 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="h2-display text-white mb-6">Alojamiento Exclusivo <span className="italic text-primary drop-shadow-md">Mundial MTB</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-6"></div>
                        <p className="text-white/80 text-lg font-bold">
                            Diseñado exclusivamente para el Mundial MTB 2026. Logística resuelta para que te enfoques en rendir.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-2 px-6 rounded-bl-2xl">
                            Edición Limitada
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 text-primary"><Check size={24} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Domo Completo</h4>
                                        <p className="text-white/70 text-sm">Para 4 personas. Máxima privacidad y espacio para equipos.</p>
                                    </div>
                                </li>
                            </ul>

                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 text-primary"><Waves size={24} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="font-bold text-xl mb-1">Tinaja Privada</h4>
                                        <p className="text-white/70 text-sm">Reserva 1 hora exclusiva diaria para potenciar tu recuperación.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-12 p-6 bg-black/40 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 uppercase">
                            <div className="flex items-center gap-4 text-primary">
                                <Info size={32} />
                                <div className="font-black tracking-widest">
                                    <span className="block text-white text-lg">Mínimo 3 noches</span>
                                    <span className="text-xs">Estadía obligatoria (26-29 marzo)</span>
                                </div>
                            </div>

                            <div className="text-center md:text-right">
                                <div className="inline-block bg-white text-black text-xs font-black tracking-widest py-2 px-4 rounded-full mb-2 animate-pulse">
                                    ⚠️ Solo 4 domos disponibles
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <TrackedLink
                                href="/disponibilidad?entrada=2026-03-26&salida=2026-03-29&adultos=4&event=mundial"
                                eventName="click_reservar_mundial"
                                className="w-full md:w-auto inline-flex bg-primary hover:bg-primary-dark text-white font-black py-5 px-10 rounded-full transition-all shadow-2xl items-center justify-center gap-3 tracking-widest uppercase text-sm"
                            >
                                Asegurar mi cupo ahora
                                <ArrowRight size={20} />
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
