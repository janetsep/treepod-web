"use client";

import { useEffect, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addMonths, startOfToday, parseISO, addDays } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/src/style.css";

type AvailabilityCalendarProps = {
    selectedRange: DateRange | undefined;
    onSelect: (range: DateRange | undefined) => void;
    className?: string;
    defaultMonth?: Date;
};

export default function AvailabilityCalendar({ selectedRange, onSelect, className, defaultMonth }: AvailabilityCalendarProps) {
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthsToShow, setMonthsToShow] = useState(1);
    const [month, setMonth] = useState<Date | undefined>(defaultMonth || startOfToday());
    // Regla de negocio: el sistema solo acepta reservas para HOY si son antes de las
    // 14:00 (hora de Chile). Pasadas las 14:00, la fecha mínima de entrada es mañana.
    const [minSelectable, setMinSelectable] = useState<Date>(startOfToday());
    const [aviso, setAviso] = useState<string | null>(null);
    const rangeCompleteRef = useRef(false);

    useEffect(() => {
        const horaChile = parseInt(
            new Intl.DateTimeFormat("es-CL", {
                timeZone: "America/Santiago",
                hour: "2-digit",
                hour12: false,
            }).format(new Date()),
            10
        ) % 24; // "24" (medianoche) -> 0
        setMinSelectable(horaChile >= 14 ? addDays(startOfToday(), 1) : startOfToday());
    }, []);

    // Track when both dates are selected (range is complete)
    useEffect(() => {
        rangeCompleteRef.current = !!(selectedRange?.from && selectedRange?.to);
    }, [selectedRange]);

    useEffect(() => {
        setMonthsToShow(1);
    }, []);

    useEffect(() => {
        if (defaultMonth) {
            setMonth(defaultMonth);
        }
    }, [defaultMonth]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const today = new Date();
                const endRange = addMonths(today, 6);

                const params = new URLSearchParams({
                    from: format(today, "yyyy-MM-dd"),
                    to: format(endRange, "yyyy-MM-dd"),
                });

                const res = await fetch(`/api/public/disponibilidad?${params}`);
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to fetch availability: ${res.status} ${errorText}`);
                }

                const data = await res.json();
                if (!data || !Array.isArray(data.blockedDates)) {
                    throw new Error("Invalid availability data format");
                }
                const dates = data.blockedDates.map((d: string) => parseISO(d));
                setBlockedDates(dates);
            } catch (err) {
                console.error("❌ [AvailabilityCalendar] Error loading data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    // Una NOCHE está bloqueada si ese día está ocupado. El check-out NO ocupa noche
    // (te vas en la mañana), por eso se valida el rango medio-abierto [entrada, salida).
    const blockedSet = new Set(blockedDates.map((d) => format(d, "yyyy-MM-dd")));
    const esNocheBloqueada = (d: Date) => blockedSet.has(format(d, "yyyy-MM-dd"));
    const rangoTieneNocheBloqueada = (from: Date, to: Date) => {
        let d = from;
        const finStr = format(to, "yyyy-MM-dd");
        while (format(d, "yyyy-MM-dd") < finStr) {
            if (esNocheBloqueada(d)) return true;
            d = addDays(d, 1);
        }
        return false;
    };

    // Handle range selection with reset behavior:
    // If both dates are already selected and user clicks a new date,
    // start a NEW selection instead of extending the old range.
    const handleSelect = (range: DateRange | undefined) => {
        let result = range;

        if (rangeCompleteRef.current && range?.from && range?.to) {
            // Both dates were selected and user clicked a new date.
            // react-day-picker extends the range by default, but we want to reset.
            const prevFrom = selectedRange?.from?.getTime();
            const prevTo = selectedRange?.to?.getTime();
            const newFrom = range.from.getTime();
            const newTo = range.to.getTime();

            let clickedDate: Date;
            if (newFrom !== prevFrom) clickedDate = range.from;
            else if (newTo !== prevTo) clickedDate = range.to;
            else clickedDate = range.from;

            result = { from: clickedDate, to: undefined };
        }

        // Normaliza el click de un solo día (algunas versiones devuelven from === to)
        const soloUnDia = result?.from && result?.to && result.from.getTime() === result.to.getTime();
        if (soloUnDia) result = { from: result!.from, to: undefined };

        // Validación de disponibilidad por noches
        if (result?.from && result?.to) {
            if (rangoTieneNocheBloqueada(result.from, result.to)) {
                setAviso("Esas noches no están disponibles. Elige otra fecha de salida.");
                onSelect({ from: result.from, to: undefined }); // mantiene la entrada, pide nueva salida
                return;
            }
        } else if (result?.from && !result?.to) {
            // Día de entrada: no puede ser una noche ocupada (ahí no se puede dormir)
            if (esNocheBloqueada(result.from)) {
                setAviso("Ese día no está disponible para la entrada.");
                onSelect(undefined);
                return;
            }
        }

        setAviso(null);
        onSelect(result);
    };

    const css = `
    /* react-day-picker v9 styling with cyan/primary color */
    .rdp-root {
      --rdp-accent-color: #00ADEF;
      --rdp-accent-background-color: rgba(0, 173, 239, 0.1);
      --rdp-range_start-date-background-color: #00ADEF;
      --rdp-range_end-date-background-color: #00ADEF;
      --rdp-range_middle-background-color: rgba(0, 173, 239, 0.12);
      --rdp-range_middle-color: #00ADEF;
      --rdp-range_start-color: #FFFFFF;
      --rdp-range_end-color: #FFFFFF;
      --rdp-today-color: #00ADEF;
      --rdp-day-width: 38px;
      --rdp-day-height: 38px;
      --rdp-day_button-width: 36px;
      --rdp-day_button-height: 36px;
      margin: 0;
      color: #0F172A;
    }
    .rdp-month_grid {
      border-collapse: collapse !important;
    }
    .rdp-day {
      color: #0F172A;
      font-weight: 500;
    }
    .rdp-day_button:hover:not(:disabled) {
      background-color: rgba(0, 173, 239, 0.1) !important;
      color: #00ADEF !important;
    }
    /* Selected day buttons (start and end of range) */
    .rdp-range_start .rdp-day_button,
    .rdp-range_end .rdp-day_button {
      background-color: #00ADEF !important;
      color: #FFFFFF !important;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0, 173, 239, 0.3) !important;
    }
    /* Middle of range */
    .rdp-range_middle {
      background-color: rgba(0, 173, 239, 0.12) !important;
    }
    .rdp-range_middle .rdp-day_button {
      color: #00ADEF !important;
    }
    .rdp-month {
        width: 100%;
    }
    .rdp-caption_label {
        font-size: 1.1rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #0F172A !important;
        margin-bottom: 1rem;
    }
    .rdp-button_previous,
    .rdp-button_next {
        color: #0F172A !important;
        background: rgba(0, 0, 0, 0.03) !important;
        border: 1px solid rgba(0, 0, 0, 0.05) !important;
        border-radius: 8px !important;
    }
    .rdp-button_previous:hover,
    .rdp-button_next:hover {
        background: #00ADEF !important;
        color: white !important;
        border-color: #00ADEF !important;
    }
    .rdp-weekday {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #00ADEF !important;
        opacity: 1 !important;
        padding-bottom: 1.5rem;
    }
    /* Disabled / unavailable styling */
    .rdp-disabled {
        color: rgba(0, 0, 0, 0.1) !important;
        pointer-events: none;
    }
    .rdp-unavailable {
        background-color: rgba(0, 0, 0, 0.02) !important;
        color: rgba(0, 0, 0, 0.2) !important;
        text-decoration: line-through;
    }
  `;

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <style>{css}</style>

            {loading && (
                <div className="flex items-center gap-3 text-primary font-bold animate-pulse mb-6 bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] uppercase tracking-[0.3em]">Sincronizando</span>
                </div>
            )}

            <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonth}
                min={1}
                numberOfMonths={monthsToShow}
                pagedNavigation
                locale={es}
                disabled={[
                    { before: minSelectable }
                ]}
                modifiers={{
                    unavailable: blockedDates
                }}
                className="font-sans"
            />
            {aviso && (
                <p className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center max-w-xs">
                    {aviso}
                </p>
            )}
        </div>
    );
}

