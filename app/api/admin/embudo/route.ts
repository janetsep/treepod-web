import {NextResponse} from 'next/server';
import {GoogleAuth} from 'google-auth-library';
import {getVerifiedAdmin} from '@/lib/admin-auth';
import {supabaseAdmin} from '@/lib/supabase-admin';
import {fetchGaBookingFunnel, reportPeriod, summarizePayments, type Attempt} from '@/lib/booking-funnel';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!await getVerifiedAdmin(request)) return NextResponse.json({error:'No autorizado'},{status:401});
  let period;
  try { period = reportPeriod(new URL(request.url).searchParams); }
  catch (error) {return NextResponse.json({error: error instanceof Error ? error.message : 'Periodo inválido'},{status:400});}
  const warnings: string[] = [];
  const [gaResult,paymentResult] = await Promise.allSettled([
    (async () => {
      const email=process.env.GOOGLE_CLIENT_EMAIL?.trim();
      const key=process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n');
      if (!email || !key) throw new Error('Missing GA credentials');
      const client=await new GoogleAuth({credentials:{client_email:email,private_key:key},scopes:['https://www.googleapis.com/auth/analytics.readonly']}).getClient();
      return fetchGaBookingFunnel(client,period);
    })(),
    (async () => {
      // Query two disjoint time predicates via OR, paginate without a silent 1000-row cap.
      const attempts: Attempt[]=[];
      for (let offset=0; ; offset+=500) {
        const {data,error}=await supabaseAdmin.from('webpay_intentos')
          .select('reserva_id,estado,monto,total_reserva,created_at,updated_at,reservas!inner(estado,total,monto_pagado,deleted_at,fuente,metadata)')
          .or(`and(created_at.gte.${period.from},created_at.lt.${period.until}),and(updated_at.gte.${period.from},updated_at.lt.${period.until})`)
          .order('created_at').order('token').range(offset,offset+499);
        if (error || !data) throw new Error('Payment read failed');
        attempts.push(...data as unknown as Attempt[]);
        if (data.length<500) break;
        if (offset>=19500) throw new Error('Payment report too large');
      }
      return summarizePayments(attempts,period);
    })(),
  ]);
  const ga=gaResult.status==='fulfilled'?gaResult.value:null;
  const payments=paymentResult.status==='fulfilled'?paymentResult.value:null;
  if (!ga) warnings.push('No se pudo consultar GA4. Sin datos no significa cero personas. Reintenta.');
  if (ga && !ga.sequenceAvailable) warnings.push('La secuencia de abandono no está disponible. Los totales por etapa siguen disponibles; no se calculan abandonos restándolos.');
  if (!payments) warnings.push('No se pudieron verificar los pagos. Sin datos no significa cero ventas.');
  return NextResponse.json({period,fetchedAt:new Date().toISOString(),ga,payments,warnings},{status:ga||payments?200:503,headers:{'Cache-Control':'private, no-store'}});
}
