"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Search, Mail, MessageCircle, Snowflake, BookOpen, ShoppingCart, CheckCircle2, RefreshCw } from "lucide-react";

type Lead = {
    id: string;
    email: string;
    telefono: string | null;
    nombre: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    total: string | null;
    created_at: string;
    origen: string;
    convertido: boolean;
    utm_source: string | null;
    utm_campaign: string | null;
};

const fmtFecha = (iso: string | null) => {
    if (!iso) return "—";
    const [y, m, d] = String(iso).slice(0, 10).split("-");
    return y && m && d ? `${d}-${m}-${y}` : "—";
};

const fmtCLP = (v: string | number | null) => {
    const n = Number(v);
    return n > 0 ? `$${n.toLocaleString("es-CL")}` : "—";
};

/** Mensaje de WhatsApp según el origen del lead. Nunca promete tinaja (cerrada en invierno). */
function mensajeWhatsApp(l: Lead) {
    const saludo = l.nombre ? `Hola ${l.nombre.split(" ")[0]}` : "Hola";
    if (l.origen === "Alerta de nieve") {
        return `${saludo}, te escribimos de Domos TreePod 👋 Te anotaste para que te avisáramos cuando nevara en Valle Las Trancas. ¿Te gustaría que te contemos las fechas disponibles?`;
    }
    if (l.origen === "Guía Las Trancas") {
        return `${saludo}, te escribimos de Domos TreePod. Descargaste nuestra guía del Valle Las Trancas: ¿te ayudamos a armar tu escapada? Tenemos domos disponibles y reservando directo tienes el mejor precio.`;
    }
    const fechas = l.fecha_inicio ? ` para el ${fmtFecha(l.fecha_inicio)} al ${fmtFecha(l.fecha_fin)}` : "";
    return `${saludo}, te escribimos de Domos TreePod. Vimos que empezaste una reserva${fechas} y quedó incompleta. ¿Tuviste algún problema con el pago? Podemos ayudarte a completarla.`;
}

export default function LeadsConsole() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [resumen, setResumen] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState<"pendientes" | "todos">("pendientes");

    async function cargar() {
        setLoading(true);
        try {
            const res = await adminFetch("/api/admin/leads");
            const data = res.ok ? await res.json() : { leads: [], resumen: null };
            setLeads(data.leads || []);
            setResumen(data.resumen || null);
        } catch {
            setLeads([]);
        }
        setLoading(false);
    }

    useEffect(() => { cargar(); }, []);

    const visibles = leads
        .filter((l) => (filtro === "pendientes" ? !l.convertido : true))
        .filter((l) => {
            const t = busqueda.toLowerCase().trim();
            if (!t) return true;
            return `${l.email} ${l.nombre || ""} ${l.origen}`.toLowerCase().includes(t);
        });

    const iconoOrigen = (origen: string) =>
        origen === "Alerta de nieve" ? <Snowflake className="w-3.5 h-3.5" />
            : origen === "Guía Las Trancas" ? <BookOpen className="w-3.5 h-3.5" />
                : <ShoppingCart className="w-3.5 h-3.5" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Leads · contactos por recuperar</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Gente que dejó su contacto sin completar la reserva, más los suscriptores de la alerta de nieve y la guía.
                    </p>
                </div>
                <button onClick={cargar} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
                </button>
            </div>

            {resumen && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: "Leads totales", valor: resumen.total },
                        { label: "Por contactar", valor: resumen.pendientes, destacar: true },
                        { label: "Ya reservaron", valor: resumen.convertidos },
                        { label: "Valor pendiente", valor: fmtCLP(resumen.valor_pendiente) },
                    ].map((c) => (
                        <div key={c.label} className={`rounded-2xl p-4 border ${c.destacar ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{c.label}</div>
                            <div className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{c.valor}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por email, nombre u origen…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                </div>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    {(["pendientes", "todos"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${filtro === f ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}
                        >
                            {f === "pendientes" ? "Por contactar" : "Todos"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500 py-8 text-center">Cargando leads…</p>
            ) : visibles.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                    <p className="text-sm text-gray-600">
                        No hay leads {filtro === "pendientes" ? "por contactar" : "registrados"} todavía.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Se llenará solo: cada visitante que deje su email en el checkout, en la alerta de nieve o en la guía aparecerá aquí.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visibles.map((l) => (
                        <div key={l.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-gray-900">{l.nombre || l.email}</span>
                                    {l.convertido && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" /> Reservó
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {iconoOrigen(l.origen)} {l.origen}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {l.nombre ? `${l.email} · ` : ""}
                                    {l.fecha_inicio ? `${fmtFecha(l.fecha_inicio)} → ${fmtFecha(l.fecha_fin)} · ` : ""}
                                    {fmtCLP(l.total)}
                                    {l.utm_source ? ` · vino de ${l.utm_source}` : ""}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {l.telefono && (
                                    <a
                                        href={`https://wa.me/${l.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(mensajeWhatsApp(l))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1fb958] text-white text-xs font-bold px-3 py-2 rounded-lg"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                    </a>
                                )}
                                <a
                                    href={`mailto:${l.email}?subject=${encodeURIComponent("Tu escapada a Domos TreePod")}&body=${encodeURIComponent(mensajeWhatsApp(l))}`}
                                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                                >
                                    <Mail className="w-3.5 h-3.5" /> Email
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
