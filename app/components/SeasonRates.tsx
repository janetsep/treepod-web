"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Temporada {
    id: string;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    prioridad: number;
}

interface Tarifa {
    id: string;
    temporada_id: string;
    adultos: number;
    noches_min: number;
    noches_max: number | null;
    precio_noche: number;
}

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function formatMonth(dateStr: string) {
    const [y, m] = dateStr.split('-').map(Number);
    return MONTH_NAMES[m - 1];
}

function isActive(temp: Temporada) {
    const today = new Date().toISOString().split('T')[0];
    return temp.fecha_inicio <= today && temp.fecha_fin >= today;
}

function formatPrice(n: number) {
    return "$" + n.toLocaleString("es-CL");
}

export default function SeasonRates() {
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/tarifas")
            .then(r => r.json())
            .then(data => {
                if (data.temporadas) setTemporadas(data.temporadas);
                if (data.tarifas) setTarifas(data.tarifas);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-12 md:py-24 bg-gray-50 border-t border-black/[0.06]">
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <div className="animate-pulse text-gray-300 font-black">Cargando tarifas...</div>
                </div>
            </section>
        );
    }

    // Separar temporada activa de las demás
    const activeTemp = temporadas.find(isActive);
    const otherTemps = temporadas.filter(t => t.id !== activeTemp?.id).slice(0, 3);

    // Obtener tarifa base (2 adultos, 1 noche mínima) de la temporada activa
    const getBasePrice = (tempId: string) => {
        const tempTarifas = tarifas.filter(t => t.temporada_id === tempId);
        // Buscar tarifa para 2 adultos con noches_min más baja
        const base = tempTarifas
            .filter(t => t.adultos === 2)
            .sort((a, b) => a.noches_min - b.noches_min)[0];
        return base?.precio_noche || 0;
    };

    return (
        <section className="py-12 md:py-24 bg-gray-50 border-t border-black/[0.06]">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Transparencia Total</span>
                    </div>
                    <h2 className="h2-display text-text-main">Tarifas por Temporada</h2>
                    <p className="text-text-sub font-bold text-lg md:text-xl">Precios base por noche para 2 personas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Temporada Activa */}
                    {activeTemp && (
                        <div className="group bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-black/5 hover:border-primary/20 transition-all duration-500 hover:-translate-y-2">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="h3-display text-text-main group-hover:text-primary transition-colors">{activeTemp.nombre}</h3>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {formatMonth(activeTemp.fecha_inicio)} — {formatMonth(activeTemp.fecha_fin)}
                                    </p>
                                </div>
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Vigente</span>
                            </div>

                            <div className="space-y-6">
                                {/* Mostrar todas las tarifas de la temporada activa */}
                                {tarifas
                                    .filter(t => t.temporada_id === activeTemp.id)
                                    .map((tarifa) => (
                                        <div key={tarifa.id} className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-text-main uppercase tracking-tight">
                                                        {tarifa.adultos} Personas
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {tarifa.noches_min > 1 ? `Desde ${tarifa.noches_min} noches` : "Por noche"}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-3xl font-black text-primary">{formatPrice(tarifa.precio_noche)}</span>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">/ noche</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-black/[0.03]">
                                <p className="text-[10px] md:text-xs text-text-sub font-bold italic text-center leading-relaxed">
                                    * Estadía mínima requerida según temporada. <br />
                                    Carga de precios dinámica según demanda y eventos locales.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Próximas Temporadas */}
                    <div className="group bg-surface rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-black/5 opacity-80 hover:opacity-100 transition-all duration-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="h3-display text-text-main">Próximas Temporadas</h3>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Previsión de precios</p>
                                </div>
                                <span className="bg-gray-200 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Proyección</span>
                            </div>

                            <div className="space-y-6">
                                {otherTemps.map((temp) => (
                                    <div key={temp.id} className="flex justify-between items-center pb-4 border-b border-black/[0.03] last:border-b-0">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-text-main uppercase tracking-tight">{temp.nombre}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                {formatMonth(temp.fecha_inicio)} — {formatMonth(temp.fecha_fin)}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-gray-400">{formatPrice(getBasePrice(temp.id))}</span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">/ noche</p>
                                        </div>
                                    </div>
                                ))}
                                {otherTemps.length === 0 && (
                                    <p className="text-sm text-gray-400 font-bold italic text-center py-8">No hay temporadas futuras configuradas</p>
                                )}
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
