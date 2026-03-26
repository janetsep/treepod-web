"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, UserCircle, Star, Phone, Mail, FileText, ChevronRight, Hash } from "lucide-react";

export default function ClientesConsole() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClientes();
    }, []);

    async function fetchClientes() {
        setLoading(true);
        try {
            // Fetch clientes with their reservations to calculate total spend
            const { data, error } = await supabase
                .from("clientes")
                .select("*, reservas(total, monto_pagado, estado, created_at)")
                .order("nombre");

            if (error) throw error;
            
            // Transform data to include aggregated totals
            const transformed = data.map(c => {
                const reservas = c.reservas || [];
                const totalReservas = reservas.length;
                const totalSpent = reservas.reduce((acc: number, r: any) => acc + (r.monto_pagado || 0), 0);
                const lastReserva = reservas.sort((a: any, b: any) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0]?.created_at;

                return {
                    ...c,
                    stats: {
                        count: totalReservas,
                        total: totalSpent,
                        last: lastReserva
                    }
                };
            });

            setClientes(transformed);
        } catch (err: any) {
            console.error("Error fetching clientes:", err.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredClientes = clientes.filter(c => {
        const full = `${c.nombre} ${c.apellido} ${c.email} ${c.rut || ""}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const getVipBadge = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'vip':
            case 'gold':
            case 'platinum':
                return "bg-amber-100 text-amber-600 border-amber-200";
            default:
                return "bg-gray-100 text-gray-500 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-black text-gray-800">Directorio de Clientes</h2>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Relación de Huéspedes y Ventas Históricas</p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, RUT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Cliente</th>
                                <th className="px-6 py-5">Contacto</th>
                                <th className="px-6 py-5">ID / RUT</th>
                                <th className="px-6 py-5 text-center">Reservas</th>
                                <th className="px-6 py-5 text-right">Total Invertido</th>
                                <th className="px-8 py-5 text-right">VIP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">Sincronizando directorio...</td></tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic">No se encontraron clientes coincidentes.</td></tr>
                            ) : filteredClientes.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/5 rounded-full flex items-center justify-center font-black text-primary text-xs border border-primary/10">
                                                {c.nombre?.slice(0, 1).toUpperCase()}{c.apellido?.slice(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-gray-900 text-sm">{c.nombre} {c.apellido}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">Desde {new Date(c.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                                <Mail className="w-3 h-3 text-gray-300" /> {c.email}
                                            </div>
                                            {c.telefono && (
                                                <div className="flex items-center gap-1.5 text-[10px] text-primary font-black">
                                                    <Phone className="w-3 h-3 text-primary/40" /> {c.telefono}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            {c.rut && (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                                    <FileText className="w-3 h-3 text-gray-300" /> {c.rut}
                                                </div>
                                            )}
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                                                <Hash className="w-2.5 h-2.5" /> {c.id.slice(0,8).toUpperCase()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex flex-col items-center justify-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                            <span className="text-sm font-black text-gray-900">{c.stats.count}</span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Estancias</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-primary text-base">
                                        ${c.stats.total.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${getVipBadge(c.vip_tier)}`}>
                                                {c.vip_tier || "Standard"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
