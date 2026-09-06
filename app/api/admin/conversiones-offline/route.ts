import { supabaseAdmin } from '@/lib/supabase-admin';
import { getVerifiedAdmin } from '@/lib/admin-auth';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import { csvCell, isOfflineReviewCandidate } from '@/lib/offline-review';

export const dynamic = 'force-dynamic';

// Internal review template ONLY. Never join guest PII to guess a campaign.
// Not an upload-ready Google schema; consent, click age and deduplication require review.
export async function GET(request: Request) {
    const admin = await getVerifiedAdmin(request);
    if (!admin) return new Response('No autorizado', {status:401});
    if (!['admin','superadmin'].includes(admin.rol)) return new Response('Solo administradores', {status:403});
    const params = new URL(request.url).searchParams;
    const desde = params.get('desde') || '2026-01-01';
    const hasta = params.get('hasta') || new Date().toISOString().slice(0,10);
    const valid = (date:string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10)===date;
    if (!valid(desde) || !valid(hasta) || desde>hasta) return new Response('Fechas inválidas',{status:400});
    const end = new Date(Date.parse(hasta)+86400000).toISOString();
    try {
        const rows = await fetchAllPages((from,to)=>supabaseAdmin.from('reservas')
            .select('id,estado,total,monto_pagado,pagado_at,gclid,deleted_at,fuente')
            .is('deleted_at',null).eq('estado','pagado').not('gclid','is',null)
            .gte('pagado_at',`${desde}T00:00:00Z`).lt('pagado_at',end).order('id').range(from,to));
        const eligible = rows.filter(isOfflineReviewCandidate);
        const csv = [
            ['Reserva ID','Fecha pago UTC','Valor reserva','Moneda','Fuente técnica','GCLID registrado','Estado revisión'],
            ...eligible.map(r=>[r.id,r.pagado_at,r.total,'CLP',r.fuente,r.gclid,'PENDIENTE: consentimiento, fecha clic y duplicados']),
        ].map(row=>row.map(csvCell).join(',')).join('\r\n');
        return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'private, no-store',
            'Content-Disposition':`attachment; filename="revision-interna-NO-CARGAR-${desde}-${hasta}.csv"`,
            'X-Revision-Requerida':'true','X-Candidatas':String(eligible.length)}});
    } catch {
        return new Response('No se pudo preparar una exportación completa',{status:503});
    }
}
