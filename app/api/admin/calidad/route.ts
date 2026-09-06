import { getVerifiedAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    const admin = await getVerifiedAdmin(request);
    if (!admin) return Response.json({ error: 'No autorizado' }, { status: 401 });
    if (!['admin','superadmin'].includes(admin.rol)) return Response.json({ error: 'Se requiere perfil administrador' }, { status: 403 });
    const year = Number(new URL(request.url).searchParams.get('year') || new Intl.DateTimeFormat('en', {year:'numeric',timeZone:'America/Santiago'}).format(new Date()));
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return Response.json({ error: 'Año inválido' }, { status: 400 });
    const { data, error } = await supabaseAdmin.rpc('admin_quality_report', { p_year: year });
    if (error) return Response.json({ error: 'No se pudo comprobar la calidad de los datos' }, { status: 503 });
    return Response.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
