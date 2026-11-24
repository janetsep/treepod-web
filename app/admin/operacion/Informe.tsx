"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { operationTasks, type OperationDay } from "@/lib/operation";

type Recipient = { name: string; phone: string };
type Report = { days: Array<{ day: string; entries: OperationDay["entries"] }>; recipients: Recipient[] };

export default function Informe({ day }: { day: string }) {
    const [report, setReport] = useState<Report | null>(null);
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);

    async function load() {
        const response = await adminFetch("/api/admin/operacion?vista=informe&fecha=" + day);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setReport(data);
    }

    async function run(action: () => Promise<void>) {
        setBusy(true);
        setNotice("");
        try { await action(); }
        catch (error) { setNotice(error instanceof Error ? error.message : "Inténtalo nuevamente."); }
        finally { setBusy(false); }
    }

    async function saveRecipient(change: { phone: string; name?: string; remove?: boolean }) {
        const response = await adminFetch("/api/admin/operacion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        await load();
        setNotice(change.remove ? "Destinatario retirado." : "Destinatario guardado.");
    }

    const daily = Object.entries(report?.days.find(row => row.day === day)?.entries ?? {});
    const monthly = report?.days.flatMap(row => Object.values(row.entries)) ?? [];
    const total = (entries: Array<{ minutes: number }>) => entries.reduce((sum, entry) => sum + entry.minutes, 0);
    const message = ["TreePod · Informe de operación · " + day, ...daily.flatMap(([id, entry]) => {
        const task = operationTasks.find(task => task.id === id);
        if (!task) return [];
        const done = task.steps.filter((_, index) => entry.steps[index]).length;
        const status = entry.status === "skip" ? "No aplica" : done + "/" + task.steps.length + " pasos";
        return [task.title + " · " + status + (entry.person ? " · " + entry.person : "") + (entry.minutes ? " · " + entry.minutes + " min" : "")];
    }), "Total registrado: " + total(daily.map(([, entry]) => entry)) + " min"].join("\n");
    const completed = report?.days.reduce((sum, row) => sum + operationTasks.filter(task => {
        const entry = row.entries[task.id];
        return entry?.status !== "skip" && task.steps.every((_, index) => entry?.steps[index]);
    }).length, 0) ?? 0;
    const byPerson = new Map<string, number>();
    for (const entry of monthly) {
        if (!entry.minutes) continue;
        const person = entry.person || "Sin responsable";
        byPerson.set(person, (byPerson.get(person) ?? 0) + entry.minutes);
    }

    return <details className="my-5 rounded-xl border border-slate-200 bg-white p-4"
        onToggle={event => { if (event.currentTarget.open && !report && !busy) void run(load); }}>
        <summary className="cursor-pointer font-semibold">Estadísticas e informe por WhatsApp</summary>
        <p role="status" className="mt-2 text-sm">{notice || (busy ? "Actualizando…" : "")}</p>
        <button type="button" disabled={busy} onClick={() => void run(load)} className="my-2 min-h-11 rounded border px-3">Actualizar informe</button>
        {report && <>
            <h2 className="mt-3 font-semibold">Mes {day.slice(0, 7)}</h2>
            <p>{report.days.length} jornadas registradas · {completed} actividades completadas de {monthly.length} registradas · {total(monthly)} min</p>
            {[...byPerson].map(([person, minutes]) => <p key={person}>{person} · {minutes} min</p>)}
            <h2 className="mt-4 font-semibold">Informe del día</h2>
            {daily.length ? <pre className="my-2 whitespace-pre-wrap rounded bg-sky-50 p-3 text-sm">{message}</pre> : <p>Sin actividades guardadas para esta fecha.</p>}
            <h2 className="mt-4 font-semibold">Destinatarios inscritos</h2>
            {report.recipients.length === 0 && <p>Agrega a las personas que recibirán el informe.</p>}
            {report.recipients.map(person => <div key={person.phone} className="my-2 flex flex-wrap items-center gap-3">
                {daily.length ? <a href={`https://wa.me/${person.phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded bg-green-800 px-3 py-3 text-white">Abrir WhatsApp de {person.name}</a> : <span>{person.name}</span>}
                <button type="button" disabled={busy} onClick={() => void run(() => saveRecipient({ phone: person.phone, remove: true }))} className="min-h-11 rounded border px-3">Retirar</button>
            </div>)}
            <p className="my-2 text-sm">WhatsApp abre el borrador para que lo revises antes de enviarlo.</p>
            <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={event => {
                event.preventDefault();
                const form = event.currentTarget;
                const values = new FormData(form);
                void run(async () => {
                    await saveRecipient({ name: String(values.get("name")), phone: String(values.get("phone")) });
                    form.reset();
                });
            }}>
                <label className="grid gap-1 text-sm">Nombre<input name="name" required maxLength={100} className="w-36 rounded border p-2" /></label>
                <label className="grid gap-1 text-sm">WhatsApp con código de país<input name="phone" type="tel" placeholder="+56 9…" required maxLength={24} className="w-44 rounded border p-2" /></label>
                <button disabled={busy} className="min-h-11 rounded bg-sky-800 px-3 text-white">Inscribir</button>
            </form>
        </>}
    </details>;
}
