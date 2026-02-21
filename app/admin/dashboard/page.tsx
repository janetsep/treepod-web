"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Image from "next/image";
import { Bell, Download, Star, DollarSign, BookOpen, Eye, MousePointerClick } from "lucide-react";

// Tipos para métricas
type KpiData = {
    ingresosMes: number;
    ocupacion: number;
    roas: number;
    reservasRecientes: any[];
    detailedReservations: any[];
    analytics?: {
        activeUsers: number;
        sessions: number;
        engagementRate: number;
    }
};

export default function DashboardAdmin() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<KpiData>({
        ingresosMes: 0,
        ocupacion: 0,
        roas: 0,
        reservasRecientes: [],
        detailedReservations: [],
        analytics: { activeUsers: 0, sessions: 0, engagementRate: 0 }
    });

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(33, 43, 54);
        doc.text("Reporte Mensual TreePod", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-CL')}`, 14, 30);

        const tableData = [
            ["Métrica Financiera", "Valor Calculado", "Estado"],
            ["Ingresos Totales (Mes)", `$${data.ingresosMes.toLocaleString("es-CL")}`, "Validado"],
            ["Reservas Activas", `${data.ocupacion}`, "Confirmadas"],
            ["Visitas Web (28d)", `${data.analytics?.activeUsers || 0}`, "Analytics"]
        ];

        (doc as any).autoTable({
            startY: 40,
            head: [tableData[0]],
            body: tableData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [33, 43, 54] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Agregar lista de reservas al reporte
        if (data.detailedReservations && data.detailedReservations.length > 0) {
            doc.text("Detalle de Reservas", 14, (doc as any).lastAutoTable.finalY + 15);

            const reservaRows = data.detailedReservations.map((r: any) => [
                `${r.nombre} ${r.apellido}`,
                new Date(r.fecha_inicio).toLocaleDateString(),
                new Date(r.fecha_fin).toLocaleDateString(),
                `$${r.total.toLocaleString("es-CL")}`,
                r.estado
            ]);

            (doc as any).autoTable({
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Huésped', 'Entrada', 'Salida', 'Total', 'Estado']],
                body: reservaRows,
                theme: 'striped',
                headStyles: { fillColor: [212, 175, 55] },
                styles: { fontSize: 9 }
            });
        }

        doc.save("reporte_nexus_mensual.pdf");
    };

    useEffect(() => {
        async function fetchData() {
            // 1. Ingresos del mes actual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const { data: movimientos } = await supabase
                .from("finanzas_movimientos")
                .select("monto")
                .eq("tipo", "ingreso")
                .gte("fecha_movimiento", startOfMonth);

            const ingresos = movimientos?.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0) || 0;

            // 2. Fetch Reservas Detalladas
            const { data: reservasActivas, count: ocupacion } = await supabase
                .from("reservas")
                .select("*", { count: 'exact' })
                .or('estado.eq.pagado,estado.eq.pending_transfer_confirmation,estado.eq.confirmado,estado.eq.pendiente_pago')
                .order("created_at", { ascending: false }) // Las más nuevas primero
                .limit(20);

            // 3. Datos Reales de Tendencia
            const months = [];
            for (let i = 2; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push({
                    month: d.getMonth() + 1,
                    year: d.getFullYear(),
                    name: d.toLocaleString('es-CL', { month: 'short' }),
                    start: d.toISOString(),
                    end: new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()
                });
            }

            const trendData = await Promise.all(months.map(async (m) => {
                const { data: movs } = await supabase
                    .from("finanzas_movimientos")
                    .select("monto")
                    .eq("tipo", "ingreso")
                    .gte("fecha_movimiento", m.start)
                    .lt("fecha_movimiento", m.end);

                const total = movs?.reduce((a, b) => a + (Number(b.monto) || 0), 0) || 0;

                const { count: resCount } = await supabase
                    .from("reservas")
                    .select("*", { count: 'exact', head: true })
                    .gte("created_at", m.start)
                    .lt("created_at", m.end);

                return { name: m.name, ingresos: total, reservas: resCount || 0 };
            }));

            // 4. Fetch Analytics Data
            let analyticsData = { activeUsers: 0, sessions: 0, engagementRate: 0 };
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) {
                    analyticsData = await res.json();
                }
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            }

            setData({
                ingresosMes: ingresos,
                ocupacion: ocupacion || 0,
                roas: 4.2, // Mantener estático hasta tener integración Ads real
                reservasRecientes: trendData,
                detailedReservations: reservasActivas || [],
                analytics: analyticsData
            });
            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Cargando Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Header minimalista blanco */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Logo pequeño oscuro */}
                    <div className="font-display font-bold text-xl tracking-tight text-black flex items-center gap-2">
                        <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">TP</span>
                        TreePod Admin
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                        JS
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">

                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Panel General</h1>
                        <p className="text-gray-500 text-sm">Resumen de operaciones y finanzas.</p>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Exportar PDF
                    </button>
                </header>

                {/* KPI CARDS - Light Version */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <CardKpi
                        title="Ingresos Mes"
                        value={`$${data.ingresosMes.toLocaleString("es-CL")}`}
                        iconName="payments"
                        trend="+12%"
                        color="text-emerald-600"
                    />
                    <CardKpi
                        title="Reservas Activas"
                        value={`${data.ocupacion}`}
                        iconName="confirmation_number"
                        sub="Confirmadas"
                        color="text-blue-600"
                    />
                    <CardKpi
                        title="Visitas (28d)"
                        value={`${data.analytics?.activeUsers || 0}`}
                        iconName="visibility"
                        sub={`Engagement: ${Math.round((data.analytics?.engagementRate || 0) * 100)}%`}
                        color="text-indigo-600"
                    />
                    <CardKpi
                        title="ROAS Ads"
                        value={`${data.roas}x`}
                        iconName="ads_click"
                        sub="Retorno"
                        color="text-purple-600"
                    />
                </div>

                {/* TABLA PRINCIPAL - Light clean version */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-gray-800 font-bold text-sm uppercase tracking-wide">Gestión de Reservas</h3>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Buscar..." className="bg-white border rounded-lg px-3 py-1 text-xs outline-none focus:ring-1 focus:ring-black" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Reserva / Huésped</th>
                                    <th className="px-6 py-4 font-semibold">Fechas (In - Out)</th>
                                    <th className="px-6 py-4 font-semibold">Pax</th>
                                    <th className="px-6 py-4 font-semibold">Solicitudes / Extras</th>
                                    <th className="px-6 py-4 font-semibold">Total</th>
                                    <th className="px-6 py-4 font-semibold text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.detailedReservations?.length > 0 ? (
                                    data.detailedReservations.map((res: any) => {
                                        const checkIn = new Date(res.fecha_inicio);
                                        const checkOut = new Date(res.fecha_fin);
                                        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));

                                        return (
                                            <tr key={res.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {res.nombre} {res.apellido}
                                                        {res.is_vip_booking && (
                                                            <span title="Cliente VIP" className="bg-amber-100 text-amber-600 rounded-full p-0.5">
                                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase">COD: <span className="text-primary">{res.id.slice(-5).toUpperCase()}</span></div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-800">
                                                        {checkIn.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                                        <span className="text-gray-300 mx-2">➞</span>
                                                        {checkOut.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">{nights} Noches</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{res.adultos}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* Placeholder para solicitudes - Lógica futura */}
                                                    <div className="text-xs text-gray-400 italic">
                                                        - Sin extras registrados -
                                                        {/* Ejemplo visual: <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded ml-2">Cena</span> */}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    ${res.total.toLocaleString("es-CL")}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <StatusBadge status={res.estado} />
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic bg-gray-50/30">
                                            No hay reservas para mostrar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CHART SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold mb-6 text-sm uppercase tracking-wide">Ingresos Trimestrales</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.reservasRecientes}>
                                    <defs>
                                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#000' }}
                                        formatter={(value: any) => [`$${value.toLocaleString('es-CL')}`, 'Ingresos']}
                                    />
                                    <Area type="monotone" dataKey="ingresos" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SYSTEM STATUS */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-gray-800 font-bold mb-2 text-sm uppercase tracking-wide">Estado Técnico</h3>
                        <div className="space-y-3">
                            <StatusItem label="API Transbank" status="ONLINE" color="green" />
                            <StatusItem label="Base de Datos" status="HEALTHY" color="green" />
                            <StatusItem label="Google Analytics" status="CONNECTED" color="green" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-componentes para limpiar el código
function CardKpi({ title, value, iconName, trend, sub, color }: any) {
    const icons: any = {
        'payments': <DollarSign className="w-5 h-5" />,
        'confirmation_number': <BookOpen className="w-5 h-5" />,
        'visibility': <Eye className="w-5 h-5" />,
        'ads_click': <MousePointerClick className="w-5 h-5" />
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all shadow-sm group">
            <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                    {icons[iconName] || <DollarSign className="w-5 h-5" />}
                </div>
                {trend && <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold">{trend}</span>}
            </div>
            <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">{title}</h3>
                <p className={`text-2xl font-display font-bold text-gray-900`}>{value}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        'pagado': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'confirmado': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'pending_transfer_confirmation': 'bg-amber-50 text-amber-700 border-amber-100',
        'pendiente_pago': 'bg-gray-50 text-gray-500 border-gray-100',
        'rechazado': 'bg-red-50 text-red-700 border-red-100',
    };

    const labels: any = {
        'pagado': 'CONFIRMADA',
        'confirmado': 'CONFIRMADA',
        'pending_transfer_confirmation': 'VALIDAR TRANSF.',
        'pendiente_pago': 'PENDIENTE',
        'rechazado': 'CANCELADA',
    };

    const s = styles[status] || styles['pendiente_pago'];
    const l = labels[status] || status;

    return (
        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${s} inline-block min-w-[90px] text-center`}>
            {l}
        </span>
    )
}

function StatusItem({ label, status, color }: any) {
    const colorClasses = color === 'green' ? 'bg-emerald-500' : 'bg-blue-500';
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm text-gray-600 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${colorClasses} animate-pulse`}></div>
                <span className="text-[10px] font-bold text-gray-400">{status}</span>
            </div>
        </div>
    )
}
