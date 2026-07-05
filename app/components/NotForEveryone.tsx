import Image from "next/image";
import Link from "next/link";


export default function NotForEveryone() {
    return (
        <section className="py-16 md:py-28 bg-white border-t border-black/[0.06]" id="concepto">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start">

                    {/* Logic & Vision - Pluma Style */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">Por qué TreePod</span>
                            </div>

                            <h2 className="h1-display text-text-main !text-left">
                                Para tu <br />
                                <span className="text-primary italic-display font-light text-nowrap">próxima escapada</span>
                            </h2>
                        </div>

                        <div className="space-y-5 md:space-y-6 text-sm sm:text-base md:text-lg leading-relaxed text-text-main">
                            <p>
                                <strong>Calor sin esfuerzo:</strong> afuera puede helar; adentro, la estufa a pellet mantiene tu domo tibio toda la noche, sin que cargues leña ni pienses en nada.
                            </p>
                            <p>
                                <strong>Espacio de verdad:</strong> un domo amplio solo para ustedes, con baño privado y cama grande. Nada de carpas apretadas ni baños compartidos.
                            </p>
                            <p>
                                <strong>Tranquilidad con cualquier clima:</strong> ¿viento o nieve en el valle? Mejor. La estructura está hecha para eso, y desde adentro se disfruta más.
                            </p>
                        </div>

                        <div className="pt-6 space-y-4">
                            <Link 
                                href="/disponibilidad"
                                className="inline-flex items-center justify-center px-12 py-5 bg-primary text-white font-black text-sm md:text-base uppercase tracking-[0.2em] rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 shadow-xl"
                            >
                                Reservar mi escapada
                            </Link>
                            <p className="text-[10px] md:text-xs text-text-sub font-bold pl-2">
                                Reservas con el 50%. El saldo lo pagas en el check-in.
                            </p>
                        </div>
                    </div>

                    {/* Illustration Section */}
                    <div className="flex flex-col gap-6 w-full max-w-lg lg:max-w-none ml-auto">
                        <div className="relative group aspect-square w-full rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-black/5 bg-surface">
                            <Image
                                src="/images/concept/croquis-aereo-nuevo.png"
                                alt="Nuestro glamping - Ubicación estratégica"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain object-center transition-transform duration-[10s] group-hover:scale-110"
                            />
                        </div>
                        <div className="text-center">
                            <p className="inline-block text-sm font-black tracking-[0.2em] text-primary uppercase">
                                MAPA DE NUESTRO GLAMPING
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

