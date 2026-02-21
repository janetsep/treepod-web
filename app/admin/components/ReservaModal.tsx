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
    estado: string;
    fuente?: string;
}

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    domos: Domo[];
    reservaToEdit?: Reserva | null; // If null, creating new
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
        estado: "pagado", // Default para admin manual
        fuente: "manual_admin"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (reservaToEdit) {
                // Modo Edición: Cargar datos existentes (con fallbacks para evitar nulls)
                setFormData({
                    id: reservaToEdit.id,
                    fecha_inicio: reservaToEdit.fecha_inicio || "",
                    fecha_fin: reservaToEdit.fecha_fin || "",
                    domo_id: reservaToEdit.domo_id || "",
                    nombre: reservaToEdit.nombre || "",
                    apellido: reservaToEdit.apellido || "",
                    email: reservaToEdit.email || "",
                    total: reservaToEdit.total || 0,
                    estado: reservaToEdit.estado || "pendiente",
                    fuente: reservaToEdit.fuente || "manual_admin"
                });
            } else {
                // Modo Creación: Resetear limpio
                setFormData({
                    fecha_inicio: new Date().toISOString().split('T')[0],
                    fecha_fin: "",
                    domo_id: domos[0]?.id || "",
                    nombre: "",
                    apellido: "",
                    email: "",
                    total: 0,
                    estado: "pagado",
                    fuente: "manual_admin"
                });
            }
        } else {
            // Al cerrar, limpiar también para evitar parpadeos al reabrir
            setFormData({
                fecha_inicio: "",
                fecha_fin: "",
                domo_id: "",
                nombre: "",
                apellido: "",
                email: "",
                total: 0,
                estado: "pagado",
                fuente: ""
            });
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
                alert(reservaToEdit ? "Reserva actualizada" : "Reserva creada");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">
                        {reservaToEdit ? "Editar Reserva" : "Nueva Reserva Manual"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Entrada</label>
                            <input
                                type="date"
                                required
                                value={formData.fecha_inicio}
                                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Salida</label>
                            <input
                                type="date"
                                required
                                value={formData.fecha_fin}
                                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Domo</label>
                        <select
                            required
                            value={formData.domo_id}
                            onChange={(e) => setFormData({ ...formData, domo_id: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                        >
                            <option value="" disabled>Seleccionar Domo</option>
                            {domos.map(d => (
                                <option key={d.id} value={d.id}>{d.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                placeholder="Juan"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Apellido</label>
                            <input
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                placeholder="Pérez"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Email (Opcional)</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="cliente@ejemplo.com"
                        />
                        <p className="text-[10px] text-gray-400">Si se deja vacío, aparecerá como ID en el tablero.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                            <select
                                required
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="pagado">Pagado (Verde)</option>
                                <option value="pendiente">Pendiente (Amarillo)</option>
                                <option value="confirmado">Confirmado (Verde)</option>
                                <option value="bloqueado">Bloqueo Admin</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Total ($)</label>
                            <input
                                type="number"
                                value={formData.total}
                                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Reserva"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
