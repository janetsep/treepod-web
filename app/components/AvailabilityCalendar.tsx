"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, addMonths, startOfToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

type AvailabilityCalendarProps = {
    selectedRange: DateRange | undefined;
    onSelect: (range: DateRange | undefined) => void;
    className?: string;
};

export default function AvailabilityCalendar({ selectedRange, onSelect, className }: AvailabilityCalendarProps) {
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthsToShow, setMonthsToShow] = useState(1);

    useEffect(() => {
        setMonthsToShow(1);
    }, []);

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

    const css = `
    .rdp {
      --rdp-cell-size: 38px;
      --rdp-accent-color: #00ADEF;
      --rdp-background-color: rgba(0, 173, 239, 0.1);
      margin: 0;
      color: #0F172A;
    }
    .rdp-table {
      border-collapse: collapse !important;
    }
    .rdp-day {
      color: #0F172A;
      font-weight: 500;
      border: none !important;
      outline: none !important;
    }
    .rdp-day:hover:not([disabled]) {
      background-color: rgba(0, 173, 239, 0.05) !important;
      color: #00ADEF !important;
    }
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
      background-color: #00ADEF !important;
      color: #FFFFFF !important;
      font-weight: 800;
      border-radius: 50% !important;
      outline: none !important;
      box-shadow: 0 4px 12px rgba(0, 173, 239, 0.3) !important;
    }
    .rdp-day_range_start {
      border-radius: 50% 0 0 50% !important;
    }
    .rdp-day_range_end {
      border-radius: 0 50% 50% 0 !important;
    }
    .rdp-day_range_middle {
      background-color: rgba(0, 173, 239, 0.12) !important;
      color: #00ADEF !important;
      border-radius: 0 !important;
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
    .rdp-nav_button {
        color: #0F172A !important;
        background: rgba(0, 0, 0, 0.03) !important;
        border: 1px solid rgba(0, 0, 0, 0.05) !important;
        border-radius: 8px !important;
    }
    .rdp-nav_button:hover {
        background: #00ADEF !important;
        color: white !important;
        border-color: #00ADEF !important;
    }
    .rdp-head_cell {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #00ADEF !important;
        padding-bottom: 1.5rem;
    }
    /* Unavailable styling */
    .rdp-day_disabled {
        color: rgba(0, 0, 0, 0.1) !important;
        pointer-events: none;
    }
    .rdp-day_unavailable {
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
                onSelect={onSelect}
                min={1}
                numberOfMonths={monthsToShow}
                pagedNavigation
                locale={es}
                disabled={[
                    ...blockedDates,
                    { before: startOfToday() }
                ]}
                modifiers={{
                    unavailable: blockedDates
                }}
                className="font-sans"
            />
        </div>
    );
}

