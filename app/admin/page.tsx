"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DomoCalendar from "./components/DomoCalendar";
import ReservaModal from "./components/ReservaModal";
import { Plus, BarChart3, ChevronDown, Calendar, RefreshCw, Pencil, CheckCircle2, XCircle } from "lucide-react";

export default function AdminDashboard() {
    const [reservas, setReservas] = useState<any[]>([]);
    const [domos, setDomos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedFinancial, setExpandedFinancial] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReserva, setEditingReserva] = useState<any | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        await Promise.all([fetchReservas(), fetchDomos()]);
        setLoading(false);
    }

    async function fetchDomos() {
        const { data } = await supabase.from("domos").select("*").order("nombre");
        if (data) setDomos(data);
    }

    async function fetchReservas() {
        try {
            const res = await fetch("/api/admin/reservas");
            const data = await res.json();

            if (!res.ok) {
                console.error("Error fetching reservas:", data.error);
                // Fallback empty or alert? Console is enough.
            } else {
                setReservas(data || []);
            }
        } catch (e) {
            console.error("Network error fetching reservas:", e);
        }
    }

    async function cancelReserva(id: string) {
        if (!confirm("¿Dar de baja esta reserva? Se liberarán las fechas.")) return;

        setActionLoading(id);
        try {
            const res = await fetch("/api/admin/reservas/cancelar", {
                method: "POST",
                body: JSON.stringify({ reservaId: id })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Reserva cancelada correctamente");
                fetchReservas(); // Refresh
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setActionLoading(null);
        }
    }

    async function confirmReserva(id: string) {
        if (!confirm("¿Confirmar pago manual de esta reserva? Pasará a estado VERDE.")) return;

        setActionLoading(id);
        try {
            const res = await fetch("/api/admin/reservas/confirmar", {
                method: "POST",
                body: JSON.stringify({ reservaId: id })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Reserva confirmada exitosamente");
                fetchReservas();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setActionLoading(null);
        }
    }

    const openNewReserva = () => {
        setEditingReserva(null);
        setIsModalOpen(true);
    };

    const openEditReserva = (reserva: any) => {
        setEditingReserva(reserva);
        setIsModalOpen(true);
    };

    // Helper: Validar reserva real (Excluir carritos abandonados sin datos)
    const isValidReserva = (r: any) => {
        // Si está cancelada, fuera.
        if (r.estado === 'cancelada') return false;

        // Si está en proceso de pago (pendiente_pago) PERO no tiene email, es un carrito abandonado pre-checkout.
        // El usuario pidió "definitivamente no son reservas".
        if (r.estado === 'pendiente_pago' && !r.email) return false;

        return true;
    };

    const validReservas = reservas.filter(isValidReserva);

    // Helper: Resumen Mensual
    const getMonthlyStats = () => {
        const stats: Record<string, { count: number; total: number; confirmed: number }> = {};

        validReservas.forEach(r => {
            const date = new Date(r.fecha_inicio);
            if (isNaN(date.getTime())) return;

            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

            if (!stats[monthKey]) stats[monthKey] = { count: 0, total: 0, confirmed: 0 };

            stats[monthKey].count += 1;
            if (r.estado === 'pagado') {
                stats[monthKey].total += (r.total || 0);
                stats[monthKey].confirmed += 1;
            }
        });

        return Object.entries(stats)
            .sort((a, b) => b[0].localeCompare(a[0])) // Descending date
            .map(([key, data]) => {
                const [year, month] = key.split('-');
                const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-CL', { month: 'long', year: 'numeric' });
                return { label: monthName, ...data };
            });
    };

    const monthlyStats = getMonthlyStats();

    // Filtered lists
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingReservations = validReservas.filter(r => r.fecha_inicio >= todayStr);
    const pastReservations = validReservas.filter(r => r.fecha_inicio < todayStr);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pagado": return "bg-green-100 text-green-800";
            case "pendiente": return "bg-yellow-100 text-yellow-800";
            case "pendiente_pago": return "bg-yellow-100 text-yellow-800";
            case "cancelada": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Panel de Control: TreePod</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Admin Logueado · <span className="text-green-500">Online</span>
                        </span>
                        <button
                            onClick={openNewReserva}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva Reserva
                        </button>
                    </div>
                </div>

                {/* KPI Cards: RESUMEN GENERAL */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Próximas Llegadas</p>
                        <p className="text-xs text-gray-400 mb-2">Reservas desde HOY</p>
                        <p className="text-3xl font-bold text-primary">
                            {upcomingReservations.length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ingresos Confirmados</p>
                        <p className="text-xs text-gray-400 mb-2">Total Histórico (Pagado)</p>
                        <p className="text-3xl font-bold text-green-600">
                            ${validReservas.filter(r => r.estado === 'pagado').reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pendientes Pago</p>
                        <p className="text-xs text-gray-400 mb-2">Requiere seguimiento</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            {validReservas.filter(r => r.estado === 'pendiente_pago' || r.estado === 'pendiente').length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-70">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Historial Pasado</p>
                        <p className="text-xs text-gray-400 mb-2">Estadías finalizadas</p>
                        <p className="text-3xl font-bold text-gray-600">
                            {pastReservations.length}
                        </p>
                    </div>
                </div>

                {/* MONTHLY SUMMARY ROW - COLLAPSIBLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => setExpandedFinancial(!expandedFinancial)}
                        className="w-full p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gold" />
                            Resumen Financiero por Mes
                        </h2>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedFinancial ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedFinancial && (
                        <div className="overflow-x-auto p-2 animate-fade-in-down">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                    <tr>
                                        <th className="px-6 py-3 rounded-l-lg">Mes</th>
                                        <th className="px-6 py-3">Reservas Totales</th>
                                        <th className="px-6 py-3">Confirmadas</th>
                                        <th className="px-6 py-3 rounded-r-lg text-right">Ingresos (Pagado)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {monthlyStats.map((stat, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-bold capitalize text-primary">{stat.label}</td>
                                            <td className="px-6 py-4 text-sm">{stat.count}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold text-xs">
                                                    {stat.confirmed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 text-right">
                                                ${stat.total.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {monthlyStats.length === 0 && (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 text-sm">Aún no hay datos suficientes.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Calendar View */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Disponibilidad Visual
                        </h2>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center text-gray-400">Cargando calendario...</div>
                        ) : (
                            <DomoCalendar reservas={reservas} domos={domos} />
                        )}
                    </div>
                </div>

                {/* List View */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Gestión de Reservas</h2>
                        <button onClick={loadData} className="text-primary hover:underline text-sm font-bold flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" /> Actualizar
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Huésped</th>
                                    <th className="px-6 py-4">Fechas</th>
                                    <th className="px-6 py-4">Domo</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Cargando datos...</td></tr>
                                ) : reservas.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No hay reservas registradas.</td></tr>
                                ) : validReservas.map((reserva) => {
                                    const clientName = reserva.clientes?.nombre
                                        ? `${reserva.clientes.nombre} ${reserva.clientes.apellido || ""}`
                                        : `${reserva.nombre || "Sin nombre"} ${reserva.apellido || ""}`;

                                    const clientEmail = reserva.clientes?.email || reserva.email || "Email pendiente";
                                    const isVip = reserva.clientes?.vip_tier && reserva.clientes.vip_tier !== 'Standard';

                                    return (
                                        <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-bold text-gray-900">{clientName}</div>
                                                    {isVip && (
                                                        <span className="bg-gold text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-sm">VIP</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{clientEmail}</div>
                                                <div className="text-[10px] text-gray-400 uppercase mt-1 flex gap-1 items-center">
                                                    COD: <span className="font-bold text-primary">{reserva.id.slice(-5).toUpperCase()}</span>
                                                    <span className="mx-1 text-gray-200">|</span>
                                                    ID: ...{reserva.id.slice(-6)}
                                                    <button
                                                        onClick={() => openEditReserva(reserva)}
                                                        className="ml-2 text-primary hover:underline flex items-center gap-0.5"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        Editar
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700 font-medium">
                                                    {reserva.fecha_inicio} <span className="text-gray-300 mx-1">→</span> {reserva.fecha_fin}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {/* Calculate nights if needed */}
                                                    Creada: {new Date(reserva.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 whitespace-nowrap">
                                                    {reserva.domos?.nombre || "Sin asignar"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                ${(reserva.total || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(reserva.estado)}`}>
                                                    {reserva.estado}
                                                </span>
                                                {reserva.fuente && (
                                                    <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-1 text-center">
                                                        {reserva.fuente}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {reserva.estado !== 'pagado' && reserva.estado !== 'cancelada' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => confirmReserva(reserva.id)}
                                                            disabled={actionLoading === reserva.id}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                            title="Confirmar Pago Manual"
                                                        >
                                                            {actionLoading === reserva.id ? (
                                                                "..."
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    Confirmar
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => cancelReserva(reserva.id)}
                                                            disabled={actionLoading === reserva.id}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                            title="Dar de Baja"
                                                        >
                                                            {actionLoading === reserva.id ? (
                                                                "..."
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                    Baja
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ReservaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    domos={domos}
                    onSave={loadData}
                    reservaToEdit={editingReserva}
                />
            </div>
        </div>
    );
}
