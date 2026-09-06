import { supabaseAdmin } from "@/lib/supabase-admin";

/** Store completion evidence only, without guests, URLs, credentials or response bodies. */
export async function observeJob(name: 'airbnb' | 'reporte' | 'meteo', run: () => Promise<Response>): Promise<Response> {
    let response: Response;
    try { response = await run(); }
    catch {
        response = Response.json({ error: "La tarea no pudo completarse" }, { status: 500 });
    }
    if (![401, 403].includes(response.status)) {
        const { error } = await supabaseAdmin.from('admin_access_logs').insert({
            email: 'sistema@domostreepod.cl',
            action: `job_${name}_${response.ok ? 'ok' : 'error'}`,
            details: `HTTP ${response.status}`,
        });
        if (error) console.error(`No se pudo registrar el resultado de la tarea ${name}`);
    }
    return response;
}
