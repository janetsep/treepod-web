"use client";

import { TrendingUp, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SeasonRates() {
    return (
        <section className="py-12 md:py-24 bg-gray-50 border-t border-black/[0.06]">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Transparencia Total</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-black text-text-main">Tarifas por Temporada</h2>
                    <p className="text-text-sub font-bold text-lg md:text-xl">Precios base por noche para 2 personas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Autumn Card */}
                    <div className="group bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-black/5 hover:border-primary/20 transition-all duration-500 hover:-translate-y-2">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-display font-bold text-text-main group-hover:text-primary transition-colors">Temporada Otoño</h3>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Marzo — Junio</p>
                            </div>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Vigente</span>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-text-main uppercase tracking-tight">Fin de Semana</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vie - Dom & Festivos</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-primary">$145.000</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">/ noche</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-primary/10">
                                    <p className="text-[11px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-primary" /> Ejemplo: 5 noches por $725.000
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-green-50/50 rounded-[2rem] border border-green-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-text-main uppercase tracking-tight">Lunes a Jueves</span>
                                        <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">15% OFF Especial</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-primary">$123.250</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">/ noche</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-green-100">
                                    <p className="text-[11px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-primary" /> Ejemplo: 4 noches por $493.000
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-black/[0.03]">
                            <p className="text-[10px] md:text-xs text-text-sub font-bold italic text-center leading-relaxed">
                                * Valores para 2 personas. Estadía mínima requerida según temporada. <br />
                                Carga de precios dinámica según demanda y eventos locales.
                            </p>
                        </div>
                    </div>

                    {/* Next Season Preview */}
                    <div className="group bg-surface rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-black/5 opacity-80 hover:opacity-100 transition-all duration-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-display font-bold text-text-main">Próximas Temporadas</h3>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Preventa Invierno 2026</p>
                                </div>
                                <span className="bg-gray-200 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Proyección</span>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-black/[0.03]">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-text-main uppercase tracking-tight">Temporada Peak (Ski)</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Julio — Agosto</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-gray-400">$165.000</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">/ noche</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-text-main uppercase tracking-tight">Temporada Alta (Verano)</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enero — Febrero</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-gray-400">$155.000</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">/ noche</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 text-center group">
                            <Link href="/disponibilidad" className="inline-flex items-center gap-3 bg-white border border-black/10 px-8 py-4 rounded-full text-primary font-black text-[10px] uppercase tracking-widest transition-all hover:border-primary hover:shadow-lg">
                                Consultar Disponibilidad Real
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
