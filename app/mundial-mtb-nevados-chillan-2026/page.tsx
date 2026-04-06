import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Mountain, Waves, Coffee, Info, Check } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Alojamiento Mundial MTB 2026 | Glamping Domos TreePod Chillán',
    description: 'Domos geodésicos para 4 personas con tinaja caliente en Valle Las Trancas. A minutos de Nevados de Chillán para el Mundial MTB 2026.',
    alternates: {
        canonical: '/mundial-mtb-nevados-chillan-2026',
    },
    openGraph: {
        title: 'Alojamiento Mundial MTB 2026 | Domos TreePod',
        description: 'Domos para 4 personas con tinaja caliente en Valle Las Trancas. A minutos de Nevados de Chillán.',
        images: ['/images/Ciclista en sendero de bosque.png'],
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
            <section className="relative h-[85vh] min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/Ciclista en sendero de bosque.png"
                        alt="Ciclista en sendero de bosque - Mundial MTB 2026"
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
                            Mundial UCI MTB 2026 · Nevados de Chillán
                        </span>
                    </div>

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
                        Tu única preocupación será <span className="text-primary italic">pedalear</span>. <br className="hidden md:block" />
                        Nosotros nos encargamos de tu recuperación.
                    </h1>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 max-w-4xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        El cuartel general exclusivo para tu equipo en el Mundial UCI MTB 2026. <br className="hidden md:block" />
                        Domos a pasos de la competencia con tu propia tinaja hirviendo esperando por ti.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?entrada=2026-03-26&salida=2026-03-29&adultos=4&event=mundial"
                            eventName="click_reservar_mundial"
                            secondEventName="begin_checkout_mundial"
                            secondParams={{ event: "mundial_mtb_2026" }}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-6 px-12 rounded-full transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-1 tracking-widest uppercase"
                        >
                            <span className="text-xl md:text-2xl">BLOQUEA TU DOMO AHORA</span>
                            <span className="text-sm font-normal opacity-90">(26–29 Marzo)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-bold uppercase tracking-tighter text-sm">¿Dudas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_mundial"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center gap-2"
                            >
                                Consultar por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 1 – BENEFICIOS DIRECTOS */}
            <section className="py-24 md:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">Diseñado para que tu equipo <span className="italic-display text-primary">rinda al máximo</span></h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto mb-8"></div>
                        <p className="text-text-sub text-xl font-bold leading-relaxed">
                            Olvídate del estrés de la montaña. Aquí tienes todo lo que necesitas para enfocarte en la carrera:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            { 
                                icon: Mountain, 
                                title: "Si duermes mal, corres mal", 
                                desc: "Capacidad para 4 personas con camas de primer nivel preparadas para un descanso absoluto y profundo." 
                            },
                            { 
                                icon: Check, 
                                title: "Tus bicicletas bajo llave y a la vista", 
                                desc: "Guarda tu equipo dentro o justo al lado del domo con total seguridad. Cero preocupaciones." 
                            },
                            { 
                                icon: Mountain, 
                                title: "Estacionamiento en tu puerta", 
                                desc: "A un paso de tu cama para facilitar tu logística diaria y no perder ni un minuto cargando equipo." 
                            },
                            { 
                                icon: Coffee, 
                                title: "Tus comidas, a tu manera", 
                                desc: "Cocina 100% equipada. Prepara tus suplementos, pastas y dietas exactamente como las necesitas y con total libertad." 
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

            {/* SECCIÓN 2 – RECUPERACIÓN DEPORTIVA (TINAJA) */}
            <section className="py-24 md:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
                            <Image
                                src="/images/wellness/Tinaja1.jpg"
                                alt="Tinaja caliente de recuperación"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-12 left-12 text-white">
                                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-[0.3em] mb-4">
                                    <Waves size={20} /> Recuperación Activa
                                </div>
                                <h3 className="font-display font-black text-3xl drop-shadow-md">Tu Ventaja después del Descenso</h3>
                            </div>
                        </div>

                        <div>
                            <div className="inline-block mb-6">
                                <span className="text-primary text-xs font-black tracking-[0.4em] uppercase">
                                    La ventaja injusta para tus músculos
                                </span>
                            </div>
                            <h2 className="h2-display text-text-main mb-8 leading-tight">Tu propia <span className="italic-display text-primary">Tinaja Caliente</span></h2>
                            <p className="text-xl text-text-sub leading-relaxed font-bold mb-10">
                                El contraste ideal después de horas en el cerro. El agua a la temperatura perfecta acelera tu recuperación muscular, mejora tu circulación y reduce el riesgo de lesiones para el siguiente día de competencia.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Lista y a la temperatura ideal justo cuando regreses de la montaña.",
                                    "Uso 100% exclusivo para tu domo (Reserva tu hora exclusiva sin compartir con otros).",
                                    "Tranquilidad absoluta inmerso en el bosque nativo para resetear tu mente."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-5 text-text-main font-bold text-lg">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                                            <Check size={20} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3 – URGENCIA Y CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-primary">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-2xl text-center">
                        
                        <div className="inline-flex items-center gap-3 bg-primary/20 text-primary border border-primary/30 px-5 py-1.5 rounded-full mb-8">
                            <Info size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Atención: Cupos Críticos</span>
                        </div>

                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            Solo nos quedan <span className="text-primary">4 domos</span> para todo el Mundial
                        </h2>

                        <p className="text-lg md:text-xl text-white/80 font-bold mb-6 leading-relaxed max-w-2xl mx-auto">
                            El alojamiento en el valle va a colapsar. Esta es una <span className="text-white">Edición Limitada</span> con máxima exclusividad y espacio para equipos durante el Mundial MTB 2026.
                        </p>

                        <p className="text-primary text-xl font-black mb-10 italic">
                            No dejes a tu equipo durmiendo incómodo
                        </p>

                        <TrackedLink
                            href="/disponibilidad?entrada=2026-03-26&salida=2026-03-29&adultos=4&event=mundial"
                            eventName="click_reservar_mundial_final"
                            secondEventName="begin_checkout_mundial"
                            secondParams={{ event: "mundial_mtb_2026" }}
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-5 px-10 rounded-full transition-all shadow-xl items-center justify-center gap-2 tracking-widest uppercase transform hover:scale-105"
                        >
                            <span className="text-lg md:text-xl">ASEGURA TU CUPO AHORA</span>
                        </TrackedLink>

                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Mínimo 3 noches</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Estadía 26-29 Marzo</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Pago Verificado</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
