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

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function DomoCalendar({ reservas, domos }: DomoCalendarProps) {

    // viewDate is the anchor for the displayed month. Defaults to today.
    const [viewDate, setViewDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Show the full month being viewed (1st to last day)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // last day of month

    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const todayComparison = today;

    const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setViewDate(d);
    };

    const isViewingCurrentMonth =
        year === today.getFullYear() && month === today.getMonth();


    const dateToStr = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const isReserved = (domoId: string, date: Date) => {
        const dateStr = dateToStr(date);
        return reservas.filter(r => {
            if (r.estado === 'cancelada') return false;
            if (r.domo_id !== domoId) return false;
            // Ocupa las NOCHES [fecha_inicio, fecha_fin): el día de checkout queda libre.
            return r.fecha_inicio <= dateStr && r.fecha_fin > dateStr;
        });
    };

    // Día de SALIDA de alguna reserva (huésped se va a las 12:00). Se usa para pintar
    // una franja "aseo" en ese día, aunque la noche ya no esté ocupada.
    const isCheckoutDay = (domoId: string, date: Date) => {
        const dateStr = dateToStr(date);
        return reservas.filter(r => {
            if (r.estado === 'cancelada') return false;
            if (r.domo_id !== domoId) return false;
            return r.fecha_fin === dateStr;
        });
    };

    const isToday = (date: Date) => {
        return date.getFullYear() === todayComparison.getFullYear() &&
            date.getMonth() === todayComparison.getMonth() &&
            date.getDate() === todayComparison.getDate();
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goPrevMonth}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors"
                        title="Mes anterior"
                    >
                        ◀
                    </button>
                    <div className="min-w-[180px] text-center">
                        <span className="text-sm font-black text-gray-800 uppercase tracking-wider">
                            {MONTH_NAMES[month]} {year}
                        </span>
                    </div>
                    <button
                        onClick={goNextMonth}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors"
                        title="Mes siguiente"
                    >
                        ▶
                    </button>
                    {!isViewingCurrentMonth && (
                        <button
                            onClick={goToday}
                            className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
                        >
                            Hoy
                        </button>
                    )}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-2 rounded-lg border border-primary/30 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                    Actualizar Datos
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
                                        const checkouts = isCheckoutDay(domo.id, date);
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

                                            const dateStr = dateToStr(date);
                                            const isStart = res.fecha_inicio === dateStr;
                                            if (isStart) cellClass += " rounded-l-md ml-1";

                                            return (
                                                <td key={i} className="p-1 relative h-10 border-r border-dashed border-gray-100">
                                                    {/* Franja "aseo" si ese mismo día también es salida de otra reserva (recambio) */}
                                                    {checkouts.length > 0 && (
                                                        <div
                                                            className="absolute inset-y-1 left-0 w-1/3 bg-amber-300 border-l-2 border-amber-500 rounded-l-md z-10 flex items-center justify-center"
                                                            title={`Aseo · sale 12:00 ${checkouts[0].nombre} ${checkouts[0].apellido}`}
                                                        >
                                                            <span className="text-[10px]">🧹</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`w-full h-8 flex items-center justify-center text-[9px] font-bold shadow-sm cursor-pointer transition-all hover:brightness-110 ${cellClass}`}
                                                        title={`${res.nombre} ${res.apellido} (${res.estado}) - COD: ${res.id.slice(-5).toUpperCase()}`}
                                                    >
                                                        {content}
                                                    </div>
                                                </td>
                                            );
                                        }

                                        // Sin noche ocupada: si es día de salida, pintar la franja "aseo" en la izquierda.
                                        if (checkouts.length > 0) {
                                            const co = checkouts[0];
                                            return (
                                                <td key={i} className="p-1 h-10 border-r border-dashed border-gray-100 relative">
                                                    <div
                                                        className="absolute inset-y-1 left-0 w-1/3 bg-amber-300 border-l-2 border-amber-500 rounded-l-md flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
                                                        title={`Aseo · sale 12:00 ${co.nombre} ${co.apellido}`}
                                                    >
                                                        <span className="text-[10px]">🧹</span>
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
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 justify-end">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded"></span> Pagado</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-400 rounded"></span> Pendiente</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded"></span> Conflicto</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-300 border-l-2 border-amber-500 rounded-l-md"></span> Día de salida · 🧹 aseo</div>
                </div>
            </div>
        </div>
    );
}
