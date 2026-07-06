"use client";

import Image from "next/image";
import Link from "next/link";
import TriBullet from "../components/deco/TriBullet";
import GeoDivider from "../components/deco/GeoDivider";
import { btnPrimaryDark, linkLineDark } from "../components/deco/cta";

export default function GuiaPage() {
    return (
        // El Navbar global lo inyecta AdminAwareLayout: renderizarlo aquí de nuevo
        // duplicaba el menú (dos <nav> fijos superpuestos).
        <div className="bg-[#1E1B16] text-[#F7F3EC] font-sans min-h-screen flex flex-col">
            <main className="flex-1 w-full flex flex-col pt-36">
                <div className="px-5 md:px-10 flex flex-1 justify-center py-10 md:py-16">
                    <div className="flex flex-col max-w-[1100px] flex-1">
                        <div className="grid grid-cols-12 gap-x-4 md:gap-x-10 gap-y-10 items-center">
                            {/* Left: Text Content */}
                            <div className="col-span-12 md:col-span-7 flex flex-col gap-6 md:gap-8 text-left order-2 md:order-1">
                                <div className="flex flex-col gap-4">
                                    <p className="flex items-center gap-2 dato text-[#F7F3EC]/70">
                                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                                        Confirmado
                                    </p>
                                    <h1 className="display-lg !text-[#F7F3EC]">
                                        ¡Gracias por <span className="italic text-[#00ADEF]">tu interés</span>!
                                    </h1>
                                    <h2 className="text-[#F7F3EC]/80 text-base font-normal leading-relaxed md:text-lg">
                                        Tu <span className="font-semibold text-[#00ADEF]">Guía de Glamping en Las Trancas</span> está lista: recomendaciones locales y datos prácticos para tu visita al Valle Las Trancas.
                                    </h2>
                                    <p className="text-sm text-[#F7F3EC]/60">
                                        Te enviamos el acceso al correo que registraste. Si no lo ves, revisa la carpeta de spam o promociones. También puedes leerla aquí mismo:
                                    </p>
                                </div>
                                {/* La guía "enviada" es la guía online (/guia-huesped): este enlace evita
                                    prometer un documento que no existe como PDF. Cuando haya un PDF
                                    publicado, se puede sumar aquí el botón de descarga. */}
                                <div>
                                    <Link href="/guia-huesped" className={btnPrimaryDark}>
                                        Ver la guía online
                                    </Link>
                                </div>
                            </div>

                            {/* Right: portada de la guía como ficha editorial */}
                            <div className="col-span-12 md:col-span-5 flex justify-center md:justify-end order-1 md:order-2">
                                <figure className="w-full max-w-[400px]">
                                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] border border-white/15">
                                        <Image
                                            alt="Bosque nativo de Valle Las Trancas, portada de la guía TreePod"
                                            src="/images/Galeria/Las Trancas Bosque Nativo 2.jpeg"
                                            fill
                                            sizes="(max-width: 768px) 100vw, 400px"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B16]/70 via-transparent to-transparent flex flex-col justify-end p-6">
                                            <p className="dato text-[#F7F3EC]/90">TreePod</p>
                                            <p className="font-display font-medium text-2xl text-[#F7F3EC] mt-1">Guía de Las Trancas</p>
                                        </div>
                                    </div>
                                    <figcaption className="mt-2 flex items-center gap-2">
                                        <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                        <span className="caption-editorial !text-[#F7F3EC]/60">Bosque nativo, Valle Las Trancas</span>
                                    </figcaption>
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>

                <GeoDivider left="70%" tone="dark" />

                {/* CTA Section: Keep engaging */}
                <div className="w-full border-t border-white/10">
                    <div className="px-5 md:px-10 flex justify-center py-16 md:py-20">
                        <div className="flex flex-col max-w-[1100px] flex-1">
                            <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                                    <h2 className="display-md !text-[#F7F3EC]">
                                        ¿Listo para tu escapada a Las Trancas?
                                    </h2>
                                    <p className="text-[#F7F3EC]/70 text-lg font-normal leading-relaxed max-w-2xl">
                                        Mientras revisas tu guía, mira nuestros domos en Valle Las Trancas y encuentra el indicado para tu escapada.
                                    </p>
                                </div>
                                <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-6">
                                    <Link href="/domos" className={btnPrimaryDark}>
                                        Ver nuestros alojamientos
                                    </Link>
                                    <a
                                        href="https://instagram.com/domostreepod"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${linkLineDark} !text-sm`}
                                    >
                                        Seguir en Instagram <span aria-hidden="true">→</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
