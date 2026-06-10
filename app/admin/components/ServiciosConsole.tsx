"use client";

import { adminFetch } from "@/lib/admin-fetch";
import { useEffect, useState } from "react";
import { Save, RefreshCw, Plus, Trash2, AlertCircle } from "lucide-react";

interface Servicio {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    multiplicador_noches: boolean;
    multiplicador_personas: boolean;
    image_url: string;
    activo: boolean;
}

export default function ServiciosConsole({ adminRole }: { adminRole: string | null }) {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isViewer = adminRole === 'viewer';

    useEffect(() => {
        loadServicios();
    }, []);

    async function loadServicios() {
        setLoading(true);
        setError(null);
        try {
            const res = await adminFetch("/api/admin/servicios");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setServicios(data.servicios || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function saveServicio(servicio: Servicio) {
        setSaving(servicio.id);
        setError(null);
        try {
            const res = await adminFetch("/api/admin/servicios", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(servicio),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSuccess(`"${servicio.nombre}" guardado`);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(null);
        }
    }

    async function createServicio() {
        setSaving("new");
        setError(null);
        try {
            const res = await adminFetch("/api/admin/servicios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: "Nuevo Servicio",
                    descripcion: "",
                    precio: 0,
                    multiplicador_noches: false,
                    multiplicador_personas: false,
                    image_url: "",
                    activo: true,
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await loadServicios();
            setSuccess("Servicio creado");
            setTimeout(() => setSuccess(null), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(null);
        }
    }

    async function deleteServicio(id: string, nombre: string) {
        if (!confirm(`¿Eliminar "${nombre}"?`)) return;
        setSaving(id);
        try {
            const res = await adminFetch("/api/admin/servicios", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setServicios(prev => prev.filter(s => s.id !== id));
            setSuccess(`"${nombre}" eliminado`);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(null);
        }
    }

    function updateLocal(id: string, field: keyof Servicio, value: any) {
        setServicios(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Servicios y Extras</h2>
                    <p className="text-sm text-gray-500">Gestiona precios de desayuno, cena, tinaja, aseo, lavandería, almuerzo y más</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadServicios} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {!isViewer && (
                        <button
                            onClick={createServicio}
                            disabled={saving === "new"}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 text-sm font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Servicio
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                    {success}
                </div>
            )}

            <div className="grid gap-4">
                {servicios.map((s) => (
                    <div key={s.id} className={`bg-white rounded-2xl border ${s.activo ? 'border-gray-100' : 'border-red-200 bg-red-50/30'} p-5 shadow-sm`}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Nombre */}
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre</label>
                                <input
                                    type="text"
                                    value={s.nombre}
                                    onChange={(e) => updateLocal(s.id, "nombre", e.target.value)}
                                    disabled={isViewer}
                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                                />
                            </div>

                            {/* Precio */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio (CLP)</label>
                                <input
                                    type="number"
                                    value={s.precio}
                                    onChange={(e) => updateLocal(s.id, "precio", Number(e.target.value))}
                                    disabled={isViewer}
                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-right focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                                />
                            </div>

                            {/* Multiplicadores */}
                            <div className="md:col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={s.multiplicador_noches}
                                        onChange={(e) => updateLocal(s.id, "multiplicador_noches", e.target.checked)}
                                        disabled={isViewer}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs text-gray-600">x Noches</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={s.multiplicador_personas}
                                        onChange={(e) => updateLocal(s.id, "multiplicador_personas", e.target.checked)}
                                        disabled={isViewer}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs text-gray-600">x Personas</span>
                                </label>
                            </div>

                            {/* Activo */}
                            <div className="md:col-span-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={s.activo}
                                        onChange={(e) => updateLocal(s.id, "activo", e.target.checked)}
                                        disabled={isViewer}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-xs text-gray-600">Activo</span>
                                </label>
                            </div>

                            {/* Acciones */}
                            {!isViewer && (
                                <div className="md:col-span-3 flex justify-end gap-2">
                                    <button
                                        onClick={() => saveServicio(s)}
                                        disabled={saving === s.id}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 text-xs font-bold"
                                    >
                                        {saving === s.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => deleteServicio(s.id, s.nombre)}
                                        disabled={saving === s.id}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="mt-3">
                            <input
                                type="text"
                                value={s.descripcion || ""}
                                onChange={(e) => updateLocal(s.id, "descripcion", e.target.value)}
                                disabled={isViewer}
                                placeholder="Descripción del servicio..."
                                className="w-full px-3 py-2 border border-gray-100 rounded-lg text-xs text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                            />
                        </div>
                    </div>
                ))}

                {servicios.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">No hay servicios configurados</p>
                        <p className="text-xs mt-1">Haz clic en "Agregar Servicio" para crear uno</p>
                    </div>
                )}
            </div>
        </div>
    );
}
