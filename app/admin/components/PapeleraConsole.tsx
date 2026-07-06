"use client";

import { adminFetch } from "@/lib/admin-fetch";
import { useEffect, useState } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";

interface Props {
    adminEmail: string | null;
}

// Fecha ISO (aaaa-mm-dd) → dd-mm-aaaa legible.
function fmtFecha(iso: string | null | undefined) {
    if (!iso) return "—";
    const [y, m, d] = String(iso).slice(0, 10).split("-");
    return y && m && d ? `${d}-${m}-${y}` : String(iso);
}

export default function PapeleraConsole({ adminEmail }: Props) {
    const [reservas, setReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPapelera();
    }, []);

    async function fetchPapelera() {
        try {
            const res = await adminFetch("/api/admin/reservas/papelera");
            const data = await res.json();
            if (res.ok) setReservas(data || []);
        } catch (e) {
            console.error("Error fetching papelera:", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(reservaId: string, action: "restore" | "permanent_delete") {
        const msg = action === "restore"
            ? "¿Restaurar esta reserva?"
            : "¿Eliminar PERMANENTEMENTE? Esta acción es IRREVERSIBLE.";
        if (!confirm(msg)) return;

        setActionLoading(reservaId);
        try {
            const res = await adminFetch("/api/admin/reservas/papelera", {
                method: "POST",
                body: JSON.stringify({ reservaId, adminEmail, action })
            });
            if (res.ok) {
                setReservas(prev => prev.filter(r => r.id !== reservaId));
                alert(action === "restore" ? "Reserva restaurada correctamente." : "Reserva eliminada permanentemente.");
            } else {
                const data = await res.json();
                alert("Error: " + data.error);
            }
        } catch {
            alert("Error de conexión.");
        } finally {
            setActionLoading(null);
        }
    }

    async function restoreAll() {
        if (!confirm(`¿Restaurar TODAS las ${reservas.length} reservas de la papelera?`)) return;
        setActionLoading("bulk");
        let count = 0;
        for (const r of reservas) {
            const res = await adminFetch("/api/admin/reservas/papelera", {
                method: "POST",
                body: JSON.stringify({ reservaId: r.id, adminEmail, action: "restore" })
            });
            if (res.ok) count++;
        }
        alert(`Se restauraron ${count} reservas.`);
        fetchPapelera();
        setActionLoading(null);
    }

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-500" />
                    <h2 className="text-xl font-display font-black text-gray-800">
                        Papelera ({reservas.length} reservas)
                    </h2>
                </div>
                {reservas.length > 0 && (
                    <button
                        onClick={restoreAll}
                        disabled={actionLoading === "bulk"}
                        className="px-6 py-2.5 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                    >
                        <RotateCcw className="w-4 h-4 inline mr-2" />
                        Restaurar Todas
                    </button>
                )}
            </div>

            {reservas.length === 0 ? (
                <div className="text-center py-20 text-gray-700">
                    <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">La papelera está vacía</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-3 flex items-center gap-2 text-yellow-700 text-sm font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        Las reservas en papelera se pueden restaurar. La eliminación permanente es irreversible.
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-left font-black text-xs uppercase tracking-widest text-gray-700 min-w-[180px]">Huésped</th>
                                <th className="px-4 py-4 text-left font-black text-xs uppercase tracking-widest text-gray-700">Fechas</th>
                                <th className="px-4 py-4 text-left font-black text-xs uppercase tracking-widest text-gray-700">Domo</th>
                                <th className="px-4 py-4 text-left font-black text-xs uppercase tracking-widest text-gray-700">Fuente</th>
                                <th className="px-4 py-4 text-left font-black text-xs uppercase tracking-widest text-gray-700">Eliminada</th>
                                <th className="px-6 py-4 text-right font-black text-xs uppercase tracking-widest text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservas.map((r) => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-6 py-3 font-bold text-gray-800">
                                        {r.nombre} {r.apellido}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                        {fmtFecha(r.fecha_inicio)} → {fmtFecha(r.fecha_fin)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {r.domos?.nombre || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-900">{r.fuente}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 text-xs">
                                        {r.deleted_at ? new Date(r.deleted_at).toLocaleString("es-CL") : "—"}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleAction(r.id, "restore")}
                                                disabled={actionLoading === r.id}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-black hover:bg-green-500 hover:text-white transition-all"
                                            >
                                                <RotateCcw className="w-3 h-3 inline mr-1" />
                                                Restaurar
                                            </button>
                                            <button
                                                onClick={() => handleAction(r.id, "permanent_delete")}
                                                disabled={actionLoading === r.id}
                                                className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-3 h-3 inline mr-1" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </div>
    );
}
