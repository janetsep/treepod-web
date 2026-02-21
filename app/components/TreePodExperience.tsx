import { Wifi, Moon, Trees } from "lucide-react";

export default function TreePodExperience() {

    return (
        <section className="py-12 md:py-24 bg-white relative overflow-hidden" id="experiencia">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/2 transform translate-x-20 hidden lg:block"></div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

                    <div className="space-y-10">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full">
                            <span className="text-primary text-[11px] font-bold tracking-[0.2em] uppercase">Características</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main leading-tight">
                            Tu estadía en <br />
                            <span className="text-primary italic">el Bosque</span>
                        </h2>

                        <div className="space-y-10">
                            <div className="flex gap-6 items-start">
                                <div className="w-16 h-16 flex-shrink-0 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-md text-primary group hover:bg-primary hover:text-white transition-all duration-300">
                                    <Wifi size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-text-main mb-2 tracking-tight">Internet Satelital</h3>
                                    <p className="text-text-sub leading-relaxed md:text-lg font-medium">Contamos con internet Starlink para cuando lo necesites, aunque el entorno invita a descansar.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-16 h-16 flex-shrink-0 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-md text-primary group hover:bg-primary hover:text-white transition-all duration-300">
                                    <Moon size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-text-main mb-2 tracking-tight">Temperatura Ideal</h3>
                                    <p className="text-text-sub leading-relaxed md:text-lg font-medium">El clima de montaña es intenso, por eso cada domo tiene estufa a pellet de fácil uso.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-16 h-16 flex-shrink-0 bg-white border border-black/5 rounded-2xl flex items-center justify-center shadow-md text-primary group hover:bg-primary hover:text-white transition-all duration-300">
                                    <Trees size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-text-main mb-2 tracking-tight">Entorno Natural</h3>
                                    <p className="text-text-sub leading-relaxed md:text-lg font-medium">Estamos inmersos en el valle. Escucharás el viento en los árboles y las aves locales.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group hidden md:block">
                        <div className="absolute -inset-6 bg-primary/5 rounded-[2rem] transform rotate-3 group-hover:rotate-1 transition-transform duration-700"></div>
                        <div className="absolute -inset-6 border border-primary/20 rounded-[2rem] transform -rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] border border-black/10">
                            <img
                                src="/images/hero/interior-domo-acogedor-105-2.jpg"
                                alt="Vista tranquila desde un domo TreePod"
                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
