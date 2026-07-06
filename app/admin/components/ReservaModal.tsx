"use client";

import { adminFetch } from "@/lib/admin-fetch";
import { useState, useEffect, useMemo } from "react";
import { X, Upload, FileText, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Domo {
    id: string;
    nombre: string;
}

interface Servicio {
    id: string;
    nombre: string;
    precio: number;
    activo: boolean;
    multiplicador_noches: boolean;
    multiplicador_personas: boolean;
}

interface Reserva {
    id?: string;
    fecha_inicio: string;
    fecha_fin: string;
    domo_id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    adultos: number;
    total: number;
    monto_pagado?: number;
    estado: string;
    fuente?: string;
    mensaje?: string;
    comprobante_url?: string;
    rut?: string;
    enviar_confirmacion?: boolean;
    acompanantes?: string;
    tipo_documento?: string;
    metodo_pago?: string;
    folio_dte?: string;
    sincronizar_calendario?: boolean;
}

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    domos: Domo[];
    reservaToEdit?: any | null;
    adminEmail: string | null;
    adminRole: string | null;
}

function downloadICS(
    fechaInicio: string,
    fechaFin: string,
    nombre: string,
    apellido: string,
    domoId: string,
    domos: Domo[],
    extrasNombres: string[]
): void {
    const domoNombre = domos.find((d) => d.id === domoId)?.nombre || "Domo";
    const icsDate = (d: string) => d.replace(/-/g, "");
    const extrasLine = extrasNombres.length > 0
        ? `\\nExtras: ${extrasNombres.join(", ")}`
        : "";
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//TreePod Glamping//Admin//ES",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `DTSTART;VALUE=DATE:${icsDate(fechaInicio)}`,
        `DTEND;VALUE=DATE:${icsDate(fechaFin)}`,
        `SUMMARY:Reserva ${domoNombre} - ${nombre} ${apellido}`.trim(),
        `DESCRIPTION:Huésped: ${nombre} ${apellido}\\nDomo: ${domoNombre}\\nUbicación: Valle Las Trancas\\, Km 72${extrasLine}`,
        `LOCATION:Valle Las Trancas\\, Km 72\\, Región del Ñuble\\, Chile`,
        `UID:treepod-${Date.now()}@domostreepod.cl`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reserva-${domoNombre}-${nombre}.ics`.replace(/\s+/g, "-");
    document.body.appendChild(a);
    a.click();

    // Verificar que el elemento aún existe antes de remover
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
    URL.revokeObjectURL(url);
}

export default function ReservaModal({ isOpen, onClose, onSave, domos, reservaToEdit, adminEmail, adminRole }: ReservaModalProps) {
    const isViewer = adminRole === 'viewer';
    const [formData, setFormData] = useState<Reserva>({
        fecha_inicio: "",
        fecha_fin: "",
        domo_id: "",
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        adultos: 2,
        total: 0,
        monto_pagado: 0,
        estado: "pagado",
        fuente: "manual_admin",
        mensaje: "",
        comprobante_url: "",
        rut: "",
        enviar_confirmacion: true,
        acompanantes: "",
        tipo_documento: "boleta",
        metodo_pago: "",
        folio_dte: "",
        sincronizar_calendario: true
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<Servicio[]>([]);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
    const [serviciosCortesia, setServiciosCortesia] = useState<string[]>([]);
    const [nochesPorServicio, setNochesPorServicio] = useState<Record<string, number>>({});
    const [preciosPorServicio, setPreciosPorServicio] = useState<Record<string, number>>({});
    const [loadingServicios, setLoadingServicios] = useState(false);
    const [savedReservaData, setSavedReservaData] = useState<{ id: string; nombre: string; domoId: string } | null>(null);
    const [tarifaSugerida, setTarifaSugerida] = useState<{ precio_noche: number; total_hospedaje: number; temporada: string; es_fallback: boolean } | null>(null);
    // Salidas (= aseos) ya programadas para la fecha de ENTRADA de esta reserva.
    // Si hay 2 o más, por capacidad de aseo el ingreso debería ser desde las 18:00 (requiere tu aprobación).
    const [aseosDia, setAseosDia] = useState<{ aseos: number; salidas: { cliente: string; domo: string }[] }>({ aseos: 0, salidas: [] });
    // Valor del alojamiento (sin extras). El total = baseAlojamiento + extras de servicios,
    // se recalcula en vivo. El backend persiste ese total ya con los extras incluidos.
    const [baseAlojamiento, setBaseAlojamiento] = useState(0);
    const [buscandoTarifa, setBuscandoTarifa] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSavedReservaData(null);

            if (reservaToEdit) {
                setFormData({
                    id: reservaToEdit.id,
                    fecha_inicio: reservaToEdit.fecha_inicio || "",
                    fecha_fin: reservaToEdit.fecha_fin || "",
                    domo_id: reservaToEdit.domo_id || "",
                    nombre: reservaToEdit.nombre || reservaToEdit.clientes?.nombre || "",
                    apellido: reservaToEdit.apellido || reservaToEdit.clientes?.apellido || "",
                    email: reservaToEdit.email || reservaToEdit.clientes?.email || "",
                    telefono: reservaToEdit.telefono || reservaToEdit.clientes?.telefono || "",
                    adultos: reservaToEdit.adultos || 2,
                    total: reservaToEdit.total || 0,
                    monto_pagado: reservaToEdit.monto_pagado || 0,
                    estado: reservaToEdit.estado || "pendiente",
                    fuente: reservaToEdit.fuente || "manual_admin",
                    mensaje: reservaToEdit.notas || reservaToEdit.mensaje || "",
                    comprobante_url: reservaToEdit.comprobante_url || "",
                    rut: reservaToEdit.rut || reservaToEdit.clientes?.rut || "",
                    enviar_confirmacion: reservaToEdit.enviar_confirmacion ?? true,
                    acompanantes: reservaToEdit.acompanantes || "",
                    tipo_documento: reservaToEdit.tipo_documento || "boleta",
                    metodo_pago: reservaToEdit.metodo_pago || reservaToEdit.metodo_pago_inicial || "",
                    folio_dte: reservaToEdit.metadata?.folio_dte ?? reservaToEdit.metadata?.folio ?? "",
                    sincronizar_calendario: reservaToEdit.sincronizar_calendario ?? true
                });
                // Base de alojamiento = total guardado menos los extras ya cobrados.
                // Así el total vuelve a armarse como alojamiento + extras al recalcular en vivo.
                const extrasPersistidos = Array.isArray(reservaToEdit.reserva_servicios)
                    ? reservaToEdit.reserva_servicios.reduce((acc: number, rs: any) =>
                        acc + (rs.es_cortesia ? 0 : (Number(rs.total) || (Number(rs.precio_unitario) || 0) * (Number(rs.cantidad) || 1))), 0)
                    : 0;
                setBaseAlojamiento(Math.max(0, (Number(reservaToEdit.total) || 0) - extrasPersistidos));
            } else {
                setFormData({
                    fecha_inicio: new Date().toISOString().split('T')[0],
                    fecha_fin: "",
                    domo_id: domos[0]?.id || "",
                    nombre: "",
                    apellido: "",
                    email: "",
                    telefono: "",
                    adultos: 2,
                    total: 0,
                    monto_pagado: 0,
                    estado: "pagado",
                    fuente: "manual_admin",
                    mensaje: "",
                    comprobante_url: "",
                    rut: "",
                    enviar_confirmacion: true,
                    acompanantes: "",
                    tipo_documento: "boleta",
                    metodo_pago: "",
                    folio_dte: "",
                    sincronizar_calendario: true
                });
                setServiciosSeleccionados([]);
                setServiciosCortesia([]);
                setBaseAlojamiento(0);
            }

            // Cargar servicios disponibles
            setLoadingServicios(true);
            fetch("/api/admin/servicios")
                .then((r) => r.json())
                .then((data) => {
                    const activos = (data.servicios || []).filter((s: Servicio) => s.activo);
                    setServiciosDisponibles(activos);
                })
                .catch(() => setServiciosDisponibles([]))
                .finally(() => setLoadingServicios(false));

            // Pre-seleccionar servicios ya asignados en edición (desde datos del API, sin Supabase anon)
            if (reservaToEdit?.reserva_servicios && Array.isArray(reservaToEdit.reserva_servicios)) {
                const ids = reservaToEdit.reserva_servicios
                    .map((rs: any) => rs.servicios?.id || rs.servicio_id)
                    .filter(Boolean);
                setServiciosSeleccionados(ids);
                const cortesiaIds = reservaToEdit.reserva_servicios
                    .filter((rs: any) => rs.es_cortesia)
                    .map((rs: any) => rs.servicios?.id || rs.servicio_id)
                    .filter(Boolean);
                setServiciosCortesia(cortesiaIds);
                // Recuperar noches guardadas por servicio (para cena con noches parciales)
                const nochesMap: Record<string, number> = {};
                const preciosMap: Record<string, number> = {};
                reservaToEdit.reserva_servicios.forEach((rs: any) => {
                    const sid = rs.servicios?.id || rs.servicio_id;
                    if (sid && rs.cantidad && rs.cantidad > 1) nochesMap[sid] = rs.cantidad;
                    if (sid && rs.precio_unitario) preciosMap[sid] = rs.precio_unitario;
                });
                setNochesPorServicio(nochesMap);
                setPreciosPorServicio(preciosMap);
            } else {
                setServiciosCortesia([]);
                setNochesPorServicio({});
            }
        }
    }, [isOpen, reservaToEdit, domos]);

    // Buscar tarifa sugerida cuando cambia adultos, fecha_inicio o fecha_fin
    useEffect(() => {
        if (!isOpen) { setTarifaSugerida(null); return; }
        const { fecha_inicio, fecha_fin, adultos } = formData;
        if (!fecha_inicio || !fecha_fin || !adultos) { setTarifaSugerida(null); return; }

        const noches = Math.round(
            (new Date(fecha_fin).getTime() - new Date(fecha_inicio).getTime()) / 86400000
        );
        if (noches <= 0) { setTarifaSugerida(null); return; }

        const timer = setTimeout(async () => {
            setBuscandoTarifa(true);
            try {
                const res = await adminFetch(
                    `/api/admin/tarifas/buscar?fecha=${fecha_inicio}&noches=${noches}&adultos=${adultos}`
                );
                const data = await res.json();
                if (data.encontrado) {
                    setTarifaSugerida({
                        precio_noche: data.precio_noche,
                        total_hospedaje: data.total_hospedaje,
                        temporada: data.temporada,
                        es_fallback: data.es_fallback,
                    });
                } else {
                    setTarifaSugerida(null);
                }
            } catch {
                setTarifaSugerida(null);
            } finally {
                setBuscandoTarifa(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [formData.adultos, formData.fecha_inicio, formData.fecha_fin, isOpen]);

    // Noches de la estadía (mín. 1) según las fechas seleccionadas.
    const nochesEstadia = useMemo(() => {
        if (!formData.fecha_inicio || !formData.fecha_fin) return 1;
        return Math.max(1, Math.round(
            (new Date(formData.fecha_fin).getTime() - new Date(formData.fecha_inicio).getTime()) / 86400000
        ));
    }, [formData.fecha_inicio, formData.fecha_fin]);

    // Suma de los servicios seleccionados (las cortesías valen $0). Misma lógica que el backend.
    const sumExtras = useMemo(() => {
        const adultos = Number(formData.adultos) || 2;
        return serviciosSeleccionados.reduce((acc, id) => {
            const serv = serviciosDisponibles.find((s) => s.id === id);
            if (!serv || serviciosCortesia.includes(id)) return acc;
            const esCena = serv.nombre.toLowerCase().includes("cena") || serv.nombre.toLowerCase().includes("romántico") || serv.nombre.toLowerCase().includes("almuerzo");
            const nochesEste = esCena ? (nochesPorServicio[id] ?? 1) : nochesEstadia;
            const cantidad = (serv.multiplicador_noches ? nochesEste : 1) * (serv.multiplicador_personas ? adultos : 1);
            const precio = preciosPorServicio[id] ?? serv.precio;
            return acc + precio * cantidad;
        }, 0);
    }, [serviciosSeleccionados, serviciosCortesia, nochesPorServicio, preciosPorServicio, serviciosDisponibles, formData.adultos, nochesEstadia]);

    // Total a pagar = alojamiento + extras. Se mantiene sincronizado en formData.total
    // para que se muestre y se guarde correctamente al agregar/quitar servicios.
    useEffect(() => {
        const nuevoTotal = Math.max(0, Math.round(baseAlojamiento + sumExtras));
        setFormData((prev) => (prev.total === nuevoTotal ? prev : { ...prev, total: nuevoTotal }));
    }, [baseAlojamiento, sumExtras]);

    // Cuenta las salidas (aseos) programadas para la fecha de entrada de esta reserva.
    useEffect(() => {
        if (!isOpen || !formData.fecha_inicio) { setAseosDia({ aseos: 0, salidas: [] }); return; }
        let cancelado = false;
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ fecha: formData.fecha_inicio });
                if (formData.id) params.set("excluir", formData.id);
                const res = await adminFetch(`/api/admin/reservas/aseos-dia?${params.toString()}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelado) setAseosDia({ aseos: data.aseos || 0, salidas: data.salidas || [] });
            } catch { /* sin bloquear la ficha */ }
        }, 400);
        return () => { cancelado = true; clearTimeout(timer); };
    }, [formData.fecha_inicio, formData.id, isOpen]);

    // Auto-completar datos si el cliente ya existe (CRM Lookup)
    useEffect(() => {
        if (!isOpen || reservaToEdit || !formData.email || formData.email.length < 5 || !formData.email.includes('@')) return;

        const timer = setTimeout(async () => {
            const res = await adminFetch(`/api/admin/clientes?email=${encodeURIComponent(formData.email)}`);
            if (!res.ok) return;
            const { cliente: client } = await res.json();

            if (client) {
                setFormData(prev => ({
                    ...prev,
                    nombre: prev.nombre || client.nombre || "",
                    apellido: prev.apellido || client.apellido || "",
                    telefono: prev.telefono || client.telefono || "",
                    rut: prev.rut || client.rut || ""
                }));
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [formData.email, isOpen, reservaToEdit]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `reservas/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('comprobantes')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('comprobantes')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, comprobante_url: publicUrl }));
            alert("Archivo cargado correctamente");
        } catch (error: any) {
            console.error('Error uploading:', error);
            alert("Error al cargar archivo: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const toggleServicio = (id: string) => {
        setServiciosSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
        // Si se deselecciona, quitar también de cortesía
        setServiciosCortesia((prev) => prev.filter((s) => s !== id));
    };

    const toggleCortesia = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setServiciosCortesia((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Aviso de capacidad de aseo: si el día de entrada ya tiene 2+ salidas (aseos),
        // requiere tu aprobación explícita antes de guardar (ingreso sugerido desde 18:00).
        if (!isViewer && aseosDia.aseos >= 2) {
            const ok = window.confirm(
                `Este día tiene ${aseosDia.aseos} salidas (aseos) programadas.\n\n` +
                `Por capacidad de aseo, el ingreso de esta reserva debería ser DESDE LAS 18:00 hrs.\n\n` +
                `¿Apruebas la reserva con esta condición?`
            );
            if (!ok) return;
        }

        setLoading(true);

        try {
            const res = await adminFetch("/api/admin/reservas/guardar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, adminEmail, servicios_seleccionados: serviciosSeleccionados, servicios_cortesia: serviciosCortesia, noches_por_servicio: nochesPorServicio, precios_por_servicio: preciosPorServicio }),
            });
            const data = await res.json();

            if (res.ok) {
                const isNew = !reservaToEdit;
                if (isNew) {
                    setSavedReservaData({
                        id: data.data?.id || "",
                        nombre: `${formData.nombre} ${formData.apellido}`.trim(),
                        domoId: formData.domo_id,
                    });
                    onSave();
                } else {
                    onSave();
                    onClose();
                }
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleCalendarClose = () => {
        setSavedReservaData(null);
        onClose();
    };

    const aplicarTarifa = () => {
        if (!tarifaSugerida) return;
        // El total se arma solo (alojamiento + extras) vía el efecto de sincronización.
        setBaseAlojamiento(tarifaSugerida.total_hospedaje);
    };

    const inputClasses = `w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`;
    const selectClasses = `w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary transition-all outline-none appearance-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in my-8 border border-gray-100">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h3 className="font-display font-black text-2xl text-gray-900 leading-tight">
                            {reservaToEdit ? "Editar Ficha de Reserva" : "Nueva Reserva Manual"}
                        </h3>
                        {formData.id && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em]">Código Asignado:</span>
                                <span className="px-3 py-1 bg-primary text-white rounded-lg font-mono text-xs font-black shadow-md shadow-primary/20">
                                    #{formData.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        )}
                        {!formData.id && (
                            <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] mt-1">Gestión administrativa interna</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 bg-white text-gray-700 hover:text-red-500 rounded-xl shadow-sm transition-all active:scale-90 border border-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Sección: Fechas y Lugar */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Estancia</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Fecha Entrada</label>
                                <input
                                    type="date"
                                    required
                                    readOnly={isViewer}
                                    value={formData.fecha_inicio}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Fecha Salida</label>
                                <input
                                    type="date"
                                    required
                                    readOnly={isViewer}
                                    value={formData.fecha_fin}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Domo Asignado</label>
                                <select
                                    required
                                    disabled={isViewer}
                                    value={formData.domo_id}
                                    onChange={(e) => setFormData({ ...formData, domo_id: e.target.value })}
                                    className={selectClasses}
                                >
                                    <option value="" disabled>Seleccione...</option>
                                    {domos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {aseosDia.aseos >= 2 && (
                            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                                <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Atención · Capacidad de aseo</p>
                                <p className="text-sm font-bold text-amber-900 mt-1">
                                    Este día ya tiene <span className="text-base">{aseosDia.aseos}</span> salidas (aseos) programadas. Por capacidad de aseo,
                                    el ingreso de esta reserva debería ser <span className="underline">desde las 18:00 hrs</span>.
                                </p>
                                <p className="text-[11px] font-bold text-amber-700 mt-1.5">Verifica y aprueba al guardar. Salidas del día: {aseosDia.salidas.map(s => `${s.cliente}${s.domo ? ` (${s.domo})` : ""}`).join(" · ")}</p>
                            </div>
                        )}
                    </div>

                    {/* Sección: Huésped */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Huésped</h4>
                            </div>
                            {formData.id && (
                                <div className="px-3 py-1 bg-gray-900 text-white rounded-lg font-mono text-[10px] font-black flex items-center gap-2">
                                    <span className="opacity-50 text-[8px]">ID:</span> #{formData.id.slice(0, 8).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    readOnly={isViewer}
                                    className={inputClasses}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Apellido</label>
                                <input
                                    type="text"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    readOnly={isViewer}
                                    className={inputClasses}
                                    placeholder="Apellido"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    readOnly={isViewer}
                                    className={inputClasses}
                                    placeholder="huésped@correo.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    readOnly={isViewer}
                                    className={inputClasses}
                                    placeholder="+56 9 ..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">RUT / Identificación</label>
                                <input
                                    type="text"
                                    value={formData.rut || ''}
                                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                    readOnly={isViewer}
                                    className={inputClasses}
                                    placeholder="12.345.678-9"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Detalles y Origen */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Configuración y Origen</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">N° Personas (Adultos)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.adultos}
                                    onChange={(e) => setFormData({ ...formData, adultos: Number(e.target.value) })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Plataforma / Fuente</label>
                                <select
                                    required
                                    value={formData.fuente}
                                    onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}
                                    disabled={isViewer}
                                    className={selectClasses}
                                >
                                    <option value="web">Web (Directo)</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="airbnb">Airbnb</option>
                                    <option value="booking">Booking.com</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="manual_admin">Manual Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Estado Reserva</label>
                                <select
                                    required
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    disabled={isViewer}
                                    className={selectClasses}
                                >
                                    <option value="pagado">Pagado Total</option>
                                    <option value="confirmado">Confirmada (Ocupado)</option>
                                    <option value="pendiente_pago">Abono Pendiente</option>
                                    <option value="pendiente">Manual Pendiente</option>
                                    <option value="suspendido">Suspendido (Retomará)</option>
                                    <option value="cancelada">Cancelada / Baja</option>
                                    <option value="bloqueado">Bloqueo Técnico</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Finanzas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Finanzas</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Alojamiento ($)</label>
                                <input
                                    type="number"
                                    value={baseAlojamiento || ''}
                                    onChange={(e) => setBaseAlojamiento(isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
                                    readOnly={isViewer}
                                    className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    placeholder="0"
                                />
                                <p className="text-[9px] text-gray-500 font-bold pl-1">Solo el valor del domo. Los servicios se suman abajo.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-green-600 uppercase tracking-widest pl-1">Monto Pagado ($)</label>
                                <input
                                    type="number"
                                    value={formData.monto_pagado || ''}
                                    onChange={(e) => setFormData({ ...formData, monto_pagado: isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber })}
                                    readOnly={isViewer}
                                    className={`w-full p-3.5 bg-green-50/50 border border-green-100 rounded-2xl text-sm font-black text-green-700 transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Resumen: total a pagar y saldo, se recalcula al agregar/quitar servicios */}
                        {(() => {
                            const total = Number(formData.total) || 0;
                            const pagado = Number(formData.monto_pagado) || 0;
                            const saldo = total - pagado;
                            return (
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                        <span>Alojamiento</span>
                                        <span>${(Number(baseAlojamiento) || 0).toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                        <span>Servicios adicionales</span>
                                        <span>${Math.round(sumExtras).toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                                        <span className="uppercase tracking-widest text-[11px]">Total a pagar</span>
                                        <span>${total.toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-black">
                                        <span className="uppercase tracking-widest text-[10px] text-gray-600">Saldo por cobrar</span>
                                        <span className={saldo > 0 ? 'text-amber-700' : 'text-green-700'}>
                                            ${saldo.toLocaleString('es-CL')}{saldo <= 0 ? ' · pagado' : ''}
                                        </span>
                                    </div>
                                    {formData.estado === 'suspendido' && pagado > 0 && (
                                        <div className="flex items-center justify-between text-xs font-black pt-2 border-t border-orange-200">
                                            <span className="uppercase tracking-widest text-[10px] text-orange-700">Anticipo retenido (a favor)</span>
                                            <span className="text-orange-700">${pagado.toLocaleString('es-CL')}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Sección: Servicios Adicionales */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Servicios Adicionales</h4>
                        </div>
                        {loadingServicios ? (
                            <div className="flex items-center gap-2 py-3 text-gray-700">
                                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span className="text-xs font-bold">Cargando servicios...</span>
                            </div>
                        ) : serviciosDisponibles.length === 0 ? (
                            <p className="text-xs text-gray-700 font-bold py-2">No hay servicios adicionales disponibles.</p>
                        ) : (
                            (() => {
                                const noches = formData.fecha_inicio && formData.fecha_fin
                                    ? Math.max(1, Math.round((new Date(formData.fecha_fin).getTime() - new Date(formData.fecha_inicio).getTime()) / 86400000))
                                    : 1;
                                const adultos = Number(formData.adultos) || 2;
                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {serviciosDisponibles.map((servicio) => {
                                            const selected = serviciosSeleccionados.includes(servicio.id);
                                            const esCortesia = serviciosCortesia.includes(servicio.id);
                                            const esCena = servicio.nombre.toLowerCase().includes("cena") || servicio.nombre.toLowerCase().includes("romántico") || servicio.nombre.toLowerCase().includes("almuerzo");
                                            // Noches a usar: cena usa selector, el resto siempre todas las noches
                                            const nochesEste = esCena
                                                ? (nochesPorServicio[servicio.id] ?? 1)
                                                : noches;
                                            const cantidad = (servicio.multiplicador_noches ? nochesEste : 1)
                                                           * (servicio.multiplicador_personas ? adultos : 1);
                                            // Precio: usa override si existe, si no el precio base del servicio
                                            const precioEfectivo = preciosPorServicio[servicio.id] ?? servicio.precio;
                                            const subtotal = esCortesia ? 0 : precioEfectivo * cantidad;
                                            const etiqueta = (() => {
                                                const partes = [];
                                                if (servicio.multiplicador_noches) partes.push(`${nochesEste}n`);
                                                if (servicio.multiplicador_personas) partes.push(`${adultos}p`);
                                                return partes.length ? partes.join(" × ") : "fijo";
                                            })();
                                            return (
                                                <div key={servicio.id} className="flex flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        disabled={isViewer}
                                                        onClick={() => toggleServicio(servicio.id)}
                                                        className={`rounded-2xl p-4 text-left transition-all border-2 w-full ${
                                                            selected && esCortesia
                                                                ? "bg-amber-50 border-amber-400 shadow-sm shadow-amber-100"
                                                                : selected
                                                                ? "bg-primary/5 border-primary shadow-sm shadow-primary/10"
                                                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                        } ${isViewer ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className={`text-xs font-black leading-tight ${
                                                                selected && esCortesia ? "text-amber-700" : selected ? "text-primary" : "text-gray-700"
                                                            }`}>
                                                                {servicio.nombre}
                                                            </span>
                                                            <div className={`w-4 h-4 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                                                                selected && esCortesia ? "bg-amber-400 border-amber-400" :
                                                                selected ? "bg-primary border-primary" : "border-gray-300"
                                                            }`}>
                                                                {selected && (
                                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            {esCortesia ? (
                                                                <>
                                                                    <span className="text-[10px] font-black text-amber-600 line-through">${subtotal.toLocaleString('es-CL')}</span>
                                                                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">CORTESÍA</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className={`text-[10px] font-black ${selected ? "text-primary" : "text-gray-700"}`}>
                                                                        ${precioEfectivo.toLocaleString('es-CL')} × {etiqueta}
                                                                    </span>
                                                                    {selected && cantidad > 1 && (
                                                                        <span className="text-[10px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">
                                                                            = ${subtotal.toLocaleString('es-CL')}
                                                                        </span>
                                                                    )}
                                                                    {selected && preciosPorServicio[servicio.id] !== undefined && preciosPorServicio[servicio.id] !== servicio.precio && (
                                                                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">ajustado</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </button>
                                                    {/* Editor de precio por servicio */}
                                                    {selected && !esCortesia && !isViewer && (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex-shrink-0">Precio:</span>
                                                            <span className="text-[10px] text-gray-700">$</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1000"
                                                                value={preciosPorServicio[servicio.id] ?? servicio.precio}
                                                                onChange={e => setPreciosPorServicio(p => ({ ...p, [servicio.id]: Number(e.target.value) }))}
                                                                className="flex-1 min-w-0 text-xs font-black text-primary bg-white border border-gray-200 rounded-lg px-2 py-1 focus:border-primary outline-none"
                                                            />
                                                            {preciosPorServicio[servicio.id] !== undefined && preciosPorServicio[servicio.id] !== servicio.precio && (
                                                                <button type="button"
                                                                    onClick={() => setPreciosPorServicio(p => { const n = { ...p }; delete n[servicio.id]; return n; })}
                                                                    className="text-[9px] text-gray-700 hover:text-gray-600 whitespace-nowrap font-bold"
                                                                >reset</button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Selector de noches para cena (puede ser parcial) */}
                                                    {selected && esCena && !esCortesia && !isViewer && (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Noches:</span>
                                                            <div className="flex items-center gap-1">
                                                                <button type="button"
                                                                    onClick={() => setNochesPorServicio(p => ({ ...p, [servicio.id]: Math.max(1, (p[servicio.id] ?? 1) - 1) }))}
                                                                    className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 font-black text-xs flex items-center justify-center"
                                                                >−</button>
                                                                <span className="text-xs font-black text-primary w-4 text-center">{nochesPorServicio[servicio.id] ?? 1}</span>
                                                                <button type="button"
                                                                    onClick={() => setNochesPorServicio(p => ({ ...p, [servicio.id]: Math.min(noches, (p[servicio.id] ?? 1) + 1) }))}
                                                                    className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 font-black text-xs flex items-center justify-center"
                                                                >+</button>
                                                            </div>
                                                            <span className="text-[10px] text-gray-700 font-bold">de {noches}</span>
                                                        </div>
                                                    )}
                                                    {selected && !isViewer && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => toggleCortesia(e, servicio.id)}
                                                            className={`text-[10px] font-black uppercase tracking-widest py-1.5 rounded-xl transition-all ${
                                                                esCortesia
                                                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-600"
                                                            }`}
                                                        >
                                                            {esCortesia ? "Cortesia (quitar)" : "Marcar como cortesia"}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    {/* Sección: Notas Detalle */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Detalle de Reserva</h4>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Notas / Mensaje del Cliente</label>
                            <textarea
                                value={formData.mensaje}
                                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                readOnly={isViewer}
                                className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium transition-all outline-none min-h-[100px] resize-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                placeholder="Indique aquí detalles especiales, abonos parciales o requerimientos..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-green-600 uppercase tracking-widest pl-1 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Link Boleta / Comprobante (Google Drive / PDF)
                                </span>
                                {formData.comprobante_url && (
                                    <a href={formData.comprobante_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline lowercase">
                                        ver actual <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                )}
                            </label>

                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="url"
                                        value={formData.comprobante_url || ''}
                                        onChange={(e) => setFormData({ ...formData, comprobante_url: e.target.value })}
                                        readOnly={isViewer}
                                        className={`w-full pl-3.5 pr-20 py-3.5 bg-green-50/20 border border-green-100 rounded-2xl text-[11px] font-bold placeholder:text-gray-600 focus:bg-white transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        placeholder="https://drive.google.com/file/d/..."
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {formData.comprobante_url && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, comprobante_url: "" })}
                                                className="p-1 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-lg transition-all"
                                                title="Borrar link"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <FileText className="w-4 h-4 text-gray-200" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`flex items-center gap-2 px-4 py-3.5 bg-white border-2 border-dashed border-green-200 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-green-50 transition-all ${uploading || isViewer ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        {uploading ? "Subiendo..." : "Subir del Disco"}
                                    </label>
                                </div>
                            </div>

                            <p className="text-[9px] text-gray-700 font-bold italic pl-1 italic">
                                Puedes pegar un link de Google Drive directamente o subir un archivo (PDF/IMG) desde tu dispositivo.
                            </p>
                        </div>
                    </div>

                    {/* Sección: Configuraciones Adicionales */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Configuraciones Administrativas</h4>
                        </div>

                        {/* Tipo de Documento */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Tipo de Documento</label>
                            <select
                                value={formData.tipo_documento}
                                onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                                disabled={isViewer}
                                className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <option value="boleta">Boleta</option>
                                <option value="factura">Factura</option>
                            </select>
                        </div>

                        {/* Medio de Pago */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Medio de Pago</label>
                            <select
                                value={formData.metodo_pago || ""}
                                onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                                disabled={isViewer}
                                className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Sin especificar</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="webpay">Webpay / Transbank</option>
                                <option value="airbnb">Airbnb</option>
                                <option value="otro">Otro</option>
                            </select>
                            <p className="text-[9px] text-gray-500 font-bold pl-1">Cómo pagó el cliente. Necesario para saber a quién emitir boleta/factura.</p>
                        </div>

                        {/* Folio Boleta / Factura (DTE) */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">
                                Folio {formData.tipo_documento === "factura" ? "Factura" : "Boleta"}
                                {formData.folio_dte && formData.folio_dte.trim() !== "" && (
                                    <span className="ml-2 text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded normal-case tracking-normal">Documento emitido</span>
                                )}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.folio_dte || ""}
                                onChange={(e) => setFormData({ ...formData, folio_dte: e.target.value })}
                                readOnly={isViewer}
                                placeholder="N° de folio del documento emitido"
                                className={`w-full p-4 bg-gray-50 border rounded-[2rem] text-sm font-bold transition-all outline-none ${formData.folio_dte && formData.folio_dte.trim() !== "" ? "border-emerald-200 bg-emerald-50/40 text-emerald-800" : "border-gray-100"} ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                            <p className="text-[9px] text-gray-500 font-bold pl-1">Escribe el folio al emitir el documento. Al guardarlo, la reserva pasa de &quot;Por emitir&quot; a &quot;Emitidas&quot; en el dashboard.</p>
                        </div>

                        {/* Campo de Acompañantes */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest pl-1">Datos de Acompañantes</label>
                            <textarea
                                value={formData.acompanantes}
                                onChange={(e) => setFormData({ ...formData, acompanantes: e.target.value })}
                                readOnly={isViewer}
                                className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium transition-all outline-none min-h-[80px] resize-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                placeholder="Nombres de acompañantes, edades, observaciones especiales..."
                            />
                        </div>

                        {/* Checkboxes de configuración */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <input
                                    type="checkbox"
                                    id="enviar_confirmacion"
                                    checked={formData.enviar_confirmacion}
                                    onChange={(e) => setFormData({ ...formData, enviar_confirmacion: e.target.checked })}
                                    disabled={isViewer}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="enviar_confirmacion" className="text-xs font-bold text-gray-700 cursor-pointer">
                                    Enviar confirmación al cliente
                                </label>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                <input
                                    type="checkbox"
                                    id="sincronizar_calendario"
                                    checked={formData.sincronizar_calendario}
                                    onChange={(e) => setFormData({ ...formData, sincronizar_calendario: e.target.checked })}
                                    disabled={isViewer}
                                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <label htmlFor="sincronizar_calendario" className="text-xs font-bold text-gray-700 cursor-pointer">
                                    Sincronizar con Google Calendar
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Paso post-guardado: agregar al calendario (solo nuevas reservas) */}
                    {savedReservaData ? (
                        <div className="pt-4 rounded-2xl bg-gray-50 border border-gray-100 p-6 space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Reserva creada</p>
                                <h4 className="font-black text-gray-900 text-lg leading-tight">
                                    ¿Agregar esta reserva a tu calendario?
                                </h4>
                                <p className="text-xs text-gray-700 font-bold mt-1">
                                    Descarga el archivo .ics para abrirlo en Apple Calendar, Outlook u otro.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        downloadICS(
                                            formData.fecha_inicio,
                                            formData.fecha_fin,
                                            formData.nombre,
                                            formData.apellido,
                                            formData.domo_id,
                                            domos,
                                            serviciosDisponibles
                                                .filter(s => serviciosSeleccionados.includes(s.id))
                                                .map(s => s.nombre)
                                        );
                                        handleCalendarClose();
                                    }}
                                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Descargar para Calendario
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCalendarClose}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                                >
                                    No, cerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                            >
                                Descartar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || isViewer}
                                className="flex-3 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? "Sincronizando..." : isViewer ? "Vista de Solo Lectura" : reservaToEdit ? "Actualizar Registro" : "Crear Reserva"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
