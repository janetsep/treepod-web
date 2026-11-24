"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { chileToday, emptyEntry, operationTasks, parseEntries, validDay, type Entry, type OperationDay } from "@/lib/operation";

export default function Operacion() {
    const [day, setDay] = useState(chileToday);
    return <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 text-slate-900">
        <h1 className="mb-3 text-3xl font-bold">Operación TreePod</h1>
        <label className="flex flex-wrap items-center gap-3">Fecha
            <input aria-label="Fecha de la jornada" type="date" value={day}
                className="rounded-lg border border-slate-400 px-3 py-2"
                onChange={event => { if (event.target.value) setDay(event.target.value); }} />
        </label>
        <Jornada key={day} day={day} />
    </div>;
}

function Jornada({ day }: { day: string }) {
    const [snapshot, setSnapshot] = useState<OperationDay | null>(null);
    const [notice, setNotice] = useState("");
    const [departures, setDepartures] = useState<number | null>(null);
    const [pending, setPending] = useState<{ id: string; entry: Entry } | null>(null);
    const [taskFeedback, setTaskFeedback] = useState<{ id: string; state: "pending" | "saved" | "error"; savesTime: boolean } | null>(null);
    const inFlight = useRef(false);
    const [busy, setBusy] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const refresh = async () => {
            try {
                const result = await adminFetch("/api/admin/operacion?fecha=" + day, { signal: controller.signal });
                const data = await result.json();
                if (!result.ok) throw new Error(data.error);
                if (controller.signal.aborted) return;
                setSnapshot(current => current && current.revision > data.revision ? current : data);
                setDepartures(data.departures ?? null);
            } catch (error) {
                if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : "Sin conexión.");
            }
        };
        void refresh();
        const timer = window.setInterval(refresh, 15000);
        window.addEventListener("focus", refresh);
        return () => {
            controller.abort();
            window.clearInterval(timer);
            window.removeEventListener("focus", refresh);
        };
    }, [day, reload]);

    async function update(id: string, change: Partial<Entry>) {
        if (!snapshot || inFlight.current) return;
        inFlight.current = true;
        const entry = { ...(snapshot.entries[id] ?? emptyEntry), ...change };
        const savesTime = change.minutes !== undefined;
        setPending({ id, entry });
        setBusy(true);
        setNotice("Guardando…");
        setTaskFeedback({ id, state: "pending", savesTime });
        try {
            const entries = { ...snapshot.entries, [id]: entry };
            const result = await adminFetch("/api/admin/operacion", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ day, entries, revision: snapshot.revision }),
            });
            const data = await result.json();
            if (result.status === 409) setReload(value => value + 1);
            if (!result.ok) throw new Error(data.error);
            setSnapshot(current => current && current.revision > data.revision ? current : data);
            setNotice("Guardado");
            setTaskFeedback({ id, state: "saved", savesTime });
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Sin conexión. No se guardó el cambio.");
            setTaskFeedback({ id, state: "error", savesTime });
        } finally {
            inFlight.current = false;
            setPending(null);
            setBusy(false);
        }
    }

    async function importBackup(file: File) {
        if (!snapshot || inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setNotice("Importando respaldo…");
        let imported = 0;
        let omitted = 0;
        try {
            const backup = JSON.parse(await file.text());
            if (!backup?.days || typeof backup.days !== "object" || Array.isArray(backup.days)) {
                throw new Error("Selecciona un respaldo de TreePod Operación.");
            }
            for (const [date, records] of Object.entries(backup.days)) {
                if (!validDay(date) || !records || typeof records !== "object" || Array.isArray(records)) {
                    omitted++;
                    continue;
                }
                const current = await adminFetch("/api/admin/operacion?fecha=" + date);
                const remote = await current.json() as OperationDay & { error?: string };
                if (!current.ok) throw new Error(remote.error);
                const entries = { ...remote.entries };
                let added = 0;
                for (const [id, raw] of Object.entries(records)) {
                    if (Object.prototype.hasOwnProperty.call(entries, id) || !raw || typeof raw !== "object") {
                        omitted++;
                        continue;
                    }
                    const legacy = raw as Partial<Entry> & { previousStepCount?: number; previousSteps?: Entry["steps"] };
                    const task = operationTasks.find(task => task.id === id);
                    if (!task || (legacy.previousStepCount !== undefined && legacy.previousStepCount !== task.steps.length)) {
                        omitted++;
                        continue;
                    }
                    const parsed = parseEntries({ [id]: {
                        steps: legacy.previousSteps ?? legacy.steps ?? {},
                        person: legacy.person ?? "",
                        minutes: Number(legacy.minutes ?? 0),
                        status: legacy.status ?? "",
                    } });
                    if (!parsed) { omitted++; continue; }
                    entries[id] = parsed[id];
                    added++;
                }
                if (!added) continue;
                const result = await adminFetch("/api/admin/operacion", {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ day: date, entries, revision: remote.revision }),
                });
                if (!result.ok) throw new Error((await result.json()).error);
                imported += added;
            }
            setNotice(`Importación terminada: ${imported} actividades incorporadas, ${omitted} omitidas (duplicadas o incompatibles).`);
        } catch (error) {
            setNotice(`Importación detenida después de ${imported} actividades. ${error instanceof Error ? error.message : "Error de conexión."}`);
        } finally {
            inFlight.current = false;
            setBusy(false);
            setReload(value => value + 1);
        }
    }

    const weekday = new Date(day + "T12:00:00Z").getUTCDay();
    const visibleTasks = operationTasks.filter(task => task.id !== "pellet" ||
        (departures !== null && departures > 0) || Boolean(snapshot?.entries[task.id]));
    const scheduled = visibleTasks.filter(task => ["Mañana", "Tarde"].includes(task.group)
        || (task.id === "wash" && [1, 5].includes(weekday))
        || (task.id === "pellet" && departures !== null && departures > 0)
        || Boolean(snapshot?.entries[task.id]));
    const completed = scheduled.filter(task => {
        const entry = snapshot?.entries[task.id];
        return entry?.status !== "skip" && task.steps.every((_, i) => entry?.steps[i]);
    }).length;
    const applicable = scheduled.filter(task => snapshot?.entries[task.id]?.status !== "skip").length;
    const totals = new Map<string, number>();
    for (const entry of Object.values(snapshot?.entries ?? {})) {
        if (entry.minutes) totals.set(entry.person || "Sin responsable", (totals.get(entry.person || "Sin responsable") ?? 0) + entry.minutes);
    }

    const card = (task: typeof operationTasks[number]) => {
        const stored = snapshot?.entries[task.id] ?? emptyEntry;
        const entry = pending?.id === task.id ? pending.entry : stored;
        const historyOnly = task.id === "pellet" && !(departures !== null && departures > 0);
        const feedback = taskFeedback?.id === task.id ? taskFeedback.state : null;
        const timeState = taskFeedback?.savesTime ? feedback : null;
        const buttonLabels = { pending: "Guardando…", saved: "Guardado", error: "Reintentar guardado" };
        const count = task.steps.filter((_, i) => entry.steps[i]).length;
        return <details key={task.id} className="mb-3 rounded-xl border border-slate-200 bg-white px-4">
            <summary className="cursor-pointer py-4 font-semibold">{task.title}
                <span className="mt-1 block text-sm font-normal text-slate-600">{entry.status === "skip" ? "No aplica" : `${count} de ${task.steps.length} pasos`} · {task.frequency}</span>
            </summary>
            {feedback && <p role="status" className={`mb-2 text-sm ${feedback === "saved" ? "text-green-800" : feedback === "error" ? "text-red-700" : "text-slate-600"}`}>{feedback === "error" ? notice : buttonLabels[feedback]}</p>}
            {historyOnly && <p className="mb-2 text-sm text-slate-600">Registro de estufas. Edición disponible al haber una salida confirmada para esta fecha.</p>}
            <fieldset disabled={!snapshot || busy || historyOnly} className="pb-4">
                {task.steps.map((step, i) => <label key={i} className="flex min-h-12 items-start gap-3 border-t border-slate-100 py-3">
                    <input type="checkbox" checked={Boolean(entry.steps[i])} className="mt-1 h-5 w-5 shrink-0 accent-sky-700"
                        onChange={event => void update(task.id, { status: "", steps: { ...entry.steps, [i]: event.target.checked } })} />
                    <span>{step}</span>
                </label>)}
                <form key={JSON.stringify([stored.person, stored.minutes])} className="my-3 flex flex-wrap items-end gap-3"
                    onChange={() => { if (feedback) setTaskFeedback(null); }}
                    onSubmit={event => {
                        event.preventDefault();
                        const fields = new FormData(event.currentTarget);
                        void update(task.id, { person: String(fields.get("person")), minutes: Number(fields.get("minutes")) });
                    }}>
                    <label className="grid gap-1 text-sm">Responsable<input name="person" maxLength={120} defaultValue={stored.person} className="w-36 rounded border p-2" /></label>
                    <label className="grid gap-1 text-sm">Minutos<input name="minutes" type="number" min="0" max="1440" inputMode="numeric" placeholder="Min" defaultValue={stored.minutes || ""} className="w-20 rounded border p-2" /></label>
                    <button className={`min-h-11 rounded-lg px-4 text-white ${timeState === "saved" ? "bg-green-700" : timeState === "error" ? "bg-red-700" : timeState === "pending" ? "bg-slate-600" : "bg-sky-800"}`}>{timeState ? buttonLabels[timeState] : "Guardar tiempo"}</button>
                </form>
                <button type="button" className="min-h-11 rounded-lg border px-3"
                    onClick={() => void update(task.id, { status: entry.status === "skip" ? "" : "skip" })}>
                    {entry.status === "skip" ? "Volver a activar" : "No aplica"}
                </button>
            </fieldset>
        </details>;
    };

    return <>
        <p aria-live="polite" className="my-3 text-sm">{notice || (snapshot ? "Sincronización activa" : "Cargando jornada…")}</p>
        {snapshot && <>
            <div className="mb-5 rounded-xl bg-sky-50 p-4">
                <p className="font-semibold">{completed} de {applicable} actividades completadas</p>
                {[...totals].map(([name, minutes]) => <p key={name}>{name} · {minutes} min</p>)}
            </div>
            <h2 className="mb-3 text-xl font-bold">Tareas del día</h2>
            {departures === null && <p className="mb-3 text-sm text-slate-600">Salidas sin confirmar. La limpieza de estufas queda pendiente de verificación.</p>}
            {scheduled.map(card)}
            <details className="mt-6"><summary className="cursor-pointer py-3 text-lg font-semibold">Actividades adicionales</summary>
                {visibleTasks.filter(task => !scheduled.includes(task)).map(card)}
            </details>
            <details className="mt-6 border-t border-slate-200">
                <summary className="cursor-pointer py-3 font-semibold">Importar respaldo del Mac</summary>
                <form className="grid gap-3" onSubmit={event => {
                    event.preventDefault();
                    const file = new FormData(event.currentTarget).get("backup");
                    if (file instanceof File && file.size) void importBackup(file);
                }}>
                    <label className="grid gap-2 text-sm">Archivo de respaldo
                        <input type="file" name="backup" accept=".json,application/json" required disabled={busy} />
                    </label>
                    <button disabled={busy} className="min-h-11 w-fit rounded-lg bg-sky-800 px-4 text-white">Importar actividades</button>
                </form>
            </details>
        </>}
    </>;
}
