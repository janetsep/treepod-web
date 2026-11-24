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
    if (new URL(request.url).searchParams.get("vista") === "informe") {
        const first = day.slice(0, 7) + "-01";
        const next = new Date(first + "T12:00:00Z");
        next.setUTCMonth(next.getUTCMonth() + 1);
        const [days, recipients] = await Promise.all([
            supabaseAdmin.from("operation_days").select("day, entries").gte("day", first).lt("day", next.toISOString().slice(0, 10)).order("day"),
            supabaseAdmin.from("operation_recipients").select("name, phone").order("name"),
        ]);
        if (days.error || recipients.error) return response({ error: "No se pudo cargar el informe." }, 503);
        return response({ days: days.data, recipients: recipients.data });
    }
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


export async function POST(request: Request) {
    if (!await getVerifiedAdmin(request)) return response({ error: "Tu cuenta necesita permiso para editar." }, 403);
    const body = await request.json().catch(() => null);
    const phone = typeof body?.phone === "string" ? body.phone.replace(/[ +().-]/g, "") : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!/^[1-9][0-9]{7,14}$/.test(phone) || (body.remove !== true && (!name || name.length > 100))) {
        return response({ error: "Ingresa un nombre y un número internacional, por ejemplo +56 9 seguido de ocho dígitos." }, 400);
    }
    const table = supabaseAdmin.from("operation_recipients");
    const result = body.remove === true ? await table.delete().eq("phone", phone) : await table.upsert({ phone, name });
    if (result.error) return response({ error: "No se pudo actualizar el listado." }, 503);
    return response({ ok: true });
}
