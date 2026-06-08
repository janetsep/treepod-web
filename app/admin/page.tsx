"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DomoCalendar from "./components/DomoCalendar";
import ReservaModal from "./components/ReservaModal";
import TarifasConsole from "./components/TarifasConsole";
import UsersConsole from "./components/UsersConsole";
import ClientesConsole from "./components/ClientesConsole";
import ServiciosConsole from "./components/ServiciosConsole";
import PapeleraConsole from "./components/PapeleraConsole";
import { Plus, BarChart3, ChevronDown, Calendar, RefreshCw, Pencil, CheckCircle2, XCircle, TrendingUp, LayoutDashboard, Trash2, Search, Users, Globe, MessageCircle, Home, CreditCard, UserCircle, Settings, Clock } from "lucide-react";

export default function AdminDashboard() {
    const [view, setView] = useState<'reservas' | 'tarifas' | 'servicios' | 'usuarios' | 'clientes' | 'historial' | 'papelera'>('reservas');
    const [reservas, setReservas] = useState<any[]>([]);
    const [domos, setDomos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedReservas, setExpandedReservas] = useState(true);
    const [soloProximas, setSoloProximas] = useState(true);
    const [expandedCalendar, setExpandedCalendar] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReserva, setEditingReserva] = useState<any | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [adminRole, setAdminRole] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: 'fecha_inicio' | 'fecha_fin', order: 'asc' | 'desc' } | null>(null);
    const [syncingAirbnb, setSyncingAirbnb] = useState(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 30;

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            setAdminEmail(session.user.email);
            // Fetch role from table
            const { data: adminData } = await supabase
                .from("authorized_admins")
                .select("rol")
                .eq("email", session.user.email)
                .single();
            setAdminRole(adminData?.rol || (session.user.email.endsWith("@domostreepod.cl") ? "admin" : "viewer"));
        }
        await Promise.all([fetchReservas(), fetchDomos()]);
        setLoading(false);
    }

    async function fetchDomos() {
        const { data } = await supabase.from("domos").select("*").order("nombre");
        if (data) setDomos(data);
    }

    async function syncAirbnb() {
        setSyncingAirbnb(true);
        setSyncResult(null);
        try {
            const res = await fetch("/api/admin/sync-airbnb?manual=1");
            const data = await res.json();
            if (data.ok) {
                const msg = `✅ Airbnb sincronizado: ${data.total_creadas} nueva${data.total_creadas !== 1 ? 's' : ''}, ${data.total_actualizadas} actualizada${data.total_actualizadas !== 1 ? 's' : ''}`;
                setSyncResult(msg);
                await fetchReservas(); // refrescar lista
            } else {
                setSyncResult(`⚠️ ${data.error || "Error en sync"}`);
            }
        } catch {
            setSyncResult("⚠️ Error de conexión al sincronizar");
        } finally {
            setSyncingAirbnb(false);
            setTimeout(() => setSyncResult(null), 8000);
        }
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
                body: JSON.stringify({ reservaId: id, adminEmail })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Reserva cancelada correctamente");
                fetchReservas(); // Refresh
            } else {
                alert(`❌ ERROR AL ANULAR:\n${data.error}`);
            }
        } catch (e) {
            alert("Error de conexión al intentar anular.");
        } finally {
            setActionLoading(null);
        }
    }

    async function deleteReserva(id: string, estado: string, montoPagado: number) {
        const isConfirmed = estado === 'pagado' && montoPagado > 0;
        const msg = isConfirmed
            ? `⚠️ Esta reserva tiene pago confirmado de $${montoPagado.toLocaleString()}. ¿Estás SEGURA que deseas eliminarla permanentemente? Esta acción es IRREVERSIBLE.`
            : `¿Eliminar permanentemente este registro? Esta acción es irreversible.`;

        if (!confirm(msg)) return;

        setActionLoading(id);
        try {
            const res = await fetch("/api/admin/reservas/eliminar", {
                method: "POST",
                body: JSON.stringify({ reservaId: id, adminEmail })
            });
            const data = await res.json();

            if (res.ok) {
                // Remover de la lista sin recargar
                setReservas(prev => prev.filter(r => r.id !== id));
                setSelectedIds(prev => prev.filter(sid => sid !== id));
                alert("Registro eliminado permanentemente.");
            } else {
                alert(`❌ ERROR AL ELIMINAR:\n${data.error}\n\nDetalles: ${data.details || 'N/A'}`);
            }
        } catch (e) {
            alert("Error de conexión al intentar eliminar.");
        } finally {
            setActionLoading(null);
        }
    }

    async function bulkDelete() {
        const count = selectedIds.length;
        if (count === 0) return;

        const msg = `¿Mover ${count} reservas a la papelera? Podrás restaurarlas desde la pestaña Papelera.`;
        if (!confirm(msg)) return;

        setActionLoading('bulk-delete');
        try {
            let successCount = 0;
            let errors = [];

            // Ejecutamos uno por uno para asegurar el flujo de la API de borrado que ya existe
            for (const id of selectedIds) {
                const res = await fetch("/api/admin/reservas/eliminar", {
                    method: "POST",
                    body: JSON.stringify({ reservaId: id, adminEmail })
                });
                if (res.ok) successCount++;
                else {
                    const data = await res.json();
                    errors.push(`ID ${id.slice(0, 8)}: ${data.error}`);
                }
            }

            if (successCount > 0) {
                setReservas(prev => prev.filter(r => !selectedIds.includes(r.id)));
                setSelectedIds([]);
                alert(`Se movieron ${successCount} registros a la papelera.`);
            }

            if (errors.length > 0) {
                alert(`No se pudieron eliminar ${errors.length} registros:\n\n${errors.join('\n')}`);
            }
        } catch (e) {
            alert("Error de conexión durante el proceso de borrado masivo.");
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
                body: JSON.stringify({ reservaId: id, adminEmail })
            });
            const data = await res.json();

            if (res.ok) {
                fetchReservas();

                // Oferta de agregar al calendario
                const reserva = reservas.find(r => r.id === id);
                const quiereCalendario = confirm("✅ Reserva confirmada.\n\n¿Deseas agregar esta reserva a Google Calendar?");

                if (quiereCalendario && reserva) {
                    const clientName = reserva.clientes?.nombre
                        ? `${reserva.clientes.nombre} ${reserva.clientes.apellido || ""}`
                        : `${reserva.nombre || "Huésped"} ${reserva.apellido || ""}`;
                    const email = reserva.clientes?.email || reserva.email || "";

                    const startDate = reserva.fecha_inicio?.replace(/-/g, "");
                    const endDate = reserva.fecha_fin?.replace(/-/g, "");
                    const title = encodeURIComponent(`🏕 TreePod — ${clientName.trim()}`);

                    // Obtener desglose real de tarifas por tramo desde el RPC
                    let desgloseLinea = "";
                    try {
                        const precioRes = await fetch("/api/calcular-precio", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                entrada: reserva.fecha_inicio,
                                salida: reserva.fecha_fin,
                                adultos: reserva.adultos || 2
                            })
                        });
                        const precioData = await precioRes.json();
                        if (precioData.desglose) {
                            desgloseLinea = `\nTarifas aplicadas:\n${precioData.desglose}`;
                        }
                    } catch (_) { }

                    const fechaIn = new Date(reserva.fecha_inicio);
                    const fechaOut = new Date(reserva.fecha_fin);
                    const noches = Math.round((fechaOut.getTime() - fechaIn.getTime()) / (1000 * 60 * 60 * 24));

                    const details = encodeURIComponent(
                        `Reserva confirmada\n` +
                        `Huésped: ${clientName.trim()}\n` +
                        (email ? `Email: ${email}\n` : '') +
                        `Adultos: ${reserva.adultos || '—'}\n` +
                        `Noches: ${noches}` +
                        desgloseLinea + `\n` +
                        `Total: $${(reserva.total || 0).toLocaleString('es-CL')}\n` +
                        `Abonado: $${(reserva.monto_pagado || 0).toLocaleString('es-CL')}`
                    );
                    const location = encodeURIComponent("TreePod — Nevados de Chillán, Chile");

                    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
                    window.open(calUrl, "_blank");
                }
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
        // Mostrar canceladas para tener historial
        // if (r.estado === 'cancelada') return false; 

        // Si está en proceso de pago (pendiente_pago) PERO no tiene email, es un carrito abandonado pre-checkout.
        // El usuario pidió "definitivamente no son reservas".
        if (r.estado === 'pendiente_pago' && !r.email) return false;

        return true;
    };
    const todayStr = new Date().toISOString().split('T')[0];
    const validReservas = reservas.filter(isValidReserva);
    // Pestaña "Historial": solo reservas pasadas (fecha_fin < hoy).
    // Pestaña "Dashboard": switch entre solo actuales+futuras (default) o todas.
    const baseReservas = view === 'historial'
        ? validReservas.filter((r: any) => r.fecha_fin < todayStr)
        : soloProximas
            ? validReservas.filter((r: any) => r.fecha_fin >= todayStr)
            : validReservas;
    const filteredReservas = baseReservas.filter((r: any) => {
        if (!searchTerm) return true;
        const clientName = `${r.clientes?.nombre || ""} ${r.clientes?.apellido || ""} ${r.nombre || ""} ${r.apellido || ""}`.toLowerCase();
        const email = (r.email || r.clientes?.email || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return clientName.includes(search) || email.includes(search) || r.id.toLowerCase().includes(search);
    });

    // Orden por defecto:
    //  - Dashboard + solo próximas → ASC (las más cercanas arriba)
    //  - Dashboard "todas" o Historial → DESC (más recientes arriba; pasadas remotas al final)
    const sortedReservas = [...filteredReservas].sort((a, b) => {
        if (sortConfig) {
            const aValue = new Date(a[sortConfig.key]).getTime();
            const bValue = new Date(b[sortConfig.key]).getTime();
            return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const cmp = (a.fecha_inicio || '').localeCompare(b.fecha_inicio || '');
        const asc = view !== 'historial' && soloProximas;
        return asc ? cmp : -cmp;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedReservas.length / ITEMS_PER_PAGE);
    const paginatedReservas = sortedReservas.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Filtered lists
    const upcomingReservations = validReservas.filter((r: any) => r.fecha_inicio >= todayStr);
    const pastReservations = validReservas.filter((r: any) => r.fecha_inicio < todayStr);

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
                    <div>
                        <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">TreePod Admin Portal</h1>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Sincronización total con DomoTreePod.cl</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Estado Sistema</span>
                            <span className="text-xs font-bold text-green-500">Operativo · Online</span>
                        </div>
                        {adminRole !== 'viewer' && (
                            <button
                                onClick={openNewReserva}
                                className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-[1.2rem] text-sm font-black shadow-xl shadow-black/10 flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Reserva
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs de Navegación Premium */}
                <div className="flex gap-2 bg-gray-200/50 p-1.5 rounded-[1.8rem] w-fit">
                    <button
                        onClick={() => setView('reservas')}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'reservas' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setView('tarifas')}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'tarifas' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Tarifas y Precios
                    </button>
                    <button
                        onClick={() => setView('servicios')}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'servicios' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Settings className="w-4 h-4" />
                        Servicios / Extras
                    </button>
                    <button
                        onClick={() => setView('clientes')}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'clientes' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <UserCircle className="w-4 h-4" />
                        CRM / Clientes
                    </button>
                    <button
                        onClick={() => { setView('historial'); setCurrentPage(1); }}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'historial' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Clock className="w-4 h-4" />
                        Historial
                    </button>
                    <button
                        onClick={() => setView('papelera')}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'papelera' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Papelera
                    </button>
                    {['admin', 'superadmin'].includes(adminRole || '') && (
                        <button
                            onClick={() => setView('usuarios')}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all ${view === 'usuarios' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Users className="w-4 h-4" />
                            Accesos
                        </button>
                    )}
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-8 py-3.5 rounded-[1.3rem] text-xs font-black uppercase tracking-widest transition-all text-gray-400 hover:text-gray-600 hover:bg-white/50"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Estadísticas
                    </Link>
                </div>

                {view === 'tarifas' ? (
                    <TarifasConsole adminRole={adminRole} adminEmail={adminEmail} />
                ) : view === 'servicios' ? (
                    <ServiciosConsole adminRole={adminRole} />
                ) : view === 'usuarios' ? (
                    <UsersConsole />
                ) : view === 'clientes' ? (
                    <ClientesConsole />
                ) : view === 'papelera' ? (
                    <PapeleraConsole adminEmail={adminEmail} />
                ) : (
                    <>
                        {/* KPI y Calendario solo en Dashboard (no en Historial) */}
                        {view !== 'historial' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary transition-all hover:shadow-md w-full sm:max-w-xs">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Próximas Llegadas</p>
                            <p className="text-3xl font-display font-black text-primary">
                                {upcomingReservations.length}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Desde hoy en adelante</p>
                        </div>
                        )}

                        {/* Calendar View */}
                        {view !== 'historial' && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => setExpandedCalendar(!expandedCalendar)}
                                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                                >
                                    <h2 className="text-xl font-display font-black text-gray-800 flex items-center gap-2">
                                        <Calendar className="w-6 h-6 text-primary" />
                                        Ocupación del Domo
                                    </h2>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-500 ${expandedCalendar ? 'rotate-180' : ''}`} />
                                </button>
                                <div className="flex items-center gap-3">
                                    {syncResult && (
                                        <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                            {syncResult}
                                        </span>
                                    )}
                                    {['admin', 'superadmin'].includes(adminRole || '') && (
                                        <button
                                            onClick={syncAirbnb}
                                            disabled={syncingAirbnb}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5A5F]/10 border border-[#FF5A5F]/30 text-[#FF5A5F] text-xs font-black uppercase tracking-widest hover:bg-[#FF5A5F]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Sincronizar reservas desde Airbnb"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${syncingAirbnb ? 'animate-spin' : ''}`} />
                                            {syncingAirbnb ? 'Sincronizando...' : 'Sync Airbnb'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {expandedCalendar && (
                                <div className="p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {loading ? (
                                        <div className="h-40 flex items-center justify-center text-gray-400 animate-pulse font-bold italic">Cargando disponibilidad...</div>
                                    ) : (
                                        <DomoCalendar reservas={reservas} domos={domos} />
                                    )}
                                </div>
                            )}
                        </div>
                        )}

                        {/* List View - COLLAPSIBLE */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setExpandedReservas(!expandedReservas)}
                                className="w-full p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors"
                            >
                                <h2 className="text-xl font-display font-black text-gray-800 flex items-center gap-2">
                                    {view === 'historial' ? <Clock className="w-6 h-6 text-primary" /> : <LayoutDashboard className="w-6 h-6 text-primary" />}
                                    {view === 'historial' ? 'Historial de Reservas' : 'Maestro de Reservas'}
                                </h2>
                                <div className="flex items-center gap-4">
                                    {selectedIds.length > 0 && ['admin', 'superadmin'].includes(adminRole || '') && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); bulkDelete(); }}
                                            disabled={actionLoading === 'bulk-delete'}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Mover a Papelera ({selectedIds.length})
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); loadData(); }}
                                        className="text-primary hover:text-primary-dark text-xs font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                                    </button>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-500 ${expandedReservas ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            <div className={`transition-all duration-500 ease-in-out ${expandedReservas ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-wrap items-center gap-4">
                                    <div className="relative flex-1 min-w-[300px]">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, email o ID de reserva..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    {view !== 'historial' && (
                                        <button
                                            onClick={() => { setSoloProximas(!soloProximas); setCurrentPage(1); }}
                                            title={soloProximas ? "Mostrar también reservas pasadas" : "Volver a mostrar solo actuales y futuras"}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${soloProximas
                                                ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                                                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                                        >
                                            {soloProximas ? "📅 Solo próximas" : "🗂 Viendo todas (pasadas incluidas)"}
                                        </button>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Registros: {filteredReservas.length} / {baseReservas.length} {view === 'historial' ? "(pasadas)" : soloProximas ? "(actuales y futuras)" : "(todas)"}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                            <tr>
                                                <th className="px-8 py-5 w-[50px]">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        checked={paginatedReservas.length > 0 && paginatedReservas.every(r => selectedIds.includes(r.id))}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedIds(paginatedReservas.map(r => r.id));
                                                            } else {
                                                                setSelectedIds([]);
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th className="px-5 py-3 font-black whitespace-nowrap">Huésped / Referencia</th>
                                                <th className="px-4 py-3 font-black whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        Estancia
                                                        <div className="flex gap-2 items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                            <div className="flex flex-col">
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_inicio', order: 'asc' })}
                                                                    className={`p-0 -mb-1 ${sortConfig?.key === 'fecha_inicio' && sortConfig.order === 'asc' ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
                                                                    title="Ordenar por Entrada (Asc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5 rotate-180" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_inicio', order: 'desc' })}
                                                                    className={`p-0 ${sortConfig?.key === 'fecha_inicio' && sortConfig.order === 'desc' ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
                                                                    title="Ordenar por Entrada (Desc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                            <div className="w-[1px] h-3 bg-gray-200"></div>
                                                            <div className="flex flex-col">
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_fin', order: 'asc' })}
                                                                    className={`p-0 -mb-1 ${sortConfig?.key === 'fecha_fin' && sortConfig.order === 'asc' ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
                                                                    title="Ordenar por Salida (Asc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5 rotate-180" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_fin', order: 'desc' })}
                                                                    className={`p-0 ${sortConfig?.key === 'fecha_fin' && sortConfig.order === 'desc' ? 'text-primary' : 'text-gray-300 hover:text-gray-400'}`}
                                                                    title="Ordenar por Salida (Desc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 font-black whitespace-nowrap">Domo</th>
                                                <th className="px-4 py-3 font-black whitespace-nowrap text-center">Fuente</th>
                                                <th className="px-4 py-3 font-black whitespace-nowrap">Finanzas</th>
                                                <th className="px-4 py-3 font-black whitespace-nowrap">Estado</th>
                                                <th className="px-5 py-3 text-right font-black whitespace-nowrap">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loading ? (
                                                <tr><td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-bold italic">Sincronizando con base de datos...</td></tr>
                                            ) : paginatedReservas.length === 0 ? (
                                                <tr><td colSpan={7} className="px-8 py-20 text-center text-gray-400 font-bold italic">No se encontraron registros.</td></tr>
                                            ) : paginatedReservas.map((reserva) => {
                                                const clientName = reserva.estado === "bloqueado"
                                                    ? `🔒 Bloqueado${reserva.notas ? ` - ${reserva.notas}` : ""}`
                                                    : reserva.clientes?.nombre
                                                        ? `${reserva.clientes.nombre} ${reserva.clientes.apellido || ""}`
                                                        : `${reserva.nombre || "Sin nombre"} ${reserva.apellido || ""}`;

                                                const clientEmail = reserva.clientes?.email || reserva.email || "Email no registrado";
                                                const isVip = reserva.clientes?.vip_tier && reserva.clientes.vip_tier !== 'Standard';

                                                return (
                                                    <tr key={reserva.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(reserva.id) ? 'bg-primary/[0.03]' : ''}`}>
                                                        <td className="px-8 py-5">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                checked={selectedIds.includes(reserva.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedIds(prev => [...prev, reserva.id]);
                                                                    else setSelectedIds(prev => prev.filter(id => id !== reserva.id));
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <div className="font-extrabold text-gray-900 text-xs leading-none">{clientName}</div>
                                                                <span className="bg-gray-100/80 text-gray-500 text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">{reserva.adultos || 2}p</span>
                                                                {isVip && (
                                                                    <span className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.1em] shadow-sm">VIP</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-0 mb-1.5">
                                                                <div className="text-[10px] text-gray-400 font-medium leading-tight">{clientEmail}</div>
                                                                {(reserva.telefono || reserva.clientes?.telefono) && (
                                                                    <div className="text-[9px] text-primary font-black flex items-center gap-1 uppercase tracking-tight">
                                                                        {reserva.telefono || reserva.clientes?.telefono}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-tighter bg-primary/5 px-1 py-0.5 rounded">#{reserva.id.slice(0, 8).toUpperCase()}</span>
                                                                {reserva.comprobante_url && (
                                                                    <a
                                                                        href={reserva.comprobante_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-black uppercase tracking-tighter hover:bg-green-200 transition-colors"
                                                                        title={`Ver ${(reserva.tipo_documento || 'boleta').charAt(0).toUpperCase() + (reserva.tipo_documento || 'boleta').slice(1)} / Comprobante`}
                                                                    >
                                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                                        {(reserva.tipo_documento || 'boleta').charAt(0).toUpperCase() + (reserva.tipo_documento || 'boleta').slice(1)}
                                                                    </a>
                                                                )}
                                                                 {adminRole !== 'viewer' && (
                                                                    <button
                                                                        onClick={() => openEditReserva(reserva)}
                                                                        className="text-[8px] font-black text-gray-400 hover:text-primary uppercase tracking-widest flex items-center gap-0.5 transition-colors"
                                                                    >
                                                                        <Pencil className="w-2.5 h-2.5" />
                                                                        Editar
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {(reserva.notas || reserva.mensaje) && (
                                                                <div className="mt-3 p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl text-xs text-yellow-800 font-medium max-w-xs italic">
                                                                    "{reserva.notas || reserva.mensaje}"
                                                                </div>
                                                            )}
                                                            {reserva.reserva_servicios && reserva.reserva_servicios.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {reserva.reserva_servicios.map((s: any) => (
                                                                        <span key={s.id} className="bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight">
                                                                            {s.servicios?.nombre || 'Extra'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-gray-800 font-bold text-[11px] whitespace-nowrap">
                                                                {(() => { const [y, m, d] = reserva.fecha_inicio.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }); })()}
                                                                <span className="text-gray-300 mx-1">→</span>
                                                                {(() => { const [y, m, d] = reserva.fecha_fin.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }); })()}
                                                            </div>
                                                            <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                                                {String(reserva.fecha_inicio).substring(0, 4)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="px-2 py-1 bg-gray-100 rounded text-[8px] font-black text-gray-600 uppercase tracking-widest border border-gray-200 shadow-sm">
                                                                {reserva.domos?.nombre || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1.5 ${
                                                                    reserva.fuente === 'web' ? 'bg-primary/5 text-primary border-primary/10' :
                                                                    reserva.fuente === 'whatsapp' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                    reserva.fuente === 'airbnb' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                    reserva.fuente === 'booking' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                                }`}>
                                                                    {reserva.fuente === 'web' && <Globe className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente === 'whatsapp' && <MessageCircle className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente === 'airbnb' && <Home className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente === 'booking' && <CreditCard className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente || 'web'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className={`font-black text-xs ${reserva.monto_pagado >= reserva.total ? 'text-green-600' : 'text-gray-900'}`}>
                                                                ${(reserva.monto_pagado || 0).toLocaleString()}
                                                            </div>
                                                            <div className="text-[8px] text-gray-400 font-black uppercase tracking-[0.05em] mt-0.5">
                                                                / ${(reserva.total || 0).toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-[0.1em] shadow-sm ${getStatusColor(reserva.estado)}`}>
                                                                {reserva.estado === 'pendiente_pago' ? 'Check-out Web' : reserva.estado}
                                                            </span>
                                                            {reserva.fuente && (
                                                                <div className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">
                                                                    {reserva.fuente}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <div className="flex justify-end items-center gap-1.5">
                                                                 {reserva.estado !== 'pagado' && reserva.estado !== 'cancelada' && reserva.estado !== 'expirada' && adminRole !== 'viewer' && (
                                                                    <button
                                                                        onClick={() => confirmReserva(reserva.id)}
                                                                        disabled={actionLoading === reserva.id}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                                                                    >
                                                                        {actionLoading === reserva.id ? "..." : "Confirmar"}
                                                                    </button>
                                                                )}
                                                                {reserva.estado !== 'cancelada' && adminRole !== 'viewer' && (
                                                                    <button
                                                                        onClick={() => cancelReserva(reserva.id)}
                                                                        disabled={actionLoading === reserva.id}
                                                                        className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-all border border-orange-100"
                                                                        title="Anular Reserva"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                {['admin', 'superadmin'].includes(adminRole || '') && (
                                                                    <button
                                                                        onClick={() => deleteReserva(reserva.id, reserva.estado, reserva.monto_pagado || 0)}
                                                                        disabled={actionLoading === reserva.id}
                                                                        className="p-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all border border-red-100"
                                                                        title="Eliminar registro"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            Página {currentPage} de {totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); setSelectedIds([]); }}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                                            >
                                                Anterior
                                            </button>
                                            <div className="flex gap-1">
                                                {(() => {
                                                    const delta = 2;
                                                    const range = [];
                                                    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                                                        range.push(i);
                                                    }

                                                    if (currentPage - delta > 2) range.unshift('...');
                                                    range.unshift(1);
                                                    if (currentPage + delta < totalPages - 1) range.push('...');
                                                    if (totalPages > 1) range.push(totalPages);

                                                    return range.map((page, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => { if (typeof page === 'number') { setCurrentPage(page); setSelectedIds([]); } }}
                                                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-100'} ${typeof page !== 'number' ? 'cursor-default border-none' : ''}`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ));
                                                })()}
                                            </div>
                                            <button
                                                onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); setSelectedIds([]); }}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ReservaModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            domos={domos}
                            onSave={loadData}
                            reservaToEdit={editingReserva}
                            adminEmail={adminEmail}
                            adminRole={adminRole}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

