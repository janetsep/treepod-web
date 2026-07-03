import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Introduction() {
    return (
        <section className="py-20 md:py-32 relative overflow-hidden bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl w-full aspect-[4/3]">
                            <Image
                                alt="Vista frontal del domo TreePod bajo la nieve"
                                className="object-cover object-center"
                                src="/images/hero/domonieve2.jpeg"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Nuestra Esencia</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold leading-tight text-text-main">
                                Donde la naturaleza <br />
                                <span className="text-primary italic-display font-light">marca el ritmo.</span>
                            </h2>
                        </div>

                        <div className="space-y-6 text-xl md:text-2xl font-display leading-tight text-text-main">
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
