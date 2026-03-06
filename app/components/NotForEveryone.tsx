import Image from "next/image";
import { MapPin } from "lucide-react";


export default function NotForEveryone() {
    return (
        <section className="py-12 md:py-20 bg-white border-t border-black/[0.06]" id="concepto">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Logic & Vision - Pluma Style */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Por qué TreePod</span>
                            </div>

                            <h2 className="h2-display text-text-main">
                                Habitar la Naturaleza <br />
                                <span className="text-primary italic-display">con Propósito</span>
                            </h2>
                        </div>



                        <div className="space-y-10">
                            <article className="flex gap-6 group items-start">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black uppercase tracking-tight text-text-main group-hover:text-primary transition-colors">
                                        Eficiencia Térmica
                                    </h4>
                                    <p className="text-text-sub text-base font-bold leading-snug">
                                        Máximo ahorro de calor y temperatura estable bajo la nieve.
                                    </p>
                                </div>
                            </article>

                            <article className="flex gap-6 group items-start">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black uppercase tracking-tight text-text-main group-hover:text-primary transition-colors">
                                        Amplitud Real
                                    </h4>
                                    <p className="text-text-sub text-base font-bold leading-snug">
                                        Libertad total de movimiento sin columnas ni pilares.
                                    </p>
                                </div>
                            </article>

                            <article className="flex gap-6 group items-start">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black uppercase tracking-tight text-text-main group-hover:text-primary transition-colors">
                                        Resistencia Extrema
                                    </h4>
                                    <p className="text-text-sub text-base font-bold leading-snug">
                                        Estructura antisísmica diseñada para los vientos del valle.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>

                    {/* Illustration Section */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="relative group h-[400px] md:h-[650px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-black/5 bg-surface">
                            <img
                                src="/images/concept/croquis-aereo-nuevo.png"
                                alt="Nuestro glamping - Ubicación estratégica"
                                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                            />
                        </div>
                        <div className="text-center">
                            <p className="inline-block text-sm font-black tracking-[0.2em] text-primary uppercase">
                                DISTRIBUCIÓN DE NUESTRO GLAMPING
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

