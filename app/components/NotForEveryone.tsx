import Image from "next/image";
import { MapPin } from "lucide-react";


export default function NotForEveryone() {
    return (
        <section className="py-24 md:py-32 bg-white" id="concepto">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                    {/* Logic & Vision - Pluma Style */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
                                <span className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">Por qué un Domo</span>
                            </div>

                            <h2 className="h2-display leading-[1.0] text-text-main">
                                Habitar la <br />
                                <span className="text-primary italic-display">Geometría</span>
                            </h2>
                        </div>



                        <div className="space-y-10">
                            <article className="space-y-4 group">
                                <h4 className="text-base font-black uppercase tracking-[0.2em] text-text-main flex items-center gap-4">
                                    <span className="w-10 h-1 bg-primary transition-all group-hover:w-16"></span>
                                    Eficiencia Térmica
                                </h4>
                                <p className="text-text-sub text-lg leading-relaxed font-bold">
                                    La forma geodésica reduce la superficie de contacto con el exterior en un 30% comparado con una construcción tradicional. El calor se mantiene por más tiempo con consumo mínimo.
                                </p>
                            </article>

                            <article className="space-y-4 group">
                                <h4 className="text-base font-black uppercase tracking-[0.2em] text-text-main flex items-center gap-4">
                                    <span className="w-10 h-1 bg-primary transition-all group-hover:w-16"></span>
                                    Amplitud Sin Columnas
                                </h4>
                                <p className="text-text-sub text-lg leading-relaxed font-bold">
                                    Al no requerir pilares internos, el domo ofrece un espacio diáfano de 40m². Tienes libertad de movimiento total y una sensación de amplitud superior.
                                </p>
                            </article>

                            <article className="space-y-4 group">
                                <h4 className="text-base font-black uppercase tracking-[0.2em] text-text-main flex items-center gap-4">
                                    <span className="w-10 h-1 bg-primary transition-all group-hover:w-16"></span>
                                    Resistencia Extrema
                                </h4>
                                <p className="text-text-sub text-lg leading-relaxed font-bold">
                                    Su estructura de triángulos entrelazados es la más fuerte conocida. Diseñada para soportar vientos cordilleranos y cargas de nieve pesada sin vibraciones.
                                </p>
                            </article>
                        </div>
                    </div>

                    {/* Illustration Section */}
                    <div className="lg:col-span-7">
                        <div className="relative group h-[400px] md:h-[650px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-black/5 bg-surface">
                            <img
                                src="/images/concept/croquis-aereo-nuevo.png"
                                alt="Ubicación estratégica de los domos TreePod en Las Trancas"
                                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                            />

                            {/* Removed top header to let the sketch breathe */}

                            {/* Info Tag: Simplified as per user request */}
                            <div className="absolute top-10 left-10 z-20">
                                <div className="bg-black/80 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-5 animate-fade-in-up">
                                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
                                        <MapPin className="w-7 h-7" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-white font-display text-2xl font-bold tracking-tight">Valle las Trancas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Project Identifier: Simplified as per user request */}
                            <div className="absolute bottom-12 left-0 w-full px-10 md:px-14 flex justify-between items-end pointer-events-none z-20">
                                <div className="space-y-2 animate-fade-in-up">
                                    <p className="text-white font-display text-3xl md:text-5xl font-black tracking-tight [text-shadow:_0_5px_20px_rgba(0,0,0,0.8)]">
                                        Distribución <br /> <span className="italic-display">del Glamping</span>
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Gradient for text legibility */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

