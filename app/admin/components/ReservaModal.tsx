"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
    total: number;
    monto_pagado?: number;
    estado: string;
    fuente?: string;
    mensaje?: string;
}

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    domos: Domo[];
    reservaToEdit?: Reserva | null;
}

export default function ReservaModal({ isOpen, onClose, onSave, domos, reservaToEdit }: ReservaModalProps) {
    const [formData, setFormData] = useState<Reserva>({
        fecha_inicio: "",
        fecha_fin: "",
        domo_id: "",
        nombre: "",
        apellido: "",
        email: "",
        total: 0,
        monto_pagado: 0,
        estado: "pagado",
        fuente: "manual_admin",
        mensaje: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (reservaToEdit) {
                setFormData({
                    id: reservaToEdit.id,
                    fecha_inicio: reservaToEdit.fecha_inicio || "",
                    fecha_fin: reservaToEdit.fecha_fin || "",
                    domo_id: reservaToEdit.domo_id || "",
                    nombre: reservaToEdit.nombre || "",
                    apellido: reservaToEdit.apellido || "",
                    email: reservaToEdit.email || "",
                    total: reservaToEdit.total || 0,
                    monto_pagado: (reservaToEdit as any).monto_pagado || 0,
                    estado: reservaToEdit.estado || "pendiente",
                    fuente: reservaToEdit.fuente || "manual_admin",
                    mensaje: (reservaToEdit as any).mensaje || ""
                });
            } else {
                setFormData({
                    fecha_inicio: new Date().toISOString().split('T')[0],
                    fecha_fin: "",
                    domo_id: domos[0]?.id || "",
                    nombre: "",
                    apellido: "",
                    email: "",
                    total: 0,
                    monto_pagado: 0,
                    estado: "pagado",
                    fuente: "manual_admin",
                    mensaje: ""
                });
            }
        }
    }, [isOpen, reservaToEdit, domos]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/reservas/guardar", {
                method: "POST",
                body: JSON.stringify(formData),
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in my-8 border border-gray-100">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-display font-black text-2xl text-gray-900 leading-tight">
                            {reservaToEdit ? "Editar Ficha de Reserva" : "Nueva Reserva Manual"}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Gestión administrativa interna</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition-all active:scale-90">
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
                                    value={formData.fecha_inicio}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fecha Salida</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.fecha_fin}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Domo Asignado</label>
                                <select
                                    required
                                    value={formData.domo_id}
                                    onChange={(e) => setFormData({ ...formData, domo_id: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary transition-all outline-none appearance-none"
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
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Huésped</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold transition-all outline-none"
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Apellido</label>
                                <input
                                    type="text"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold transition-all outline-none"
                                    placeholder="Apellido"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold transition-all outline-none"
                                    placeholder="huésped@correo.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Finanzas y Estado */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pagos y Estado</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Total Reserva ($)</label>
                                <input
                                    type="number"
                                    value={formData.total}
                                    onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-green-600 uppercase tracking-widest pl-1">Monto Pagado ($)</label>
                                <input
                                    type="number"
                                    value={formData.monto_pagado}
                                    onChange={(e) => setFormData({ ...formData, monto_pagado: Number(e.target.value) })}
                                    className="w-full p-3.5 bg-green-50/50 border border-green-100 rounded-2xl text-sm font-black text-green-700 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Estado</label>
                                <select
                                    required
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
                                >
                                    <option value="pagado">Pagado Total</option>
                                    <option value="pendiente_pago">Abono Pendiente</option>
                                    <option value="pendiente">Manual Pendiente</option>
                                    <option value="confirmado">Confirmada</option>
                                    <option value="bloqueado">Bloqueo Admin</option>
                                </select>
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
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium transition-all outline-none min-h-[100px] resize-none"
                                placeholder="Indique aquí detalles especiales, abonos parciales o requerimientos..."
                            />
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
                            disabled={loading}
                            className="flex-3 py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? "Sincronizando..." : reservaToEdit ? "Actualizar Registro" : "Crear Reserva"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
