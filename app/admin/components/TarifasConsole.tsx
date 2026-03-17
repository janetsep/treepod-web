"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw, AlertCircle, TrendingUp, Users, Calendar, ArrowRight, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface Tarifa {
    id: string;
    temporada_id: string;
    adultos: number;
    noches_min: number;
    noches_max: number | null;
    precio_noche: number;
}

interface Temporada {
    id: string;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    prioridad: number;
}

export default function TarifasConsole({ adminRole, adminEmail }: { adminRole: string | null, adminEmail: string | null }) {
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [selectedTemporadaId, setSelectedTemporadaId] = useState<string>("");
    
    const isViewer = adminRole === 'viewer';
    const isAdmin = ['admin', 'superadmin'].includes(adminRole || '');

    // Estado para edición/creación de temporada
    const [editingTemporada, setEditingTemporada] = useState<Temporada | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Paginación para temporadas (Rangos)
    const [temporadaPage, setTemporadaPage] = useState(1);
    const TEMPORADAS_PER_PAGE = 4;

    // Reset de página de tarifas no es necesario si mostramos todas, 
    // pero mantendremos la lógica por si en el futuro hay muchas. 
    // Por ahora, el usuario quiere ver las 4 opciones de la matriz juntas.

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/tarifas");
            const data = await res.json();
            if (data.temporadas) {
                const sortedTemporadas = data.temporadas.sort((a: any, b: any) => b.prioridad - a.prioridad);
                setTemporadas(sortedTemporadas);

                if (sortedTemporadas.length > 0) {
                    const currentId = selectedTemporadaId || sortedTemporadas[0].id;
                    setSelectedTemporadaId(currentId);
                    const current = sortedTemporadas.find((t: Temporada) => t.id === currentId) || sortedTemporadas[0];
                    setEditingTemporada(current);
                }
            }
            if (data.tarifas) setTarifas(data.tarifas);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdatePrice = async (id: string, newPrice: number) => {
        setSaving(id);
        try {
            const res = await fetch("/api/admin/tarifas", {
                method: "POST",
                body: JSON.stringify({ id, precio_noche: newPrice, adminEmail }),
            });
            if (!res.ok) throw new Error("Error al actualizar");
            setTarifas(prev => prev.map(t => t.id === id ? { ...t, precio_noche: newPrice } : t));
        } catch (error) {
            alert("No se pudo actualizar el precio");
        } finally {
            setSaving(null);
        }
    };

    const handleSaveTemporada = async () => {
        if (!editingTemporada) return;
        setSaving('temporada');
        try {
            const actionType = isCreating ? 'create_temporada' : 'temporada';
            const res = await fetch("/api/admin/tarifas", {
                method: "POST",
                body: JSON.stringify({
                    type: actionType,
                    id: editingTemporada.id,
                    nombre: editingTemporada.nombre,
                    fecha_inicio: editingTemporada.fecha_inicio,
                    fecha_fin: editingTemporada.fecha_fin,
                    prioridad: editingTemporada.prioridad,
                    adminEmail
                }),
            });
            if (!res.ok) throw new Error("Error en servidor");

            await loadData();
            setIsCreating(false);
            alert(isCreating ? "Temporada creada" : "Cambios guardados");
        } catch (error) {
            alert("Error al procesar la solicitud");
        } finally {
            setSaving(null);
        }
    };

    const handleDeleteTemporada = async () => {
        if (!selectedTemporadaId) return;
        if (!confirm("¿Seguro que deseas eliminar esta temporada y todas sus tarifas? Esta acción es irreversible.")) return;

        setSaving('delete');
        try {
            const res = await fetch("/api/admin/tarifas", {
                method: "POST",
                body: JSON.stringify({ type: 'delete_temporada', id: selectedTemporadaId, adminEmail }),
            });
            if (!res.ok) throw new Error("Error al eliminar");

            setSelectedTemporadaId("");
            await loadData();
        } catch (error) {
            alert("No se pudo eliminar");
        } finally {
            setSaving(null);
        }
    };

    const handlePriorityChange = async (id: string, currentPriority: number, delta: number) => {
        setSaving(`prio-${id}`);
        try {
            await fetch("/api/admin/tarifas", {
                method: "POST",
                body: JSON.stringify({
                    type: 'temporada',
                    id,
                    prioridad: currentPriority + delta,
                    adminEmail
                }),
            });
            await loadData();
        } catch (error) {
            console.error("Error updating priority");
        } finally {
            setSaving(null);
        }
    };

    const filteredTarifas = tarifas.filter(t => t.temporada_id === selectedTemporadaId);

    // Lógica de paginación para Temporadas
    const totalTemporadaPages = Math.ceil(temporadas.length / TEMPORADAS_PER_PAGE);
    const paginatedTemporadas = temporadas.slice(
        (temporadaPage - 1) * TEMPORADAS_PER_PAGE,
        temporadaPage * TEMPORADAS_PER_PAGE
    );

    if (loading) {
        return <div className="p-12 text-center text-gray-400 font-black italic animate-pulse">CARGANDO MAESTRO DE TARIFAS...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header / Listado de Temporadas */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-display font-black text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            Administrador de Tarifas
                        </h2>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Gestión de rangos de fechas y prioridades</p>
                    </div>
                    {!isViewer && (
                        <button
                            onClick={() => {
                                setIsCreating(true);
                                setEditingTemporada({
                                    id: '',
                                    nombre: "Nueva Temporada",
                                    fecha_inicio: new Date().toISOString().split('T')[0],
                                    fecha_fin: new Date().toISOString().split('T')[0],
                                    prioridad: 0
                                });
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10"
                        >
                            <Plus className="w-4 h-4" />
                            Añadir Rango
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Prioridad</th>
                                <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Temporada / Rango</th>
                                <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedTemporadas.map((temp) => (
                                <tr
                                    key={temp.id}
                                    className={`group transition-all hover:bg-gray-50/50 cursor-pointer ${selectedTemporadaId === temp.id ? 'bg-primary/5' : ''}`}
                                    onClick={() => {
                                        setSelectedTemporadaId(temp.id);
                                        setEditingTemporada(temp);
                                        setIsCreating(false);
                                    }}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 text-sm font-black text-gray-400">{temp.prioridad}</span>
                                            {!isViewer && (
                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={(e) => { e.stopPropagation(); handlePriorityChange(temp.id, temp.prioridad, 1); }} className="p-1 hover:bg-white rounded-md text-gray-400 hover:text-primary transition-all"><ArrowUp size={12} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handlePriorityChange(temp.id, temp.prioridad, -1); }} className="p-1 hover:bg-white rounded-md text-gray-400 hover:text-primary transition-all"><ArrowDown size={12} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="font-black text-gray-900 group-hover:text-primary transition-all">{temp.nombre}</div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-2">
                                            {new Date(temp.fecha_inicio).toLocaleDateString()} <ArrowRight size={8} /> {new Date(temp.fecha_fin).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] font-bold">
                                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full">Activa</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {!isViewer && isAdmin && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedTemporadaId(temp.id); handleDeleteTemporada(); }}
                                                className="p-3 text-red-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación de Temporadas */}
                {totalTemporadaPages > 1 && (
                    <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex justify-center items-center gap-4">
                        <button
                            onClick={() => setTemporadaPage(p => Math.max(1, p - 1))}
                            disabled={temporadaPage === 1}
                            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Página {temporadaPage} de {totalTemporadaPages}
                        </span>
                        <button
                            onClick={() => setTemporadaPage(p => Math.min(totalTemporadaPages, p + 1))}
                            disabled={temporadaPage === totalTemporadaPages}
                            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Panel de Edición Detallada */}
            {(editingTemporada || isCreating) && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    {/* Configuración de Fechas */}
                    <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-gray-900">{isCreating ? 'Nueva Configuración' : 'Editar Vigencia'}</h3>
                            {isCreating && <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-full">Borrador</span>}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Nombre Descriptivo</label>
                                <input
                                    type="text"
                                    readOnly={isViewer}
                                    value={editingTemporada?.nombre || ''}
                                    onChange={(e) => setEditingTemporada(editingTemporada ? { ...editingTemporada, nombre: e.target.value } : null)}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-black focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Check-in desde</label>
                                    <input
                                        type="date"
                                        readOnly={isViewer}
                                        value={editingTemporada?.fecha_inicio || ''}
                                        onChange={(e) => setEditingTemporada(editingTemporada ? { ...editingTemporada, fecha_inicio: e.target.value } : null)}
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-black focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Check-out hasta</label>
                                    <input
                                        type="date"
                                        readOnly={isViewer}
                                        value={editingTemporada?.fecha_fin || ''}
                                        onChange={(e) => setEditingTemporada(editingTemporada ? { ...editingTemporada, fecha_fin: e.target.value } : null)}
                                        className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-black focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {!isViewer && (
                                <button
                                    onClick={handleSaveTemporada}
                                    disabled={saving === 'temporada'}
                                    className="w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all"
                                >
                                    {saving === 'temporada' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isCreating ? 'Crear Temporada' : 'Guardar Cambios'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Maestro de Precios Dinámicos */}
                    {!isCreating && (
                        <div className="xl:col-span-2 space-y-6">
                            <div className="flex justify-between items-end px-4">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 italic">Matriz de Precios: {editingTemporada?.nombre}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <Users size={12} className="text-primary" /> {filteredTarifas.length} Configuraciones Activas
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredTarifas.map((tarifa) => (
                                    <div key={tarifa.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-black text-gray-900">{tarifa.adultos}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Adultos</span>
                                                </div>
                                                <p className="text-[9px] font-black uppercase text-primary/60 mt-1">
                                                    {tarifa.noches_min === 1 ? 'Tarifa Base' : `Reserva mín ${tarifa.noches_min} noches`}
                                                </p>
                                            </div>
                                            <span className="text-[8px] font-mono text-gray-300">#{tarifa.id.slice(-6)}</span>
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">$</span>
                                            <input
                                                type="number"
                                                readOnly={isViewer}
                                                defaultValue={tarifa.precio_noche}
                                                onBlur={(e) => !isViewer && handleUpdatePrice(tarifa.id, Number(e.target.value))}
                                                className={`w-full pl-10 pr-12 py-4 border-transparent border-2 rounded-2xl text-xl font-black transition-all outline-none ${isViewer ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-900 focus:bg-white focus:border-primary'}`}
                                            />
                                            {saving === tarifa.id && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <RefreshCw size={14} className="animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
