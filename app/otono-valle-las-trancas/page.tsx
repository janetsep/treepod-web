import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Leaf, Waves, TreePine, Thermometer, Camera, Check, Sun } from 'lucide-react';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';

export const metadata: Metadata = {
    title: 'Otoño en Valle Las Trancas | Glamping TreePod - Colores del Bosque',
    description: 'Vive el otoño en Valle Las Trancas. Bosque nativo con colores rojos y dorados, estufa a pellet y temporada baja sin multitudes. Abril a junio en Domos TreePod.',
    keywords: [
        'otoño valle las trancas',
        'otoño las trancas',
        'las trancas otoño',
        'glamping otoño chile',
        'domos las trancas otoño',
        'colores otoño bosque nativo',
        'que hacer en las trancas otoño',
        'valle las trancas abril mayo',
        'escapada otoño chile',
        'glamping otoño cordillera',
    ],
    alternates: {
        canonical: '/otono-valle-las-trancas',
    },
    openGraph: {
        title: 'Otoño en Valle Las Trancas | Domos TreePod',
        description: 'Bosque nativo en colores rojos y dorados, aire puro y la calma de la temporada baja en Valle Las Trancas.',
        images: ['/images/real/VegetacionOtono.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa una escapada de otoño a los domos. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export default function OtonoValleLasTrancasPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <TrackView eventName="view_otono_las_trancas" />

            {/* HERO */}
            <section className="relative h-[85vh] min-h-[550px] md:min-h-[700px] text-white overflow-hidden flex items-center justify-center pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src="/images/real/VegetacionOtono.jpg"
                        alt="Bosque nativo de Valle Las Trancas en otoño con colores dorados y naranjas"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                    <div className="inline-block mb-8 bg-amber-700/30 backdrop-blur-md border border-amber-500/30 px-6 py-2 rounded-full animate-fade-in-up">
                        <span className="text-white text-xs font-black tracking-[0.2em] uppercase">
                            <Leaf className="inline w-3 h-3 mr-1" /> Otoño · Abril a junio
                        </span>
                    </div>

                    <h1 className="h1-display mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] max-w-5xl animate-fade-in-up delay-100 !text-white leading-tight">
                        Otoño en Las Trancas: <br className="hidden md:block" />
                        el bosque se tiñe de rojos y dorados <span className="text-amber-400 italic-display block md:inline">y el valle está en calma</span>
                    </h1>

                    <div className="mb-8 animate-fade-in-up delay-150">
                        <div className="inline-block bg-amber-700/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl">
                            <span className="text-white text-2xl md:text-3xl font-black tracking-wide">
                                Precios de temporada baja
                            </span>
                            <span className="block text-white/80 text-sm font-bold mt-1">
                                Menos gente y el bosque en su mejor momento. Revisa la tarifa de tu fecha en el calendario.
                            </span>
                        </div>
                    </div>

                    <p className="text-lg md:text-2xl text-white/95 font-bold mb-12 max-w-4xl leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] animate-fade-in-up delay-200">
                        El otoño tiñe el Valle Las Trancas de rojos y dorados. Los robles cambian de color, los senderos quedan tranquilos y el bosque nativo se disfruta con el frío justo. Sin filas, sin ruido, sin apuro.
                    </p>

                    <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl mx-auto animate-fade-in-up delay-300">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=otono-las-trancas"
                            eventName="click_reservar_otono"
                            secondEventName="begin_checkout_otono"
                            secondParams={{ event: "otono_las_trancas_2026" }}
                            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-black py-5 px-8 md:py-6 md:px-12 rounded-full transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-1 tracking-widest uppercase"
                        >
                            <span className="text-xl md:text-2xl">Reserva tu escapada de otoño</span>
                            <span className="text-sm font-normal opacity-90">(abril a junio)</span>
                        </TrackedLink>

                        <div className="flex items-center gap-4">
                            <span className="text-white/80 font-bold uppercase tracking-tighter text-sm">¿Preguntas?</span>
                            <TrackedLink
                                href={whatsappUrl}
                                eventName="click_whatsapp_otono"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-full transition-all tracking-widest uppercase text-xs flex items-center justify-center gap-2"
                            >
                                Consultar por WhatsApp
                            </TrackedLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* POR QUÉ OTOÑO */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <h2 className="h2-display text-text-main mb-6">¿Por qué venir en otoño a <span className="italic-display text-primary">Las Trancas</span>?</h2>
                        <div className="h-1.5 w-24 bg-amber-500 mx-auto mb-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Leaf,
                                title: "El bosque nativo cambia de color",
                                desc: "Robles, coigües y ñirres se tiñen de naranja, dorado y rojo. El paisaje cambia cada semana entre abril y junio."
                            },
                            {
                                icon: Sun,
                                title: "Menos gente, más privacidad",
                                desc: "Otoño es temporada baja. Los senderos están tranquilos y hay más domos disponibles. Sin las aglomeraciones de invierno o verano."
                            },
                            {
                                icon: Thermometer,
                                title: "Días frescos, noches frías",
                                desc: "El otoño en la cordillera trae mañanas con neblina y noches frías. El clima ideal para caminar de día y quedarte en el domo al anochecer."
                            },
                            {
                                icon: Thermometer,
                                title: "Tu domo cálido mientras afuera refresca",
                                desc: "La estufa a pellet mantiene el domo cálido toda la noche, mientras afuera la temperatura baja. Llegas del frío a un domo tibio."
                            },
                            {
                                icon: Camera,
                                title: "Fotografía de otoño en bosque nativo",
                                desc: "Luz dorada entre las hojas, neblina matutina en el valle, hongos en los troncos. Si te gusta la fotografía, el otoño en Las Trancas tiene mucho que mostrar."
                            },
                            {
                                icon: TreePine,
                                title: "Trekking sin calor y sin nieve",
                                desc: "Los senderos están secos pero sin calor. Trekking a la Laguna del Huemul, cascadas y rutas por el bosque con buena temperatura para caminar."
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-black/5 flex flex-col md:flex-row gap-8 items-start group hover:shadow-2xl transition-all duration-300">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:scale-110 transition-transform">
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

            {/* GALERÍA OTOÑO */}
            <section className="py-16 md:py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Otoño real en los domos TreePod</h2>
                        <div className="h-1.5 w-24 bg-amber-500 mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">
                            Fotos reales de nuestros domos en temporada de otoño. Sin filtros, sin IA.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/real/VegetacionOtono.jpg"
                                alt="Vegetación otoñal en Valle Las Trancas con colores dorados"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Bosque en otoño</p>
                                <p className="text-xs opacity-80">Colores dorados y naranjas</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/wellness/Tinaja1.jpg"
                                alt="Tinaja de ciprés rodeada de bosque nativo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Tinaja en el bosque</p>
                                <p className="text-xs opacity-80">Servicio de temporada (vuelve en primavera)</p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg"
                                alt="Interior cálido del domo con estufa a pellet encendida"
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

                        <div className="relative aspect-[4/5] rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl group">
                            <Image
                                src="/images/Galeria/lastrancas-exterior-domo-14-2.jpg"
                                alt="Domo TreePod rodeado de bosque nativo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-black text-sm">Tu domo en el bosque</p>
                                <p className="text-xs opacity-80">Privacidad entre el bosque nativo</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=otono-las-trancas"
                            eventName="click_reservar_otono"
                            className="inline-flex bg-amber-600 hover:bg-amber-700 text-white font-black py-4 px-8 rounded-full transition-all shadow-lg items-center justify-center gap-2 tracking-wide uppercase text-lg"
                        >
                            Ver disponibilidad de otoño
                            <ArrowRight size={20} />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* RESEÑAS */}
            <section className="py-16 md:py-24 lg:py-32 bg-background-light">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="h2-display text-text-main mb-6">Lo que dicen nuestros huéspedes</h2>
                        <div className="h-1.5 w-24 bg-amber-500 mx-auto mb-8"></div>
                        <p className="text-lg text-text-sub font-bold">4.9 estrellas en Google con 59 reseñas verificadas</p>
                    </div>

                    <div className="w-full relative min-h-[250px] md:min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-[2rem]">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center gap-3 opacity-50">
                                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-text-sub">Cargando reseñas...</span>
                            </div>
                        </div>
                    </div>
                    <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" defer />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 md:py-24 bg-background-dark text-white relative border-t-8 border-amber-500">
                <div className="container mx-auto px-6 md:px-10 relative z-10">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 border border-white/20 shadow-2xl text-center">
                        <h2 className="text-2xl md:text-4xl font-display font-black text-white mb-6 leading-tight">
                            El otoño dura poco. Tu domo te espera.
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
                            Los colores del bosque cambian cada semana entre abril y junio. Reserva directo y aprovecha los precios de temporada baja.
                        </p>
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=otono-las-trancas"
                            eventName="click_reservar_otono_final"
                            secondEventName="begin_checkout_otono"
                            secondParams={{ event: "otono_las_trancas_2026" }}
                            className="inline-flex bg-amber-600 hover:bg-amber-700 text-white font-black py-5 px-10 rounded-full transition-all shadow-xl items-center justify-center gap-2 tracking-widest uppercase transform hover:scale-105"
                        >
                            <span className="text-lg md:text-xl">RESERVA TU OTOÑO EN EL BOSQUE</span>
                        </TrackedLink>
                        <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-[10px] font-black tracking-widest uppercase">
                            <span className="flex items-center gap-2"><Check size={12} /> Mejor Precio Directo</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Temporada Baja</span>
                            <span className="flex items-center gap-2"><Check size={12} /> Cero Multitudes</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
