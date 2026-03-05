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
            stats[monthKey].total += (r.monto_pagado || 0);
            if (r.estado === 'pagado' || r.estado === 'confirmado') {
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary transition-all hover:shadow-md">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Próximas Llegadas</p>
                        <p className="text-3xl font-display font-black text-primary">
                            {upcomingReservations.length}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Desde hoy en adelante</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 transition-all hover:shadow-md">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos Reales</p>
                        <p className="text-3xl font-display font-black text-green-600">
                            ${validReservas.reduce((acc, curr) => acc + (curr.monto_pagado || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Abonos y pagos totales recibidos</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-400 transition-all hover:shadow-md">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pendientes Pago</p>
                        <p className="text-3xl font-display font-black text-yellow-600">
                            {validReservas.filter(r => r.estado === 'pendiente_pago' || r.estado === 'pendiente').length}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Requieren seguimiento comercial</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all opacity-80 hover:opacity-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos Proyectados</p>
                        <p className="text-3xl font-display font-black text-gray-600">
                            ${validReservas.filter(r => r.estado !== 'cancelada').reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Total si todas se pagaran al 100%</p>
                    </div>
                </div>

                {/* MONTHLY SUMMARY ROW - COLLAPSIBLE */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => setExpandedFinancial(!expandedFinancial)}
                        className="w-full p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="text-xl font-display font-black text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            Resumen Financiero Mensual
                        </h2>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-500 ${expandedFinancial ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedFinancial && (
                        <div className="overflow-x-auto p-4 animate-fade-in">
                            <table className="w-full text-left">
                                <thead className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                    <tr>
                                        <th className="px-6 py-4">Mes</th>
                                        <th className="px-6 py-4 text-center">Reservas</th>
                                        <th className="px-6 py-4 text-center">Confirmadas</th>
                                        <th className="px-6 py-4 text-right">Ingresos Recaudados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {monthlyStats.map((stat, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 capitalize">{stat.label}</td>
                                            <td className="px-6 py-4 text-sm text-center font-medium text-gray-500">{stat.count}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-black text-[10px] uppercase tracking-wider">
                                                    {stat.confirmed} OK
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-primary text-right text-lg">
                                                ${stat.total.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {monthlyStats.length === 0 && (
                                        <tr><td colSpan={4} className="p-12 text-center text-gray-400 text-sm font-bold italic">No hay datos financieros registrados aún.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Calendar View */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-display font-black text-gray-800 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-primary" />
                            Ocupación del Refugio
                        </h2>
                    </div>
                    <div className="p-8">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center text-gray-400 animate-pulse font-bold italic">Cargando disponibilidad...</div>
                        ) : (
                            <DomoCalendar reservas={reservas} domos={domos} />
                        )}
                    </div>
                </div>

                {/* List View */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-display font-black text-gray-800">Maestro de Reservas</h2>
                        <button onClick={loadData} className="text-primary hover:text-primary-dark text-xs font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full transition-all">
                            <RefreshCw className="w-3.5 h-3.5" /> Actualizar Datos
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">Huésped / Referencia</th>
                                    <th className="px-6 py-5">Estancia</th>
                                    <th className="px-6 py-5">Domo</th>
                                    <th className="px-6 py-5">Finanzas (Pagado/Total)</th>
                                    <th className="px-6 py-5">Estado</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">Sincronizando con base de datos...</td></tr>
                                ) : validReservas.length === 0 ? (
                                    <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">No se encontraron registros activos.</td></tr>
                                ) : validReservas.map((reserva) => {
                                    const clientName = reserva.clientes?.nombre
                                        ? `${reserva.clientes.nombre} ${reserva.clientes.apellido || ""}`
                                        : `${reserva.nombre || "Sin nombre"} ${reserva.apellido || ""}`;

                                    const clientEmail = reserva.clientes?.email || reserva.email || "Email no registrado";
                                    const isVip = reserva.clientes?.vip_tier && reserva.clientes.vip_tier !== 'Standard';

                                    return (
                                        <tr key={reserva.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="font-extrabold text-gray-900 text-base">{clientName}</div>
                                                    {isVip && (
                                                        <span className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.1em] shadow-sm">VIP</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium mb-2">{clientEmail}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded">#{reserva.id.slice(-5).toUpperCase()}</span>
                                                    <button
                                                        onClick={() => openEditReserva(reserva)}
                                                        className="text-[10px] font-black text-gray-400 hover:text-primary uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                        Editar Ficha
                                                    </button>
                                                </div>
                                                {reserva.mensaje && (
                                                    <div className="mt-3 p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl text-xs text-yellow-800 font-medium max-w-xs italic">
                                                        "{reserva.mensaje}"
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-gray-800 font-bold text-sm">
                                                    {new Date(reserva.fecha_inicio).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                                    <span className="text-gray-300 mx-2">→</span>
                                                    {new Date(reserva.fecha_fin).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">
                                                    Creada el {new Date(reserva.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-4 py-1.5 bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 uppercase tracking-widest border border-gray-200 shadow-sm">
                                                    {reserva.domos?.nombre || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`font-black text-base ${reserva.monto_pagado >= reserva.total ? 'text-green-600' : 'text-gray-900'}`}>
                                                    ${(reserva.monto_pagado || 0).toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.05em] mt-1">
                                                    de ${(reserva.total || 0).toLocaleString()}
                                                </div>
                                                {reserva.monto_pagado > 0 && reserva.monto_pagado < reserva.total && (
                                                    <div className="mt-2 h-1 w-20 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${Math.min(100, (reserva.monto_pagado / reserva.total) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${getStatusColor(reserva.estado)}`}>
                                                    {reserva.estado === 'pendiente_pago' ? 'Check-out Web' : reserva.estado}
                                                </span>
                                                {reserva.fuente && (
                                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300 mt-2">
                                                        {reserva.fuente}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {reserva.estado !== 'pagado' && reserva.estado !== 'cancelada' && (
                                                    <div className="flex justify-end gap-3 translate-x-2 opacity-100 group-hover:translate-x-0 transition-all">
                                                        <button
                                                            onClick={() => confirmReserva(reserva.id)}
                                                            disabled={actionLoading === reserva.id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                                                        >
                                                            {actionLoading === reserva.id ? "..." : "Confirmar"}
                                                        </button>
                                                        <button
                                                            onClick={() => cancelReserva(reserva.id)}
                                                            disabled={actionLoading === reserva.id}
                                                            className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                                                            title="Anular Reserva"
                                                        >
                                                            {actionLoading === reserva.id ? "..." : <XCircle className="w-5 h-5" />}
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
