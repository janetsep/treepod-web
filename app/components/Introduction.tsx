import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Introduction() {
    return (
        <section className="py-20 md:py-32 relative overflow-hidden bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <img
                            alt="Vista frontal del domo TreePod bajo la nieve"
                            className="relative rounded-[2.5rem] shadow-2xl w-full aspect-[4/3] object-cover"
                            src="/images/exteriors/domo-exterior-arrival.jpg"
                        />
                    </div>

                    <div className="w-full lg:w-1/2 space-y-8">
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-1.5 border border-primary/20 rounded-full bg-primary/5 shadow-sm">
                                <span className="text-primary text-[11px] font-bold tracking-[0.2em] uppercase">Nuestra Esencia</span>
                            </div>
                            <h2 className="h2-display leading-[1.1] text-text-main">
                                Donde la naturaleza <br />
                                <span className="text-primary italic-display">marca el ritmo.</span>
                            </h2>
                        </div>

                        <div className="space-y-6 text-text-sub text-lg md:text-xl leading-relaxed font-bold">
                            <p>
                                TreePod te invita a vivir una experiencia diferente, en el corazón del bosque milenario.
                                Nuestros domos están diseñados para ofrecerte calidez y refugio en plena armonía con el entorno nativo.
                            </p>
                            <p>
                                El aroma a tierra húmeda y el canto lejano de las aves crean la atmósfera perfecta para el descanso real.
                                Cada rincón guarda una historia que merece ser vivida con calma.
                            </p>
                        </div>

                        <div className="pt-4">
                            <Link
                                className="inline-flex items-center gap-4 bg-primary hover:bg-primary-dark text-white font-bold py-5 px-12 rounded-full transition-all shadow-xl shadow-primary/20 group hover:-translate-y-1 active:scale-95"
                                href="/domos"
                            >
                                <span className="text-xs uppercase tracking-[0.2em]">Explorar Domos</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
