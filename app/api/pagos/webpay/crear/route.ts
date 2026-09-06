import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createWebpayProvider, webpayApproved } from '@/lib/webpay-provider';

const review = () => NextResponse.json({error:'Estamos verificando tu pago. No vuelvas a pagar; contacta a TreePod si necesitas ayuda.',review:true,redirectUrl:'/pago-en-revision'},{status:409});

export async function POST(req: Request) {
  try {
    const {reservaId} = await req.json();
    if (typeof reservaId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reservaId)) return NextResponse.json({error:'Reserva inválida'},{status:400});
    const {data:reserva,error} = await supabaseAdmin.from('reservas').select('id,total,estado,monto_pagado,payment_intent_id').eq('id',reservaId).is('deleted_at',null).maybeSingle();
    if (error) return NextResponse.json({error:'No se pudo verificar la reserva'},{status:503});
    if (!reserva) return NextResponse.json({error:'Reserva no encontrada'},{status:404});
    if (reserva.estado === 'pagado' && Number(reserva.monto_pagado)>0) return NextResponse.json({alreadyPaid:true,redirectUrl:`/confirmacion?reserva_id=${reserva.id}&status=SUCCESS`});
    if (Number(reserva.monto_pagado)>0 || !['pendiente_pago','rechazado','expirada'].includes(reserva.estado)) return review();
    const provider = createWebpayProvider();
    if (reserva.payment_intent_id) {
      try {
        const status = await provider.status(reserva.payment_intent_id);
        if (webpayApproved(status)) return NextResponse.json({alreadyPaid:true,redirectUrl:`/api/pagos/webpay/retorno?token_ws=${encodeURIComponent(reserva.payment_intent_id)}`});
        const {data:attempt,error:attemptError} = await supabaseAdmin.from('webpay_intentos').select('url_pago,monto,total_reserva,estado').eq('token',reserva.payment_intent_id).eq('reserva_id',reserva.id).maybeSingle();
        if (attemptError || attempt?.estado === 'revision') return review();
        if (status.status === 'INITIALIZED' && attempt?.url_pago && Number(attempt.total_reserva)===Number(reserva.total)) return NextResponse.json({url:attempt.url_pago,token:reserva.payment_intent_id});
        // Unknown or reversed transactions require review, not a new charge.
        if (status.status !== 'FAILED') return review();
      } catch { return review(); }
    }
    const monto = Math.round(Number(reserva.total)*0.5);
    if (!Number.isSafeInteger(monto) || monto<=0) return review();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://domostreepod.cl' : new URL(req.url).origin);
    const returnUrl = new URL('/api/pagos/webpay/retorno',baseUrl).toString();
    const order = `r${reserva.id.slice(0,8)}-${crypto.randomUUID().replaceAll('-','').slice(0,12)}`;
    const response = await provider.create(monto,order,returnUrl);
    const {error:saveError} = await supabaseAdmin.rpc('registrar_intento_webpay',{
      p_reserva:reserva.id,p_token:response.token,p_orden:order,p_monto:monto,p_total:Number(reserva.total),p_url:response.url,p_previous:reserva.payment_intent_id,
    });
    // Never expose an unbound token, including simultaneous requests.
    if (saveError) return review();
    return NextResponse.json({...response,returnUrl,baseUrl});
  } catch {
    console.error('WEBPAY_CREATE_UNAVAILABLE');
    return NextResponse.json({error:'El pago no está disponible en este momento. Contacta a TreePod si ya intentaste pagar.'},{status:503});
  }
}
