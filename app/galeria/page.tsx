"use client";

import Image from "next/image";
import Link from "next/link";
import { Trees, ChevronDown, Sparkles, Waves } from "lucide-react";


export default function GaleriaPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">


            <main className="py-16 md:py-24 bg-white">
                {/* Título editorial */}
                <div className="container mx-auto px-6 md:px-10 mb-8 md:mb-12">
                    <div className="inline-block mb-8">
                        <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">
                            La Vida en el Bosque
                        </span>
                    </div>
                    <h1 className="h1-display text-text-main leading-tight mb-6">
                        La Belleza de <span className="italic-display text-primary">lo Auténtico</span>
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mb-6"></div>
                    <p className="text-text-sub text-lg md:text-xl font-bold max-w-2xl leading-relaxed">
                        Imágenes reales de lo que encontrarás aquí. Sin filtros exagerados. Solo el bosque y tu refugio.
                    </p>
                </div>
                <section className="container mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-[300px] md:auto-rows-[400px]">
                        {/* Main Featured Image */}
                        <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-black/5">
                            <Image
                                alt="Experiencia nocturna en Domo TreePod iluminado bajo el bosque"
                                src="/images/exteriors/hero-night-2.jpg"
                                layout="fill"
                                objectFit="cover"
                                className="transform group-hover:scale-110 transition-transform duration-[2s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                            <div className="absolute bottom-12 left-12 right-12">
                                <span className="inline-block text-white text-[11px] mb-6 uppercase tracking-[0.2em] font-black drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">Noches del Valle</span>
                                <h3 className="text-4xl md:text-6xl font-display font-black text-white mb-4 [text-shadow:_0_5px_20px_rgba(0,0,0,0.8)]">Bajo las Estrellas</h3>
                                <p className="text-white text-lg md:text-xl italic font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)]">La oscuridad de la cordillera es nuestro mejor espectáculo.</p>
                            </div>
                        </div>

                        {/* Other Gallery Items with refined shapes and hover */}
                        <div className="relative group overflow-hidden rounded-[2rem] shadow-xl border border-black/5">
                            <Image
                                alt="Detalle del interior acogedor con cama matrimonial y vistas naturales"
                                src="/images/interiors/interior-vista-bosque.jpg"
                                layout="fill"
                                objectFit="cover"
                                className="transform group-hover:scale-110 transition-transform duration-[1.5s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <h3 className="text-2xl font-display font-black text-white tracking-tight [text-shadow:_0_2px_15px_rgba(0,0,0,0.8)]">Intimidad en el Bosque</h3>
                            </div>
                        </div>

                        <div className="relative group overflow-hidden rounded-[2rem] shadow-xl border border-black/5">
                            <Image
                                alt="Tinaja caliente de ciprés bajo el bosque nativo"
                                src="/images/wellness/Tinaja1.jpg"
                                layout="fill"
                                objectFit="cover"
                                className="transform group-hover:scale-110 transition-transform duration-[1.5s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-70"></div>
                            <div className="absolute bottom-10 left-10 right-10">
                                <div className="flex items-center space-x-3 text-primary mb-2">
                                    <Waves className="w-5 h-5" strokeWidth={3} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Bienestar</span>
                                </div>
                                <h3 className="text-2xl font-display font-black text-white tracking-tight [text-shadow:_0_2px_15px_rgba(0,0,0,0.8)]">Ritual de Pureza</h3>
                            </div>
                        </div>

                        <div className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-2xl border border-black/5">
                            <Image
                                alt="Área de estar del domo con decoración rústica y cálida"
                                src="/images/hero/interior-domo-acogedor-21-2.jpg"
                                layout="fill"
                                objectFit="cover"
                                className="transform group-hover:scale-110 transition-transform duration-[2s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-85"></div>
                            <div className="absolute bottom-12 left-12 right-12">
                                <h3 className="text-4xl font-display font-black text-white mb-4 [text-shadow:_0_5px_20px_rgba(0,0,0,0.8)]">Detalles que Acompañan</h3>
                                <p className="text-white text-lg max-w-lg hidden md:block italic font-bold [text-shadow:_0_2px_15px_rgba(0,0,0,0.5)]">Todo lo necesario para que tu estadía sea cálida y cómoda.</p>
                            </div>
                        </div>


                    </div>

                    <div className="mt-20 text-center">
                        <button
                            onClick={() => document.getElementById('estilo-vida')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center gap-5 bg-black hover:bg-primary px-12 py-6 rounded-full text-white transition-all duration-300 font-black tracking-[0.2em] uppercase text-xs shadow-2xl hover:-translate-y-1 active:scale-95"
                        >
                            Explorar Más Momentos
                            <ChevronDown className="w-5 h-5" strokeWidth={3} />
                        </button>
                    </div>
                </section>

                <div className="container mx-auto px-6 max-w-7xl mt-32">
                    <hr className="border-t border-black/10" />
                </div>

                <section id="estilo-vida" className="container mx-auto px-6 md:px-10 mt-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                        <div className="lg:col-span-5 space-y-8">
                            <div className="inline-block mb-4">
                                <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">Ritmo de Montaña</span>
                            </div>
                            <h2 className="h2-display text-text-main leading-tight">
                                Simplicidad y <br /><span className="text-primary italic">Calma</span>
                            </h2>
                            <p className="text-xl text-text-sub leading-relaxed font-bold">
                                Ven a vivir el bosque. Desde el café en la terraza hasta la última charla bajo las estrellas. Sin guiones, solo tú y la montaña.
                            </p>
                            <div className="pt-8">
                                <Link className="group inline-flex items-center gap-6 text-sm font-black tracking-[0.3em] uppercase text-text-main transition-colors" href="/servicios">
                                    Ver Catálogo de Servicios
                                    <div className="w-16 h-1 bg-primary group-hover:w-24 transition-all duration-300"></div>
                                </Link>
                            </div>
                        </div>
                        <div className="lg:col-span-7 overflow-x-auto pb-8 hide-scrollbar">
                            <div className="flex space-x-8">
                                {[
                                    { title: "Cenas Exclusivas", img: "/images/interiors/interior-1.jpg" },
                                    { title: "Nieve & Deporte", img: "/images/exteriors/domo-exterior-arrival.jpg" }
                                ].map((item, i) => (
                                    <div key={i} className="min-w-[320px] h-[450px] relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-2xl border border-black/5">
                                        <Image
                                            alt={item.title}
                                            src={item.img}
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-[2s] group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <h4 className="text-white font-display font-bold text-2xl tracking-tight">{item.title}</h4>
                                        </div>
                                    </div>
                                ))}
                                <div className="min-w-[320px] h-[450px] bg-primary text-white rounded-[2.5rem] p-12 flex flex-col justify-center items-center text-center shadow-2xl border-4 border-white/10 ring-1 ring-white/5">
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-10 shadow-xl">
                                        <Sparkles className="text-white w-10 h-10" strokeWidth={2.5} />
                                    </div>
                                    <h4 className="font-display font-black text-3xl mb-6 leading-tight">Experiencia <br /> a tu Medida</h4>
                                    <p className="text-white text-base md:text-lg mb-10 font-bold leading-relaxed opacity-95">Nuestro equipo está disponible para personalizar cada detalle de tu estadía.</p>
                                    <Link href="/contacto" className="bg-white text-primary px-10 py-5 rounded-2xl font-black tracking-widest uppercase text-xs hover:scale-105 transition-all w-full shadow-2xl flex items-center justify-center">
                                        Contactar Equipo
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
