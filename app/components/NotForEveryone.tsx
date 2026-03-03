import Image from "next/image";
import { MapPin } from "lucide-react";


export default function NotForEveryone() {
    return (
        <section className="py-12 md:py-20 bg-white" id="concepto">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Logic & Vision - Pluma Style */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-4">
                            <div className="inline-block">
                                <span className="text-primary text-sm font-black tracking-[0.2em] uppercase">Por qué un Domo</span>
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
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="relative group h-[400px] md:h-[650px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-black/5 bg-surface">
                            <img
                                src="/images/concept/croquis-aereo-nuevo.png"
                                alt="Nuestro glamping - Ubicación estratégica"
                                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                            />
                        </div>
                        <div className="text-center">
                            <p className="inline-block text-sm font-black tracking-[0.2em] text-text-sub uppercase">
                                Nuestro Glamping
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

