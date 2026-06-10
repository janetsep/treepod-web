"use client";

import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import Link from "next/link";
import { DollarSign, Wallet, BedDouble, Eye, TrendingUp, Users, ArrowLeft } from "lucide-react";

type Analytics = {
    activeUsers: number;
    sessions: number;
    engagementRate: number;
    events?: {
        purchase: number;
        begin_checkout: number;
        view_disponibilidad: number;
        select_fechas: number;
        generate_lead: number;
        click_reservar: number;
        view_home: number;
    };
    conversionRate?: string;
    trafficSources?: Array<{ channel: string; sessions: number; users: number }>;
};

type Estadisticas = {
    kpis: {
        ingresosMesActual: number;
        porCobrar: number;
        ocupacionMesActual: number;
        nochesMesActual: number;
        reservasFuturas: number;
    };
    serie12m: Array<{ name: string; ingresos: number; noches: number; ocupacion: number }>;
    canales: Array<{ canal: string; reservas: number; ingresos: number }>;
    domosConsiderados: number;
};

const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function DashboardAdmin() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<Analytics>({ activeUsers: 0, sessions: 0, engagementRate: 0 });
    const [stats, setStats] = useState<Estadisticas | null>(null);
    const [matriz, setMatriz] = useState<{ years: number[]; matriz: { mes: number; valores: number[] }[]; totalesPorAnio: number[] } | null>(null);
    const [ocupacion, setOcupacion] = useState<{ years: number[]; matriz: { mes: number; valores: (number | null)[] }[]; promedioPorAnio: (number | null)[]; domosConsiderados: number } | null>(null);

    useEffect(() => {
        async function fetchData() {
            await Promise.all([
                fetch('/api/admin/estadisticas').then(r => r.ok ? r.json() : null).then(d => d && setStats(d)).catch(e => console.error("estadisticas", e)),
                fetch('/api/analytics').then(r => r.ok ? r.json() : null).then(d => d && setAnalytics(d)).catch(e => console.error("analytics", e)),
                fetch('/api/admin/ingresos-matriz').then(r => r.ok ? r.json() : null).then(d => d && setMatriz(d)).catch(e => console.error("matriz", e)),
                fetch('/api/admin/ocupacion-matriz').then(r => r.ok ? r.json() : null).then(d => d && setOcupacion(d)).catch(e => console.error("ocupacion", e)),
            ]);
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Cargando Estadísticas...</div>;

    const fmt = (n: number) => "$" + (Math.round(n) || 0).toLocaleString("es-CL");
    const mesActualNombre = new Date().toLocaleDateString("es-CL", { month: "long" });
    const totalIngresosCanales = (stats?.canales || []).reduce((a, c) => a + c.ingresos, 0) || 1;
    const canalColors: Record<string, string> = {
        "Web (sitio propio)": "bg-sky-500",
        "Airbnb": "bg-rose-500",
        "Manual (directa)": "bg-emerald-500",
        "WhatsApp": "bg-green-500",
        "Booking": "bg-blue-600",
        "Otro": "bg-gray-400",
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="font-display font-bold text-xl tracking-tight text-black flex items-center gap-2">
                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">TP</span>
                    TreePod · Estadísticas
                </div>
                <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Admin
                </Link>
            </div>

            <div className="max-w-7xl mx-auto p-8 space-y-8">

                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Estadísticas del Negocio</h1>
                    <p className="text-gray-500 text-sm">Cifras calculadas desde las reservas reales (web, Airbnb, manuales y WhatsApp).</p>
                </header>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <CardKpi
                        title={`Ingresos · estadías de ${mesActualNombre}`}
                        value={fmt(stats?.kpis.ingresosMesActual || 0)}
                        icon={<DollarSign className="w-5 h-5" />}
                        sub="Abonos y pagos de reservas que inician este mes"
                        color="border-l-emerald-500"
                    />
                    <CardKpi
                        title="Por cobrar (próximas)"
                        value={fmt(stats?.kpis.porCobrar || 0)}
                        icon={<Wallet className="w-5 h-5" />}
                        sub={`Saldos de ${stats?.kpis.reservasFuturas || 0} reservas desde hoy`}
                        color="border-l-amber-500"
                    />
                    <CardKpi
                        title={`Ocupación de ${mesActualNombre}`}
                        value={`${stats?.kpis.ocupacionMesActual || 0}%`}
                        icon={<BedDouble className="w-5 h-5" />}
                        sub={`${stats?.kpis.nochesMesActual || 0} noches vendidas · meta 70%`}
                        color={(stats?.kpis.ocupacionMesActual || 0) >= 70 ? "border-l-emerald-500" : "border-l-red-400"}
                    />
                    <CardKpi
                        title="Visitas web (28d)"
                        value={`${analytics.activeUsers || 0}`}
                        icon={<Eye className="w-5 h-5" />}
                        sub={`Engagement: ${Math.round((analytics.engagementRate || 0) * 100)}% · ${(analytics.sessions || 0).toLocaleString('es-CL')} sesiones`}
                        color="border-l-indigo-500"
                    />
                </div>

                {/* INGRESOS 12 MESES + CANALES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wide">Ingresos últimos 12 meses</h3>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.serie12m || []}>
                                    <defs>
                                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: any, name: any) => name === 'ingresos'
                                            ? [`$${Number(value).toLocaleString('es-CL')}`, 'Ingresos']
                                            : [value, name]}
                                    />
                                    <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Canales */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wide flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Canales (últimos 12 meses)
                        </h3>
                        <div className="space-y-4">
                            {(stats?.canales || []).map((c) => {
                                const pct = Math.round((c.ingresos / totalIngresosCanales) * 100);
                                return (
                                    <div key={c.canal}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-600 font-bold">{c.canal}</span>
                                            <span className="font-bold text-gray-800">{fmt(c.ingresos)} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${canalColors[c.canal] || 'bg-gray-400'} rounded-full`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{c.reservas} reserva{c.reservas === 1 ? '' : 's'}</p>
                                    </div>
                                );
                            })}
                            {(stats?.canales || []).length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-4">Sin datos de canales</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* FUNNEL DE CONVERSIÓN + FUENTES DE TRÁFICO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wide flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" /> Funnel de Conversión Web (mes)
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Visitas Home', value: analytics.events?.view_home || 0, color: 'bg-blue-500' },
                                { label: 'Ver Disponibilidad', value: analytics.events?.view_disponibilidad || 0, color: 'bg-indigo-500' },
                                { label: 'Fechas Seleccionadas', value: analytics.events?.select_fechas || 0, color: 'bg-violet-500' },
                                { label: 'Inicio Checkout', value: analytics.events?.begin_checkout || 0, color: 'bg-orange-500' },
                                { label: 'Compras (Purchase)', value: analytics.events?.purchase || 0, color: 'bg-emerald-500' },
                            ].map((step, i, arr) => {
                                const maxVal = arr[0].value || 1;
                                const pct = Math.round((step.value / maxVal) * 100);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 font-medium">{step.label}</span>
                                            <span className="font-bold text-gray-800">{step.value.toLocaleString('es-CL')} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tasa de Conversión</span>
                            <span className="text-lg font-black text-emerald-600">{analytics.conversionRate || '0.0'}%</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wide flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" /> Fuentes de Tráfico (28d)
                        </h3>
                        <div className="space-y-3">
                            {analytics.trafficSources && analytics.trafficSources.length > 0 ? (
                                analytics.trafficSources.map((src, i) => {
                                    const totalSessions = analytics.sessions || 1;
                                    const pct = Math.round((src.sessions / totalSessions) * 100);
                                    const channelColors: Record<string, string> = {
                                        'Organic Search': 'bg-green-500',
                                        'Direct': 'bg-blue-500',
                                        'Paid Search': 'bg-yellow-500',
                                        'Organic Social': 'bg-pink-500',
                                        'Paid Social': 'bg-purple-500',
                                        'Referral': 'bg-orange-500',
                                    };
                                    const color = channelColors[src.channel] || 'bg-gray-400';
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 font-medium">{src.channel}</span>
                                                <span className="font-bold text-gray-800">{src.sessions.toLocaleString('es-CL')} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-4">Sin datos de tráfico disponibles</p>
                            )}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sesiones totales</span>
                            <span className="text-lg font-black text-gray-800">{(analytics.sessions || 0).toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </div>

                {/* MATRIZ DE INGRESOS POR MES Y AÑO */}
                {matriz && matriz.years.length > 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wide">Ingresos por mes y año (reservas)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left font-bold text-gray-500 uppercase text-xs py-3 px-3 sticky left-0 bg-white">Mes</th>
                                        {matriz.years.map((y) => (
                                            <th key={y} className="text-right font-bold text-gray-700 py-3 px-3 whitespace-nowrap">{y}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matriz.matriz.map((row) => (
                                        <tr key={row.mes} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="text-left font-bold text-gray-700 py-2.5 px-3 sticky left-0 bg-white">{MESES[row.mes]}</td>
                                            {row.valores.map((v, i) => (
                                                <td key={i} className={`text-right py-2.5 px-3 whitespace-nowrap tabular-nums ${v > 0 ? "text-gray-800" : "text-gray-300"}`}>
                                                    {v > 0 ? `$${Math.round(v).toLocaleString("es-CL")}` : "—"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-200">
                                        <td className="text-left py-3 px-3 uppercase text-xs font-black text-primary sticky left-0 bg-white">Total</td>
                                        {matriz.totalesPorAnio.map((t, i) => (
                                            <td key={i} className="text-right py-3 px-3 whitespace-nowrap tabular-nums font-black text-gray-900">${Math.round(t).toLocaleString("es-CL")}</td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* MATRIZ DE OCUPACIÓN POR MES Y AÑO (%) */}
                {ocupacion && ocupacion.years.length > 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wide">Ocupación por mes y año (%)</h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta ≥ 70% · sobre {ocupacion.domosConsiderados} domos</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left font-bold text-gray-500 uppercase text-xs py-3 px-3 sticky left-0 bg-white">Mes</th>
                                        {ocupacion.years.map((y) => (
                                            <th key={y} className="text-right font-bold text-gray-700 py-3 px-3 whitespace-nowrap">{y}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ocupacion.matriz.map((row) => (
                                        <tr key={row.mes} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="text-left font-bold text-gray-700 py-2.5 px-3 sticky left-0 bg-white">{MESES[row.mes]}</td>
                                            {row.valores.map((v, i) => (
                                                <td key={i} className="text-right py-2.5 px-3 whitespace-nowrap tabular-nums">
                                                    {v === null ? <span className="text-gray-300">—</span> : (
                                                        <span className={`px-2 py-0.5 rounded-lg font-bold ${v >= 70 ? 'bg-emerald-50 text-emerald-700' : v >= 50 ? 'bg-amber-50 text-amber-700' : 'text-gray-500'}`}>
                                                            {v}%
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-200">
                                        <td className="text-left py-3 px-3 uppercase text-xs font-black text-primary sticky left-0 bg-white">Promedio</td>
                                        {ocupacion.promedioPorAnio.map((p, i) => (
                                            <td key={i} className="text-right py-3 px-3 whitespace-nowrap tabular-nums font-black">
                                                {p === null ? '—' : <span className={p >= 70 ? 'text-emerald-600' : p >= 50 ? 'text-amber-600' : 'text-gray-600'}>{p}%</span>}
                                            </td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CardKpi({ title, value, icon, sub, color }: { title: string; value: string; icon: React.ReactNode; sub?: string; color: string }) {
    return (
        <div className={`bg-white p-6 rounded-2xl border border-gray-100 border-l-4 ${color} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{title}</h3>
                <div className="h-9 w-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-1.5">{sub}</p>}
        </div>
    );
}
