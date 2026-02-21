"use client";

import { useState } from "react";

interface GuestData {
    nombre: string;
    apellido: string;
    email: string;
}

interface GuestFormProps {
    reservaId: string;
    initialData?: Partial<GuestData>;
    onSave: (data: GuestData) => void;
}

export default function GuestForm({ reservaId, initialData, onSave }: GuestFormProps) {
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        apellido: initialData?.apellido || "",
        email: initialData?.email || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/reservas/actualizar-huesped", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId,
                    ...formData,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al guardar los datos");
            }

            onSave(formData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-sub-light">Nombre</label>
                    <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full bg-background-light dark:bg-black/10 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-gold transition-colors"
                        placeholder="Juan"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-sub-light">Apellido</label>
                    <input
                        type="text"
                        required
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="w-full bg-background-light dark:bg-black/10 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-gold transition-colors"
                        placeholder="Pérez"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-sub-light">Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-background-light dark:bg-black/10 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-gold transition-colors"
                        placeholder="juan@ejemplo.com"
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full text-sm uppercase tracking-[0.2em] shadow-lg transition-all disabled:opacity-50"
            >
                {loading ? "Guardando..." : "Guardar y Continuar al Pago"}
            </button>
        </form>
    );
}
