"use client";

import { useState } from "react";

interface Domo {
    id: string;
    nombre: string;
}

interface Reserva {
    id: string;
    fecha_inicio: string;
    fecha_fin: string;
    domo_id: string;
    estado: string;
    nombre: string;
    apellido: string;
}

interface DomoCalendarProps {
    reservas: Reserva[];
    domos: Domo[];
}

export default function DomoCalendar({ reservas, domos }: DomoCalendarProps) {
    const daysToShow = 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = Array.from({ length: daysToShow }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
    });

    const isReserved = (domoId: string, date: Date) => {
        const dateStr = date.toISOString().split('T')[0];

        // Find all reservations for this dome that cover this date
        // Logic: start <= date < end
        // (Checkout day is free for next checkin, usually)
        return reservas.filter(r => {
            // Normalize dates
            if (r.estado === 'cancelada') return false;
            if (r.domo_id !== domoId) return false;

            // Allow string comparison if ISO format (YYYY-MM-DD)
            return r.fecha_inicio <= dateStr && r.fecha_fin > dateStr;
        });
    };

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border-b border-gray-100 bg-white sticky left-0 z-10 w-40 text-left text-xs font-bold text-gray-500 uppercase">
                                Domo / Fecha
                            </th>
                            {dates.map((date, i) => (
                                <th key={i} className="p-1 border-b border-gray-100 min-w-[40px] text-[10px] text-gray-400 font-medium text-center">
                                    <div className={`p-1 rounded ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-50' : ''}`}>
                                        {date.getDate()}
                                        <br />
                                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()]}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {domos.map(domo => (
                            <tr key={domo.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="p-3 bg-white sticky left-0 z-10 font-bold text-xs text-gray-700 border-r border-gray-100">
                                    {domo.nombre}
                                </td>
                                {dates.map((date, i) => {
                                    const matches = isReserved(domo.id, date);
                                    let cellClass = "bg-transparent";
                                    let content = null;

                                    if (matches.length > 0) {
                                        const res = matches[0]; // Take first match
                                        // Check conflict
                                        if (matches.length > 1) {
                                            cellClass = "bg-red-500 text-white"; // Overlap!
                                            content = "⚠️";
                                        } else if (res.estado === 'pagado') {
                                            cellClass = "bg-green-500 text-white";
                                            content = res.id.slice(-5).toUpperCase();
                                        } else {
                                            cellClass = "bg-yellow-400 text-white";
                                            content = res.id.slice(-5).toUpperCase();
                                        }

                                        // Start rounded corner
                                        const isStart = res.fecha_inicio === date.toISOString().split('T')[0];

                                        if (isStart) cellClass += " rounded-l-md ml-1";

                                        return (
                                            <td key={i} className="p-1 relative h-10 border-r border-dashed border-gray-100">
                                                <div
                                                    className={`w-full h-8 flex items-center justify-center text-[9px] font-bold shadow-sm cursor-pointer transition-all hover:brightness-110 ${cellClass}`}
                                                    title={`${res.nombre} ${res.apellido} (${res.estado}) - COD: ${res.id.slice(-5).toUpperCase()}`}
                                                >
                                                    {content}
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={i} className="p-1 h-10 border-r border-dashed border-gray-100 text-center">
                                            <span className="w-1 h-1 bg-gray-100 rounded-full inline-block"></span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-end">
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded"></span> Pagado</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-400 rounded"></span> Pendiente</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded"></span> Conflicto</div>
            </div>
        </div>
    );
}
