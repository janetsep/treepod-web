"use client";

import Image from "next/image";
import Navbar from "../components/Navbar";
import { CheckCircle2, Download } from "lucide-react";

export default function GuiaPage() {
    return (
        <div className="bg-background-dark text-white transition-colors duration-300 font-sans min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 w-full flex flex-col pt-36">
                <div className="px-6 md:px-40 flex flex-1 justify-center py-10 md:py-16">
                    <div className="flex flex-col max-w-[960px] flex-1">
                        <div className="flex flex-col-reverse gap-10 py-6 md:flex-row md:items-center md:gap-16">
                            {/* Left: Text Content */}
                            <div className="flex flex-col gap-6 md:min-w-[400px] md:gap-8 flex-1 text-left">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Confirmado</span>
                                    </div>
                                    <h1 className="text-white text-4xl font-display font-black leading-[1.1] tracking-[-0.033em] md:text-5xl">
                                        ¡Gracias por tu interés!
                                    </h1>
                                    <h2 className="text-white/80 text-base font-normal leading-relaxed md:text-lg">
                                        Tu <span className="font-bold text-primary">Guía Exclusiva de Glamping</span> está lista para inspirar tu próxima aventura. Descubre consejos locales, listas de equipaje esenciales y rincones secretos para elevar tu experiencia.
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Hemos enviado una copia de respaldo a tu correo electrónico.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="flex grow sm:grow-0 min-w-[200px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:brightness-110 hover:shadow-lg hover:shadow-primary/20 transition-all shadow-md shadow-primary/10">
                                        <Download className="w-5 h-5" />
                                        <span className="truncate">Descargar Guía (PDF)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right: Visual Asset (Guide Mockup) */}
                            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                                <div className="relative group cursor-pointer w-full max-w-[400px]">
                                    {/* Decorative background blob */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white/5 shadow-2xl ring-1 ring-white/10">
                                        <Image
                                            alt="Digital tablet displaying the cover of the glamping guide"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnSR28nfqcqP2Sjw9q3NtxobJy1Bdl6HV4oGMA-F9YOQnO9ZXvR6Zbv1n-7ufzrP6J-XFweULHe3r1BFoerrAcPSSGE772T5ykgFwePpdXEBUUzxDy4utbJVVn99Q7pFEntfsn56G4phKWhZb-ypegQf54-Tn30vJ0iLChOFGiABmjB_Mt1Tg0YPZNig5RkFZlL8m4bJRV7_dBW7f18Og7TN5JUb25J2-TlbYXhqV-8DtbkvBBuuB0RhoXBB-mEIEVpO3dxUQoU70"
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                                            <p className="text-white text-sm font-medium tracking-widest uppercase opacity-90">Edición 2024</p>
                                            <p className="text-white text-2xl font-display font-bold">Guía de Experiencias</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section: Keep engaging */}
                <div className="w-full bg-white/5 border-y border-white/10">
                    <div className="px-6 md:px-40 flex justify-center py-16 md:py-20">
                        <div className="flex flex-col max-w-[960px] flex-1 text-center items-center gap-8">
                            <div className="flex flex-col gap-4 max-w-[720px]">
                                <h2 className="text-white text-3xl font-bold font-display leading-tight tracking-[-0.015em] md:text-4xl">
                                    ¿Listo para vivir la experiencia real?
                                </h2>
                                <p className="text-gray-400 text-lg font-normal leading-relaxed">
                                    Mientras lees tu guía, te invitamos a explorar nuestros domos de montaña. Encuentra el refugio perfecto para tu escapada.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 w-full">
                                <button className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                                    Ver Nuestros Alojamientos
                                </button>
                                <button className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-transparent border border-white/20 text-white text-base font-bold leading-normal hover:bg-white/5 transition-all">
                                    Seguir en Instagram
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
