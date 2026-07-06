import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";




export default function TreePodDomes() {
    const highlights = [
        {
            icon: "check_circle",
            title: "Independencia Total",
            benefit: "Siéntete en un refugio autónomo en medio del bosque nativo.",
            proof: "Baño completo privado integrado dentro del domo."
        },
        {
            icon: "check_circle",
            title: "A minutos de la nieve",
            benefit: "Despiertas en el bosque y en pocos minutos estás en las termas o las pistas de Nevados de Chillán.",
            proof: "A pasos del centro de ski y las Termas de Chillán."
        },
        {
            icon: "check_circle",
            title: "Descanso Real",
            benefit: "Despierta con energía tras un sueño profundo rodeado de naturaleza.",
            proof: "Cama matrimonial con sábanas de alta densidad."
        }
    ];



    return (
        <section className="py-16 md:py-28 relative overflow-hidden bg-white border-t border-black/[0.06]" id="domos">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/2 transform translate-x-1/2 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

                    {/* Visual Section: Montage (Centered and Balanced) */}
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Main Top Image: Refugio/Vista */}
                            <div className="col-span-2 relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-xl aspect-[16/9] group">
                                <Image
                                    alt="Tu santuario privado en el bosque"
                                    className="object-cover object-center transition-transform duration-[5s] group-hover:scale-110"
                                    src="/images/Santuario1.jpeg"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                            </div>

                            {/* Bottom Left: Bed Detail (Descanso) */}
                            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg aspect-square group">
                                <Image
                                    alt="Camas confortables para un descanso real"
                                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    src="/images/Santuario2.jpg"
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                />
                            </div>

                            {/* Bottom Right: Stove Detail (Calor) */}
                            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg aspect-square group">
                                <Image
                                    alt="Estufa a pellet para calor garantizado"
                                    className="object-cover object-[50%_55%] scale-150 transition-transform duration-700 group-hover:scale-[1.6]"
                                    src="/images/Santuario3.jpg"
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text Section (Balanced & Equalized) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2">
                                <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">Tu refugio</span>
                            </div>
                            <h2 className="h2-display leading-tight text-text-main">
                                Habita la calma <br />
                                <span className="text-primary italic-display">en tu propio refugio</span>
                            </h2>
                        </div>

                        <div className="space-y-6 text-text-main/80 text-base md:text-lg leading-relaxed">
                            <p>
                                <strong>Solo tú y el bosque:</strong> un domo geodésico privado, sin vecinos pegados ni ruido. Desde adentro ves el bosque nativo por los grandes ventanales.
                            </p>
                            <p>
                                <strong>Noches de estrellas:</strong> lejos de las luces de la ciudad, el cielo se llena de estrellas y lo único que escuchas es la calma del valle.
                            </p>
                        </div>

                        <div className="pt-6 space-y-4">
                            <Link 
                                href="/disponibilidad"
                                className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white font-semibold text-base rounded-full hover:bg-primary-dark transition-all shadow-lg"
                            >
                                Reservar mi domo
                            </Link>
                            <p className="text-[10px] md:text-xs text-text-sub font-bold pl-2">
                                Ves la disponibilidad y el precio al instante, sin compromiso.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

