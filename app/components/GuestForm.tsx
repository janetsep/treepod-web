"use client";

import { useState } from "react";
import { getStoredUTMs, getStoredLandingPage } from "./UTMCapture";
import { btnPrimary } from "./deco/cta";

/* Inputs de ficha: rectangulares, foco cyan sin anillos (lenguaje "KM 72") */
const inputFicha =
    "w-full bg-white border border-[#1E1B16]/20 rounded-[2px] px-4 py-3 outline-none focus:border-[#00ADEF] focus:ring-0 transition-colors text-[15px] text-[#1E1B16] placeholder:text-[#5B5348]/50";

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
            // Captura UTMs + landing_page del sessionStorage (capturados al primer touch)
            const utms = getStoredUTMs();
            const landing_page = getStoredLandingPage();
            const session_id = (() => {
                try {
                    let sid = sessionStorage.getItem("treepod_session_id");
                    if (!sid) {
                        sid = crypto.randomUUID();
                        sessionStorage.setItem("treepod_session_id", sid);
                    }
                    return sid;
                } catch { return null; }
            })();

            const res = await fetch("/api/reservas/actualizar-huesped", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId,
                    ...formData,
                    ...utms,
                    landing_page,
                    session_id,
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
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className={inputFicha}
                        placeholder="Pérez"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="dato text-[#5B5348] block">Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputFicha}
                        placeholder="juan@ejemplo.com"
                    />
                </div>
            </div>

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
                {loading ? "Guardando..." : "Guardar y continuar al pago"}
            </button>
        </form>
    );
}
