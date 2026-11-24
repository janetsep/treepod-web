import { NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { chileToday, parseEntries, validDay } from "@/lib/operation";

const response = (body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
    if (!await getVerifiedAdmin(request)) return response({ error: "Inicia sesión en TreePod Admin." }, 401);
    const day = new URL(request.url).searchParams.get("fecha") ?? chileToday();
    if (!validDay(day)) return response({ error: "Fecha inválida." }, 400);
    const [operation, departures] = await Promise.all([
        supabaseAdmin.from("operation_days").select("entries, revision").eq("day", day).maybeSingle(),
        supabaseAdmin.from("reservas").select("domo_id", { count: "exact", head: true })
            .is("deleted_at", null).is("cancelled_at", null).not("domo_id", "is", null)
            .eq("fecha_fin", day)
            .in("estado", ["pagado", "confirmado", "completada", "completado"]),
    ]);
    if (operation.error) return response({ error: "No se pudo consultar la jornada." }, 503);
    return response({
        ...(operation.data ?? { entries: {}, revision: 0 }),
        departures: departures.error ? null : departures.count,
    });
}

export async function PUT(request: Request) {
    if (!await getVerifiedAdmin(request)) return response({ error: "Tu cuenta necesita permiso para editar." }, 403);
    const body = await request.json().catch(() => null);
    const entries = parseEntries(body?.entries);
    if (!validDay(body?.day) || !entries || !Number.isSafeInteger(body.revision) ||
        body.revision < 0 || body.revision >= 2147483647) return response({ error: "Registro inválido." }, 400);

    const { day, revision } = body;
    const table = supabaseAdmin.from("operation_days");
    const { data, error } = revision === 0
        ? await table.insert({ day, entries }).select("entries, revision").single()
        : await table.update({ entries, revision: revision + 1, updated_at: new Date().toISOString() })
            .eq("day", day).eq("revision", revision).select("entries, revision").maybeSingle();

    if (error?.code === "23505" || (!data && !error)) {
        return response({ error: "Otra persona actualizó esta jornada. Carga la última versión y vuelve a marcar." }, 409);
    }
    if (error) return response({ error: "No se pudo guardar. Vuelve a intentarlo." }, 503);
    return response(data);
}
