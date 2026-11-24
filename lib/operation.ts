import tasks from "./operation-tasks.json";

export const operationTasks = tasks;
export type Entry = { steps: Record<string, boolean>; person: string; minutes: number; status: "" | "skip" };
export type OperationDay = { entries: Record<string, Entry>; revision: number };
export const emptyEntry: Entry = { steps: {}, person: "", minutes: 0, status: "" };
export const chileToday = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(new Date());

export function validDay(value: unknown): value is string {
    if (typeof value !== "string" || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T12:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseEntries(value: unknown): OperationDay["entries"] | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const result: OperationDay["entries"] = {};
    for (const [id, raw] of Object.entries(value)) {
        const task = tasks.find(task => task.id === id);
        if (!task || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
        const { steps, person, minutes, status } = raw;
        if (!steps || typeof steps !== "object" || Array.isArray(steps) ||
            typeof person !== "string" || person.length > 120 ||
            !Number.isInteger(minutes) || minutes < 0 || minutes > 1440 ||
            !["", "skip"].includes(status)) return null;
        const checks: Entry["steps"] = {};
        for (const [index, checked] of Object.entries(steps)) {
            if (!/^(0|[1-9]\d*)$/.test(index) || Number(index) >= task.steps.length || typeof checked !== "boolean") return null;
            checks[index] = checked;
        }
        result[id] = { steps: checks, person: person.trim(), minutes, status };
    }
    return result;
}
