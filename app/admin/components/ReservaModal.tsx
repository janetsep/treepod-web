"use client";

import { useState, useEffect } from "react";
import { X, Upload, FileText, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Domo {
    id: string;
    nombre: string;
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
        comprobante_url: ""
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
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
                    comprobante_url: reservaToEdit.comprobante_url || ""
                });
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
                    comprobante_url: ""
                });
            }
        }
    }, [isOpen, reservaToEdit, domos]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/reservas/guardar", {
                method: "POST",
                body: JSON.stringify({ ...formData, adminEmail }),
            });
            const data = await res.json();

            if (res.ok) {
                onSave();
                onClose();
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = `w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`;
    const selectClasses = `w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary transition-all outline-none appearance-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in my-8 border border-gray-100">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h3 className="font-display font-black text-2xl text-gray-900 leading-tight">
                            {reservaToEdit ? "Editar Ficha de Reserva" : "Nueva Reserva Manual"}
                        </h3>
                        {formData.id && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Código Asignado:</span>
                                <span className="px-3 py-1 bg-primary text-white rounded-lg font-mono text-xs font-black shadow-md shadow-primary/20">
                                    #{formData.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        )}
                        {!formData.id && (
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Gestión administrativa interna</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition-all active:scale-90 border border-gray-100">
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fecha Entrada</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fecha Salida</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Domo Asignado</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nombre</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Apellido</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    readOnly={isViewer}
                                    className={inputClasses}
                                    placeholder="+56 9 ..."
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">N° Personas (Adultos)</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Plataforma / Fuente</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Estado Reserva</label>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Total Reserva ($)</label>
                                <input
                                    type="number"
                                    value={formData.total || ''}
                                    onChange={(e) => setFormData({ ...formData, total: isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber })}
                                    readOnly={isViewer}
                                    className={`w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    placeholder="0"
                                />
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
                    </div>

                    {/* Sección: Notas Detalle */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Detalle de Reserva</h4>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Notas / Mensaje del Cliente</label>
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
                                        className={`w-full pl-3.5 pr-20 py-3.5 bg-green-50/20 border border-green-100 rounded-2xl text-[11px] font-bold placeholder:text-gray-300 focus:bg-white transition-all outline-none ${isViewer ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        placeholder="https://drive.google.com/file/d/..."
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {formData.comprobante_url && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, comprobante_url: "" })}
                                                className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
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
                            
                            <p className="text-[9px] text-gray-400 font-bold italic pl-1 italic">
                                Puedes pegar un link de Google Drive directamente o subir un archivo (PDF/IMG) desde tu dispositivo.
                            </p>
                        </div>
                    </div>

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
                </form>
            </div>
        </div>
    );
}
