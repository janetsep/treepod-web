"use client";

import { adminFetch } from "@/lib/admin-fetch";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DomoCalendar from "./components/DomoCalendar";
import ReservaModal from "./components/ReservaModal";
import TarifasConsole from "./components/TarifasConsole";
import UsersConsole from "./components/UsersConsole";
import ClientesConsole from "./components/ClientesConsole";
import LeadsConsole from "./components/LeadsConsole";
import ServiciosConsole from "./components/ServiciosConsole";
import PapeleraConsole from "./components/PapeleraConsole";
import CaidasConsole from "./components/CaidasConsole";
import SicraConsole from "./components/SicraConsole";
import ProyectosPanel from "./components/ProyectosPanel";
import CartolasPanel from "./components/CartolasPanel";
import ClimaWidget from "./components/ClimaWidget";
import { Plus, BarChart3, ChevronDown, Calendar, RefreshCw, Pencil, CheckCircle2, XCircle, TrendingUp, LayoutDashboard, Trash2, Search, Users, Globe, MessageCircle, Home, CreditCard, UserCircle, Settings, Clock, ShoppingCart, Mail, MailCheck, FolderOpen, Receipt } from "lucide-react";

export default function AdminDashboard() {
    const [view, setView] = useState<'reservas' | 'tarifas' | 'servicios' | 'usuarios' | 'clientes' | 'leads' | 'historial' | 'papelera' | 'caidas' | 'sicra' | 'proyectos' | 'cartolas'>('reservas');
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
    const [domoFilter, setDomoFilter] = useState("");
    const [soloPorEmitir, setSoloPorEmitir] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [adminRole, setAdminRole] = useState<string | null>(null);
    const [reservasError, setReservasError] = useState<string | null>(null);
    const [adminEmail, setAdminEmail] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: 'fecha_inicio' | 'fecha_fin', order: 'asc' | 'desc' } | null>(null);
    const [syncingAirbnb, setSyncingAirbnb] = useState(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);
    // Modal "Registrar pago de saldo"
    const [pagoReserva, setPagoReserva] = useState<any | null>(null);
    const [pagoMonto, setPagoMonto] = useState<string>("");
    const [pagoMetodo, setPagoMetodo] = useState<string>("efectivo");
    const [pagoLoading, setPagoLoading] = useState(false);
    const [pagoOperacion, setPagoOperacion] = useState("");
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
            setAdminRole(adminData?.rol || "viewer");
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
            const res = await adminFetch("/api/admin/sync-airbnb?manual=1");
            const data = await res.json();
            if (data.ok) {
                const msg = `Airbnb sincronizado: ${data.total_creadas} nueva${data.total_creadas !== 1 ? 's' : ''}, ${data.total_actualizadas} actualizada${data.total_actualizadas !== 1 ? 's' : ''}`;
                setSyncResult(msg);
                await fetchReservas(); // refrescar lista
            } else {
                setSyncResult(`Error: ${data.error || "Error en sync"}`);
            }
        } catch {
            setSyncResult("Error de conexión al sincronizar");
        } finally {
            setSyncingAirbnb(false);
            setTimeout(() => setSyncResult(null), 8000);
        }
    }

    async function fetchReservas() {
        try {
            const res = await adminFetch("/api/admin/reservas");
            const data = await res.json();

            if (!res.ok) {
                console.error("Error fetching reservas:", data.error);
                setReservasError("No se pudieron actualizar las reservas. Los datos mostrados pueden estar desactualizados; reintenta antes de operar.");
            } else {
                setReservas(data || []);
                setReservasError(null);
            }
        } catch (e) {
            console.error("Network error fetching reservas:", e);
            setReservasError("No hay conexión con las reservas. Esto no significa que no existan reservas.");
        }
    }

    async function cancelReserva(id: string) {
        if (!confirm("¿Dar de baja esta reserva? Se liberarán las fechas.")) return;

        setActionLoading(id);
        try {
            const res = await adminFetch("/api/admin/reservas/cancelar", {
                method: "POST",
                body: JSON.stringify({ reservaId: id, adminEmail })
            });
            const data = await res.json();

            if (res.ok) {
                alert("Reserva cancelada correctamente");
                fetchReservas(); // Refresh
            } else {
                alert(`No se pudo anular la reserva:\n${data.error}`);
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
            ? `Esta reserva tiene pago confirmado de $${montoPagado.toLocaleString('es-CL')}. ¿Estás SEGURA que deseas eliminarla permanentemente? Esta acción es IRREVERSIBLE.`
            : `¿Eliminar permanentemente este registro? Esta acción es irreversible.`;

        if (!confirm(msg)) return;

        setActionLoading(id);
        try {
            const res = await adminFetch("/api/admin/reservas/eliminar", {
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
                alert(`No se pudo eliminar el registro:\n${data.error}\n\nDetalles: ${data.details || 'Sin detalles'}`);
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
                const res = await adminFetch("/api/admin/reservas/eliminar", {
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
            const res = await adminFetch("/api/admin/reservas/confirmar", {
                method: "POST",
                body: JSON.stringify({ reservaId: id, adminEmail })
            });
            const data = await res.json();

            if (res.ok) {
                fetchReservas();

                // Oferta de agregar al calendario
                const reserva = reservas.find(r => r.id === id);
                const quiereCalendario = confirm("Reserva confirmada.\n\n¿Deseas agregar esta reserva a Google Calendar?");

                if (quiereCalendario && reserva) {
                    const clientName = reserva.clientes?.nombre
                        ? `${reserva.clientes.nombre} ${reserva.clientes.apellido || ""}`
                        : `${reserva.nombre || "Huésped"} ${reserva.apellido || ""}`;
                    const email = reserva.clientes?.email || reserva.email || "";

                    const startDate = reserva.fecha_inicio?.replace(/-/g, "");
                    const endDate = reserva.fecha_fin?.replace(/-/g, "");
                    const title = encodeURIComponent(`TreePod — ${clientName.trim()}`);

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
                alert(`No se pudo confirmar la reserva:\n${data.error}`);
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setActionLoading(null);
        }
    }

    const abrirPago = (reserva: any) => {
        const saldo = (Number(reserva.total) || 0) - (Number(reserva.monto_pagado) || 0);
        setPagoReserva(reserva);
        setPagoMonto(String(saldo > 0 ? saldo : ""));
        setPagoMetodo("efectivo");
        setPagoOperacion(crypto.randomUUID());
    };

    async function registrarPago() {
        if (!pagoReserva || pagoLoading) return;
        const monto = Math.round(Number(pagoMonto));
        if (!monto || monto <= 0) { alert("Ingresa un monto válido"); return; }
        setPagoLoading(true);
        try {
            const res = await adminFetch("/api/admin/reservas/registrar-pago", {
                method: "POST",
                body: JSON.stringify({ reservaId: pagoReserva.id, monto, metodo: pagoMetodo, operacionId: pagoOperacion })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Pago registrado. ${data.saldo > 0 ? `Saldo restante: $${data.saldo.toLocaleString('es-CL')}` : 'Reserva pagada por completo.'}`);
                setPagoReserva(null);
                fetchReservas();
            } else {
                alert(`No se pudo registrar el pago: ${data.error}`);
            }
        } catch {
            alert("Error de conexión al registrar el pago.");
        } finally {
            setPagoLoading(false);
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
    // Fecha de HOY en horario local (en-CA da aaaa-mm-dd). Con toISOString() la fecha
    // saltaba al día siguiente desde las ~20:00-21:00 hora de Chile (UTC-3/UTC-4).
    const todayStr = new Date().toLocaleDateString('en-CA');
    const validReservas = reservas.filter(isValidReserva);

    // ¿A esta reserva le falta emitir boleta/factura? (misma regla que el dashboard de estadísticas)
    // Estadía pagada del año en curso, sin folio DTE y que NO se pagó con Transbank (esos emiten solos).
    const esTransbankDoc = (r: any) => {
        const mp = `${r.metodo_pago || ""} ${r.metodo_pago_inicial || ""}`.toLowerCase();
        return mp.includes("webpay") || mp.includes("transbank") || !!r.payment_intent_id || !!r.numero_transaccion;
    };
    // Se considera EMITIDA si tiene folio DTE registrado O si tiene el archivo de la
    // boleta/factura subido (comprobante_url) — para Janet ese archivo ES el documento emitido.
    const estaEmitidoDoc = (r: any) => {
        const f = r.metadata && (r.metadata.folio_dte ?? r.metadata.folio);
        const tieneFolio = f !== undefined && f !== null && String(f).trim() !== "";
        return tieneFolio || !!r.comprobante_url;
    };
    const estadosExcluidosDoc = new Set(["bloqueado", "cancelado", "cancelada", "no show", "no-show", "suspendido"]);
    const inicioAnioStr = `${new Date().getFullYear()}-01-01`;
    const faltaEmitir = (r: any) => {
        if (estadosExcluidosDoc.has((r.estado || "").toLowerCase())) return false;
        if (!(Number(r.monto_pagado) > 0)) return false;
        if (String(r.fecha_inicio) < inicioAnioStr) return false;
        if (estaEmitidoDoc(r)) return false;
        if (esTransbankDoc(r)) return false;
        return true;
    };
    const porEmitirCount = validReservas.filter(faltaEmitir).length;

    // Pestaña "Historial": solo reservas pasadas (fecha_fin < hoy).
    // Pestaña "Dashboard": switch entre solo actuales+futuras (default) o todas.
    // Con "Solo por emitir" activo se ignora el recorte de próximas (los documentos suelen ser de estadías ya cumplidas).
    const baseReservas = view === 'historial'
        ? validReservas.filter((r: any) => r.fecha_fin < todayStr)
        : (soloProximas && !soloPorEmitir)
            ? validReservas.filter((r: any) => r.fecha_fin >= todayStr)
            : validReservas;
    const filteredReservas = baseReservas.filter((r: any) => {
        if (soloPorEmitir && !faltaEmitir(r)) return false;
        if (domoFilter && r.domo_id !== domoFilter) return false;
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

    // Reset page when search or domo filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, domoFilter, soloPorEmitir]);

    // Filtered lists
    const upcomingReservations = validReservas.filter((r: any) => r.fecha_inicio >= todayStr);
    const pastReservations = validReservas.filter((r: any) => r.fecha_inicio < todayStr);

    // Vista operativa HOY (solo reservas firmes)
    const estadosFirmes = ['pagado', 'confirmado', 'pendiente', 'pending_transfer_confirmation'];
    const llegadasHoy = validReservas.filter((r: any) => r.fecha_inicio === todayStr && estadosFirmes.includes(r.estado));
    const salidasHoy = validReservas.filter((r: any) => r.fecha_fin === todayStr && estadosFirmes.includes(r.estado));
    const domosRecambio = new Set(salidasHoy.map((s: any) => s.domo_id).filter((d: any) => llegadasHoy.some((l: any) => l.domo_id === d)));

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pagado": return "bg-green-100 text-green-800";
            case "confirmado": case "confirmada": return "bg-blue-100 text-blue-800";
            case "pendiente": return "bg-yellow-100 text-yellow-800";
            case "pendiente_pago": return "bg-yellow-100 text-yellow-800";
            case "pending_transfer_confirmation": return "bg-sky-100 text-sky-800";
            case "suspendido": return "bg-orange-100 text-orange-800";
            case "cancelada": case "cancelado": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Fecha ISO (aaaa-mm-dd) → dd-mm-aaaa legible, sin desfases de zona horaria.
    const formatFecha = (iso: string | null | undefined) => {
        if (!iso) return "—";
        const [y, m, d] = String(iso).slice(0, 10).split("-");
        return y && m && d ? `${d}-${m}-${y}` : String(iso);
    };

    // Etiquetas legibles: nunca mostrar estados internos de la BD crudos al usuario.
    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pagado": return "Pagado";
            case "confirmado": case "confirmada": return "Confirmada";
            case "pendiente": return "Pendiente";
            case "pendiente_pago": return "Pago pendiente";
            case "pending_transfer_confirmation": return "Esperando transferencia";
            case "suspendido": return "Suspendida";
            case "cancelada": case "cancelado": return "Cancelada";
            case "completada": case "completado": return "Completada";
            case "bloqueado": case "bloqueada": return "Bloqueado";
            case "expirada": case "expirado": return "Expirada";
            case "no show": case "no-show": return "No show";
            case "checked out": return "Check-out";
            default: return status || "—";
        }
    };

    // Etiquetas legibles para la fuente/canal (mismos valores que el select del ReservaModal).
    const FUENTE_LABELS: Record<string, string> = {
        web: "Web",
        whatsapp: "WhatsApp",
        airbnb: "Airbnb",
        booking: "Booking",
        instagram: "Instagram",
        presencial: "Presencial",
        manual_admin: "Manual Admin",
    };
    const getFuenteLabel = (fuente?: string | null) => {
        const f = (fuente || "web").toLowerCase();
        return FUENTE_LABELS[f] || fuente || "Web";
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {reservasError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                    <p>{reservasError}</p>
                    <button type="button" onClick={loadData} className="mt-2 underline font-bold">Reintentar carga</button>
                </div>}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="/images/branding/logo-treepod.jpg" alt="Domos TreePod" className="h-14 w-14 object-contain" />
                        <div>
                            <h1 className="text-xl md:text-3xl font-display font-black text-gray-900 tracking-tight">TreePod Admin Portal</h1>
                            <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] mt-1">Sincronización total con domostreepod.cl</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Estado Sistema</span>
                            <span className={`text-xs font-bold ${reservasError ? 'text-red-600' : 'text-green-500'}`}>{reservasError ? 'Revisar conexión' : 'Reservas actualizadas'}</span>
                        </div>
                        {adminRole !== 'viewer' && (
                            <button
                                onClick={openNewReserva}
                                className="px-4 md:px-6 py-2.5 md:py-3 bg-gray-900 hover:bg-black text-white rounded-[1.2rem] text-xs md:text-sm font-black shadow-xl shadow-black/10 flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Reserva
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs de Navegación Premium */}
                <div className="flex gap-2 bg-gray-200/50 p-1.5 rounded-[1.8rem] w-fit overflow-x-auto max-w-full">
                    <button
                        onClick={() => setView('reservas')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'reservas' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setView('tarifas')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'tarifas' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Tarifas y Precios
                    </button>
                    <button
                        onClick={() => setView('servicios')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'servicios' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <Settings className="w-4 h-4" />
                        Servicios / Extras
                    </button>
                    <button
                        onClick={() => setView('clientes')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'clientes' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <UserCircle className="w-4 h-4" />
                        CRM / Clientes
                    </button>
                    <button
                        onClick={() => setView('leads')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'leads' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <MailCheck className="w-4 h-4" />
                        Leads
                    </button>
                    <button
                        onClick={() => { setView('historial'); setCurrentPage(1); }}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'historial' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <Clock className="w-4 h-4" />
                        Historial
                    </button>
                    <button
                        onClick={() => setView('caidas')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'caidas' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        Se cayeron
                    </button>
                    <button
                        onClick={() => setView('papelera')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'papelera' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Papelera
                    </button>
                    {['admin', 'superadmin'].includes(adminRole || '') && (
                        <button
                            onClick={() => setView('usuarios')}
                            className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'usuarios' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                        >
                            <Users className="w-4 h-4" />
                            Accesos
                        </button>
                    )}
                    <button
                        onClick={() => setView('sicra')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'sicra' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        ALMA
                    </button>
                    <button
                        onClick={() => setView('proyectos')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'proyectos' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <FolderOpen className="w-4 h-4" />
                        Proyectos
                    </button>
                    <button
                        onClick={() => setView('cartolas')}
                        className={`flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all ${view === 'cartolas' ? 'bg-white text-gray-900 shadow-xl shadow-black/5' : 'text-gray-700 hover:text-gray-600'}`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Cartolas
                    </button>
                    <Link
                        href="/admin/calidad"
                        className="px-4 py-3 text-xs font-bold whitespace-nowrap text-gray-700 hover:bg-white rounded-xl"
                    >
                        Calidad del sistema
                    </Link>
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-4 md:px-3 md:px-8 py-2 md:py-2.5 md:py-3.5 rounded-[1.3rem] text-[11px] md:text-xs font-black uppercase tracking-wide md:tracking-widest whitespace-nowrap transition-all text-gray-700 hover:text-gray-600 hover:bg-white/50"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Estadísticas
                    </Link>
                </div>

                {view === 'proyectos' ? (
                    <ProyectosPanel />
                ) : view === 'cartolas' ? (
                    <CartolasPanel />
                ) : view === 'sicra' ? (
                    <SicraConsole />
                ) : view === 'tarifas' ? (
                    <TarifasConsole adminRole={adminRole} adminEmail={adminEmail} />
                ) : view === 'servicios' ? (
                    <ServiciosConsole adminRole={adminRole} />
                ) : view === 'usuarios' ? (
                    <UsersConsole />
                ) : view === 'clientes' ? (
                    <ClientesConsole />
                ) : view === 'leads' ? (
                    <LeadsConsole />
                ) : view === 'caidas' ? (
                    <CaidasConsole />
                ) : view === 'papelera' ? (
                    <PapeleraConsole adminEmail={adminEmail} />
                ) : (
                    <>
                        {/* VISTA OPERATIVA HOY (no en Historial) */}
                        {view !== 'historial' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Llegadas de hoy */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-3">Llegan hoy ({llegadasHoy.length}) · 16:00</p>
                                {llegadasHoy.length === 0 ? (
                                    <p className="text-xs text-gray-600 italic">Sin llegadas hoy</p>
                                ) : llegadasHoy.map((r: any) => {
                                    const saldo = (Number(r.total) || 0) - (Number(r.monto_pagado) || 0);
                                    const tel = r.telefono || r.clientes?.telefono;
                                    return (
                                        <div key={r.id} className="mb-3 pb-3 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-sm text-gray-900">{`${r.nombre || ''} ${r.apellido || ''}`.trim() || 'Huésped'}</span>
                                                <span className="text-[9px] font-black bg-gray-100 px-2 py-0.5 rounded uppercase">{r.domos?.nombre || '—'}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-900">
                                                {tel && <a href={`tel:${tel}`} className="text-primary font-bold">{tel}</a>}
                                                <span>{r.adultos || 2}p</span>
                                                {saldo > 0
                                                    ? <span className="text-amber-700 font-black bg-amber-50 px-2 py-0.5 rounded">Cobrar saldo ${saldo.toLocaleString('es-CL')}</span>
                                                    : <span className="text-green-600 font-bold">Pagado</span>}
                                            </div>
                                            {r.reserva_servicios?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {r.reserva_servicios.map((s: any) => (
                                                        <span key={s.id} className="text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full">{s.servicios?.nombre || 'Extra'}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Salidas de hoy */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-400">
                                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-3">Salen hoy ({salidasHoy.length}) · 12:00</p>
                                {salidasHoy.length === 0 ? (
                                    <p className="text-xs text-gray-600 italic">Sin salidas hoy</p>
                                ) : salidasHoy.map((r: any) => {
                                    const saldo = (Number(r.total) || 0) - (Number(r.monto_pagado) || 0);
                                    return (
                                        <div key={r.id} className="mb-3 pb-3 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-sm text-gray-900">{`${r.nombre || ''} ${r.apellido || ''}`.trim() || 'Huésped'}</span>
                                                <span className="text-[9px] font-black bg-gray-100 px-2 py-0.5 rounded uppercase">{r.domos?.nombre || '—'}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-900">
                                                <span>Aseo después de las 12:00</span>
                                                {domosRecambio.has(r.domo_id) && <span className="text-red-600 font-black bg-red-50 px-2 py-0.5 rounded">Recambio: llega otro hoy</span>}
                                                {saldo > 0 && <span className="text-amber-700 font-black">Saldo pendiente ${saldo.toLocaleString('es-CL')}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Próximas llegadas (KPI) */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary">
                                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Próximas Llegadas</p>
                                <p className="text-3xl font-display font-black text-primary">
                                    {upcomingReservations.length}
                                </p>
                                <p className="text-[10px] text-gray-700 mt-2 font-bold italic">Desde hoy en adelante</p>
                            </div>
                        </div>
                        )}

                        {/* Clima Las Trancas */}
                        {view !== 'historial' && (() => {
                            // Fechas con llegadas o salidas en los próximos 7 días (para resaltar en el widget)
                            const en7dias = new Date();
                            en7dias.setDate(en7dias.getDate() + 7);
                            const en7Str = en7dias.toLocaleDateString('en-CA');
                            const fechasConReserva = [
                                ...validReservas
                                    .filter((r: any) => estadosFirmes.includes(r.estado) && r.fecha_inicio >= todayStr && r.fecha_inicio <= en7Str)
                                    .map((r: any) => r.fecha_inicio),
                                ...validReservas
                                    .filter((r: any) => estadosFirmes.includes(r.estado) && r.fecha_fin >= todayStr && r.fecha_fin <= en7Str)
                                    .map((r: any) => r.fecha_fin),
                            ];
                            return <ClimaWidget fechasReserva={fechasConReserva} />;
                        })()}

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
                                    <ChevronDown className={`w-5 h-5 text-gray-700 transition-transform duration-500 ${expandedCalendar ? 'rotate-180' : ''}`} />
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
                                <div className="p-4 md:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {loading ? (
                                        <div className="h-40 flex items-center justify-center text-gray-700 animate-pulse font-bold italic">Cargando disponibilidad...</div>
                                    ) : (
                                        <DomoCalendar reservas={reservas} domos={domos} />
                                    )}
                                </div>
                            )}
                        </div>
                        )}

                        {/* List View - COLLAPSIBLE */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div
                                className="w-full p-6 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <h2
                                    onClick={() => setExpandedReservas(!expandedReservas)}
                                    className="flex-1 text-xl font-display font-black text-gray-800 flex items-center gap-2"
                                >
                                    {view === 'historial' ? <Clock className="w-6 h-6 text-primary" /> : <LayoutDashboard className="w-6 h-6 text-primary" />}
                                    {view === 'historial' ? 'Historial de Reservas' : 'Maestro de Reservas'}
                                </h2>
                                <div className="flex items-center gap-4">
                                    {selectedIds.length > 0 && ['admin', 'superadmin'].includes(adminRole || '') && (
                                        <button
                                            onClick={() => bulkDelete()}
                                            disabled={actionLoading === 'bulk-delete'}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Mover a Papelera ({selectedIds.length})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => loadData()}
                                        className="text-primary hover:text-primary-dark text-xs font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                                    </button>
                                    <ChevronDown onClick={() => setExpandedReservas(!expandedReservas)} className={`w-5 h-5 text-gray-700 transition-transform duration-500 ${expandedReservas ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            <div className={`transition-all duration-500 ease-in-out ${expandedReservas ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-wrap items-center gap-4">
                                    <div className="relative flex-1 min-w-[300px]">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, email o ID de reserva..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <select
                                        value={domoFilter}
                                        onChange={(e) => setDomoFilter(e.target.value)}
                                        title="Filtrar por domo"
                                        className={`px-4 py-2.5 rounded-xl text-sm bg-white border shadow-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${domoFilter ? 'border-primary text-primary font-bold' : 'border-gray-200 text-gray-700'}`}
                                    >
                                        <option value="">Todos los domos</option>
                                        {domos.map((d: any) => (
                                            <option key={d.id} value={d.id}>{d.nombre}</option>
                                        ))}
                                    </select>
                                    {view !== 'historial' && (
                                        <button
                                            onClick={() => { setSoloProximas(!soloProximas); setCurrentPage(1); }}
                                            title={soloProximas ? "Mostrar también reservas pasadas" : "Volver a mostrar solo actuales y futuras"}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${soloProximas
                                                ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                                                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                                        >
                                            {soloProximas ? "Solo próximas" : "Viendo todas (pasadas incluidas)"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setSoloPorEmitir(!soloPorEmitir); setCurrentPage(1); }}
                                        title="Mostrar solo las reservas a las que falta emitir boleta o factura"
                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap flex items-center gap-1.5 ${soloPorEmitir
                                            ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'}`}
                                    >
                                        <Receipt className="w-3.5 h-3.5" />
                                        Por emitir ({porEmitirCount})
                                    </button>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-700">
                                        Registros: {filteredReservas.length} / {baseReservas.length} {view === 'historial' ? "(pasadas)" : soloProximas ? "(actuales y futuras)" : "(todas)"}{totalPages > 1 ? ` · Página ${currentPage} de ${totalPages}` : ""}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-gray-700 uppercase text-[10px] font-black tracking-[0.2em]">
                                            <tr>
                                                <th className="px-3 md:px-8 py-3 md:py-5 w-[50px]">
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
                                                <th className="px-5 py-3 font-black whitespace-nowrap min-w-[240px]">Huésped / Referencia</th>
                                                <th className="px-4 py-3 font-black whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        Estancia
                                                        <div className="flex gap-2 items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                            <div className="flex flex-col">
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_inicio', order: 'asc' })}
                                                                    className={`p-0 -mb-1 ${sortConfig?.key === 'fecha_inicio' && sortConfig.order === 'asc' ? 'text-primary' : 'text-gray-600 hover:text-gray-700'}`}
                                                                    title="Ordenar por Entrada (Asc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5 rotate-180" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_inicio', order: 'desc' })}
                                                                    className={`p-0 ${sortConfig?.key === 'fecha_inicio' && sortConfig.order === 'desc' ? 'text-primary' : 'text-gray-600 hover:text-gray-700'}`}
                                                                    title="Ordenar por Entrada (Desc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                            <div className="w-[1px] h-3 bg-gray-200"></div>
                                                            <div className="flex flex-col">
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_fin', order: 'asc' })}
                                                                    className={`p-0 -mb-1 ${sortConfig?.key === 'fecha_fin' && sortConfig.order === 'asc' ? 'text-primary' : 'text-gray-600 hover:text-gray-700'}`}
                                                                    title="Ordenar por Salida (Asc)"
                                                                >
                                                                    <ChevronDown className="w-2.5 h-2.5 rotate-180" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => setSortConfig({ key: 'fecha_fin', order: 'desc' })}
                                                                    className={`p-0 ${sortConfig?.key === 'fecha_fin' && sortConfig.order === 'desc' ? 'text-primary' : 'text-gray-600 hover:text-gray-700'}`}
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
                                                <tr><td colSpan={8} className="px-8 py-20 text-center text-gray-700 font-bold italic">Sincronizando con base de datos...</td></tr>
                                            ) : paginatedReservas.length === 0 ? (
                                                <tr><td colSpan={8} className="px-8 py-20 text-center text-gray-700 font-bold italic">No se encontraron registros.</td></tr>
                                            ) : paginatedReservas.map((reserva) => {
                                                const clientName = reserva.estado === "bloqueado"
                                                    ? `Bloqueado${reserva.notas ? ` - ${reserva.notas}` : ""}`
                                                    : reserva.clientes?.nombre
                                                        ? `${reserva.clientes.nombre} ${reserva.clientes.apellido || ""}`
                                                        : `${reserva.nombre || "Sin nombre"} ${reserva.apellido || ""}`;

                                                const clientEmail = reserva.clientes?.email || reserva.email || "Email no registrado";
                                                const isVip = reserva.clientes?.vip_tier && reserva.clientes.vip_tier !== 'Standard';

                                                return (
                                                    <tr key={reserva.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(reserva.id) ? 'bg-primary/[0.03]' : ''}`}>
                                                        <td className="px-3 md:px-8 py-3 md:py-5">
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
                                                        <td className="px-4 py-4 min-w-[240px] max-w-[320px]">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <div className="font-extrabold text-gray-900 text-xs leading-none truncate" title={clientName.trim()}>{clientName}</div>
                                                                <span className="bg-gray-100/80 text-gray-900 text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">{reserva.adultos || 2}p</span>
                                                                {isVip && (
                                                                    <span className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.1em] shadow-sm">VIP</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-0 mb-1.5">
                                                                <div className="text-[10px] text-gray-700 font-medium leading-tight truncate" title={clientEmail}>{clientEmail}</div>
                                                                {(reserva.telefono || reserva.clientes?.telefono) && (
                                                                    <div className="text-[9px] text-primary font-black flex items-center gap-1 uppercase tracking-tight">
                                                                        {reserva.telefono || reserva.clientes?.telefono}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-tighter bg-primary/5 px-1 py-0.5 rounded">#{reserva.id.slice(0, 8).toUpperCase()}</span>
                                                                {faltaEmitir(reserva) && adminRole !== 'viewer' && (
                                                                    <button
                                                                        onClick={() => openEditReserva(reserva)}
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[8px] font-black uppercase tracking-tighter hover:bg-rose-200 transition-colors"
                                                                        title={`Falta emitir ${reserva.tipo_documento || 'boleta'} — abrir ficha para cargar el folio`}
                                                                    >
                                                                        <Receipt className="w-2.5 h-2.5" />
                                                                        Falta {reserva.tipo_documento || 'boleta'}
                                                                    </button>
                                                                )}
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
                                                                        className="text-[8px] font-black text-gray-700 hover:text-primary uppercase tracking-widest flex items-center gap-0.5 transition-colors"
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
                                                            {(() => {
                                                                const noches = Math.round((new Date(reserva.fecha_fin).getTime() - new Date(reserva.fecha_inicio).getTime()) / 86400000);
                                                                const extras = reserva.reserva_servicios || [];
                                                                const sumExtras = extras.reduce((s: number, e: any) => s + (Number(e.total) || 0), 0);
                                                                const pn = reserva.precio_noche
                                                                    ? Number(reserva.precio_noche)
                                                                    : noches > 0 ? Math.round((Number(reserva.total || 0) - sumExtras) / noches) : 0;
                                                                return (
                                                                    <div className="mt-2 space-y-0.5 text-[9px] text-gray-900 font-mono">
                                                                        {pn > 0 && (
                                                                            <div className="flex justify-between gap-3">
                                                                                <span className="text-gray-700">{noches}n × ${pn.toLocaleString('es-CL')}</span>
                                                                                <span className="font-bold text-gray-600">${(noches * pn).toLocaleString('es-CL')}</span>
                                                                            </div>
                                                                        )}
                                                                        {extras.map((s: any) => (
                                                                            <div key={s.id} className="flex justify-between gap-3">
                                                                                <span className="text-gray-700">+ {s.servicios?.nombre || 'Extra'}{s.cantidad > 1 ? ` ×${s.cantidad}` : ''}</span>
                                                                                <span className="font-bold text-gray-600">${(Number(s.total) || 0).toLocaleString('es-CL')}</span>
                                                                            </div>
                                                                        ))}
                                                                        <div className="flex justify-between gap-3 pt-1 border-t border-gray-100 font-black text-gray-700">
                                                                            <span>Total vendido</span>
                                                                            <span>${(Number(reserva.total) || 0).toLocaleString('es-CL')}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-gray-800 font-bold text-[11px] whitespace-nowrap">
                                                                {(() => { const [y, m, d] = reserva.fecha_inicio.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }); })()}
                                                                <span className="text-gray-600 mx-1">→</span>
                                                                {(() => { const [y, m, d] = reserva.fecha_fin.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }); })()}
                                                            </div>
                                                            <div className="text-[8px] text-gray-700 font-black uppercase tracking-widest mt-0.5">
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
                                                                    'bg-gray-100 text-gray-900 border-gray-200'
                                                                }`}>
                                                                    {reserva.fuente === 'web' && <Globe className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente === 'whatsapp' && <MessageCircle className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente === 'airbnb' && <Home className="w-2.5 h-2.5" />}
                                                                    {reserva.fuente === 'booking' && <CreditCard className="w-2.5 h-2.5" />}
                                                                    {getFuenteLabel(reserva.fuente)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {(() => {
                                                                const pagado = Number(reserva.monto_pagado) || 0;
                                                                const total = Number(reserva.total) || 0;
                                                                const saldo = total - pagado;
                                                                const estadoConSaldo = ['confirmado', 'pendiente', 'pending_transfer_confirmation'].includes(reserva.estado);
                                                                return (
                                                                    <>
                                                                        <div className={`font-black text-xs ${pagado >= total ? 'text-green-600' : 'text-gray-900'}`}>
                                                                            ${pagado.toLocaleString('es-CL')}
                                                                        </div>
                                                                        <div className="text-[8px] text-gray-700 font-black uppercase tracking-[0.05em] mt-0.5">
                                                                            / ${total.toLocaleString('es-CL')}
                                                                        </div>
                                                                        {saldo > 0 && estadoConSaldo && (
                                                                            <div className="mt-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[8px] font-black text-amber-700 uppercase tracking-tight whitespace-nowrap">
                                                                                Cobrar ${saldo.toLocaleString('es-CL')}
                                                                            </div>
                                                                        )}
                                                                        {reserva.estado === 'suspendido' && pagado > 0 && (
                                                                            <div className="mt-1 px-1.5 py-0.5 bg-orange-50 border border-orange-200 rounded text-[8px] font-black text-orange-700 uppercase tracking-tight whitespace-nowrap">
                                                                                Anticipo retenido ${pagado.toLocaleString('es-CL')}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-[0.1em] shadow-sm ${getStatusColor(reserva.estado)}`}>
                                                                {reserva.estado === 'pendiente_pago'
                                                                    ? (reserva.expires_at && new Date(reserva.expires_at) < new Date() ? 'Carrito expirado' : 'Check-out Web')
                                                                    : getStatusLabel(reserva.estado)}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <div className="flex justify-end items-center gap-1.5">
                                                                {(() => {
                                                                    const saldoR = (Number(reserva.total) || 0) - (Number(reserva.monto_pagado) || 0);
                                                                    return saldoR > 0 && ['pagado', 'confirmado', 'pendiente', 'pending_transfer_confirmation'].includes(reserva.estado) && adminRole !== 'viewer' && (
                                                                        <button
                                                                            onClick={() => abrirPago(reserva)}
                                                                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                                                                            title={`Registrar pago del saldo ($${saldoR.toLocaleString('es-CL')})`}
                                                                        >
                                                                            $ Saldo
                                                                        </button>
                                                                    );
                                                                })()}
                                                                 {reserva.estado !== 'pagado' && reserva.estado !== 'cancelada' && reserva.estado !== 'expirada' && reserva.estado !== 'bloqueado' && adminRole !== 'viewer' && (
                                                                    <button
                                                                        onClick={() => confirmReserva(reserva.id)}
                                                                        disabled={actionLoading === reserva.id}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                                                                        title="Confirmar pago manual de la reserva"
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
                                                                <button
                                                                    onClick={async () => {
                                                                        const { data: { session } } = await supabase.auth.getSession();
                                                                        const token = session?.access_token || '';
                                                                        window.open(`/api/admin/reservas/email-preview?id=${reserva.id}&token=${token}`, '_blank');
                                                                    }}
                                                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg transition-all border border-blue-100"
                                                                    title="Vista previa del correo (datos actuales)"
                                                                >
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const { data: { session } } = await supabase.auth.getSession();
                                                                        const token = session?.access_token || '';
                                                                        window.open(`/api/admin/reservas/correos?reserva_id=${reserva.id}&token=${token}`, '_blank');
                                                                    }}
                                                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all border border-emerald-100"
                                                                    title="Correos enviados (respaldo guardado)"
                                                                >
                                                                    <MailCheck className="w-3.5 h-3.5" />
                                                                </button>
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
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">
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
                                                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-700 hover:text-gray-600 hover:bg-gray-50 border border-gray-100'} ${typeof page !== 'number' ? 'cursor-default border-none' : ''}`}
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

                        {/* Modal: Registrar pago de saldo */}
                        {pagoReserva && (
                            <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !pagoLoading && setPagoReserva(null)}>
                                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-xl font-display font-black text-gray-900 mb-1">Registrar pago</h3>
                                    <p className="text-sm text-gray-900 mb-5">
                                        {`${pagoReserva.nombre || ''} ${pagoReserva.apellido || ''}`.trim()} · {pagoReserva.domos?.nombre || 'Domo'} · {formatFecha(pagoReserva.fecha_inicio)} → {formatFecha(pagoReserva.fecha_fin)}
                                    </p>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-3 gap-2 text-center">
                                        <div><p className="text-[9px] font-black text-gray-700 uppercase">Total</p><p className="font-bold text-sm">${(Number(pagoReserva.total) || 0).toLocaleString('es-CL')}</p></div>
                                        <div><p className="text-[9px] font-black text-gray-700 uppercase">Pagado</p><p className="font-bold text-sm text-green-600">${(Number(pagoReserva.monto_pagado) || 0).toLocaleString('es-CL')}</p></div>
                                        <div><p className="text-[9px] font-black text-gray-700 uppercase">Saldo</p><p className="font-black text-sm text-amber-600">${((Number(pagoReserva.total) || 0) - (Number(pagoReserva.monto_pagado) || 0)).toLocaleString('es-CL')}</p></div>
                                    </div>
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Monto recibido</label>
                                    <input
                                        type="number"
                                        value={pagoMonto}
                                        onChange={(e) => setPagoMonto(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold mb-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder="0"
                                        min={1}
                                    />
                                    <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Método de pago</label>
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        {[['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['webpay', 'Webpay/Tarjeta'], ['otro', 'Otro']].map(([val, label]) => (
                                            <button
                                                key={val}
                                                onClick={() => setPagoMetodo(val)}
                                                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${pagoMetodo === val ? 'bg-primary text-white border-primary shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setPagoReserva(null)}
                                            disabled={pagoLoading}
                                            className="flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={registrarPago}
                                            disabled={pagoLoading}
                                            className="flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                        >
                                            {pagoLoading ? 'Registrando…' : 'Registrar pago'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
