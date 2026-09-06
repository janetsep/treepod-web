import {getVerifiedAdmin} from '@/lib/admin-auth';
import {supabaseAdmin} from '@/lib/supabase-admin';
import {createWebpayProvider} from '@/lib/webpay-provider';

export const dynamic = 'force-dynamic';
async function authorized(request:Request) {
  const admin=await getVerifiedAdmin(request);
  return admin && ['admin','superadmin'].includes(admin.rol) ? admin : null;
}
export async function GET(request:Request) {
  if (!await authorized(request)) return Response.json({error:'No autorizado'},{status:401});
  const {data,error}=await supabaseAdmin.from('webpay_intentos').select('reserva_id,orden,monto,estado,motivo,created_at,updated_at').in('estado',['pendiente','revision']).order('created_at',{ascending:false}).limit(100);
  if(error) return Response.json({error:'No se pudieron consultar los pagos pendientes'},{status:503});
  return Response.json({items:data,limit:100},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(request:Request) {
  const admin=await authorized(request);
  if(!admin) return Response.json({error:'No autorizado'},{status:401});
  try {
    const {reserva_id,orden}=await request.json();
    if(typeof reserva_id!=='string' || !/^[0-9a-f-]{36}$/i.test(reserva_id) || typeof orden!=='string' || orden.length>26) return Response.json({error:'Referencia inválida'},{status:400});
    const {data:attempt,error}=await supabaseAdmin.from('webpay_intentos').select('token').eq('reserva_id',reserva_id).eq('orden',orden).maybeSingle();
    if(error || !attempt) return Response.json({error:'Intento no disponible para revisión'},{status:404});
    // Recovery is GET-only at Transbank: no new charge, commit, refund or external notifications.
    const receipt=await createWebpayProvider().status(attempt.token);
    const {data:result,error:saveError}=await supabaseAdmin.rpc('confirmar_webpay_atomico',{p_token:attempt.token,p_respuesta:receipt});
    if(saveError || !result) return Response.json({error:'No se pudo registrar el resultado. No solicites otro pago.'},{status:503});
    await supabaseAdmin.from('admin_access_logs').insert({email:admin.email,action:'webpay_reviewed',details:JSON.stringify({reserva_id,status:result.status})});
    return Response.json({status:result.status},{headers:{'Cache-Control':'private, no-store'}});
  } catch {
    return Response.json({error:'Transbank no permitió comprobar el estado. Revisa el portal del comercio; no solicites otro pago sin comprobarlo.'},{status:503});
  }
}
