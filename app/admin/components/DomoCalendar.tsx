"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function DomoCalendar({ reservas, domos }: DomoCalendarProps) {
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

    // Generate all days of the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(selectedYear, selectedMonth, i + 1);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Navigate months
    const goToPrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const goToToday = () => {
        setSelectedYear(now.getFullYear());
        setSelectedMonth(now.getMonth());
    };

    // Year options: from 2024 to current year + 2
    const yearOptions = Array.from({ length: (now.getFullYear() + 2) - 2024 + 1 }, (_, i) => 2024 + i);

    const isReserved = (domoId: string, date: Date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        return reservas.filter(r => {
            if (r.estado === 'cancelada') return false;
            if (r.domo_id !== domoId) return false;
            return r.fecha_inicio <= dateStr && r.fecha_fin > dateStr;
        });
    };

    const isToday = (date: Date) => {
        return date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={goToPrevMonth}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 bg-white cursor-pointer hover:border-gray-300 transition-colors"
                >
                    {MONTH_NAMES.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                    ))}
                </select>

                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 bg-white cursor-pointer hover:border-gray-300 transition-colors"
                >
                    {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                <button
                    onClick={goToToday}
                    className="px-3 py-2 rounded-lg border border-primary/30 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                    Hoy
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-gray-100 bg-white sticky left-0 z-10 w-40 text-left text-xs font-bold text-gray-500 uppercase">
                                    Domo / Fecha
                                </th>
                                {dates.map((date, i) => (
                                    <th key={i} className={`p-1 border-b border-gray-100 min-w-[40px] text-[10px] font-medium text-center ${isToday(date) ? 'text-primary' : 'text-gray-400'}`}>
                                        <div className={`p-1 rounded ${isToday(date) ? 'bg-primary/10 ring-1 ring-primary/30' : date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-50' : ''}`}>
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
                                            const res = matches[0];
                                            if (matches.length > 1) {
                                                cellClass = "bg-red-500 text-white";
                                                content = "⚠️";
                                            } else if (res.estado === 'pagado') {
                                                cellClass = "bg-green-500 text-white";
                                                content = res.id.slice(-5).toUpperCase();
                                            } else {
                                                cellClass = "bg-yellow-400 text-white";
                                                content = res.id.slice(-5).toUpperCase();
                                            }

                                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                            const isStart = res.fecha_inicio === dateStr;
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
        </div>
    );
}
