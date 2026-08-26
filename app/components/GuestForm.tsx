"use client";

import { useState } from "react";
import { btnPrimary } from "./deco/cta";

/* Inputs de ficha: rectangulares, foco cyan sin anillos (lenguaje "KM 72") */
const inputFicha =
    "w-full bg-white border border-[#1E1B16]/20 rounded-[2px] px-4 py-3 outline-none focus:border-[#00ADEF] focus:ring-0 transition-colors text-[15px] text-[#1E1B16] placeholder:text-[#5B5348]/50";

interface GuestData {
    nombre: string;
    apellido: string;
    email: string;
    // El telefono se pide aqui, despues del pago. Antes se exigia en el
    // checkout y era parte de las cuatro barreras que nadie completaba.
    telefono: string;
}

interface GuestFormProps {
    reservaId: string;
    // La reserva trae telefono como string | null desde la base, no solo undefined.
    initialData?: Partial<Record<keyof GuestData, string | null>>;
    onSave: (data: GuestData) => void;
}

export default function GuestForm({ reservaId, initialData, onSave }: GuestFormProps) {
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        apellido: initialData?.apellido || "",
        email: initialData?.email || "",
        telefono: initialData?.telefono || "",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="dato text-[#5B5348] block">Nombre</label>
                    <input
                        type="text"
                        required
                        autoComplete="given-name"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={inputFicha}
                        placeholder="Juan"
                    />
                </div>
                <div className="space-y-2">
                    <label className="dato text-[#5B5348] block">Apellido</label>
                    <input
                        type="text"
                        required
                        autoComplete="family-name"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className={inputFicha}
                        placeholder="Pérez"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="dato text-[#5B5348] block">Teléfono para coordinar la llegada</label>
                    <input
                        type="tel"
                        required
                        autoComplete="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={inputFicha}
                        placeholder="+56 9 1234 5678"
                    />
                </div>
            </div>

            <p className="text-[12px] leading-relaxed text-[#5B5348]">
                La confirmación se enviará a <strong className="text-[#1E1B16]">{formData.email}</strong>.
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[2px] text-sm font-medium">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`${btnPrimary} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {loading ? "Guardando..." : "Guardar datos de llegada"}
            </button>
        </form>
    );
}
