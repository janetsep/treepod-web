import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";
import { trackServerPurchase } from "@/lib/server-analytics";
import { trackMetaConversion } from "@/lib/meta-capi";
import { recordConversion, extractClientInfo } from "@/lib/track-conversion";
import { createWebpayProvider, resolveWebpayReturn } from "@/lib/webpay-provider";

async function handleReturn(req: Request) {
  const requestUrl = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://domostreepod.cl' : requestUrl.origin);
  const review = () => NextResponse.redirect(new URL('/pago-en-revision',baseUrl),303);
  try {
    const params = req.method === 'POST' ? await req.formData() : requestUrl.searchParams;
    const normalToken = params.get('token_ws');
    const abortToken = params.get('TBK_TOKEN');
    const token = typeof normalToken === 'string' && normalToken ? normalToken : typeof abortToken === 'string' ? abortToken : null;
    if (!token || !/^[a-zA-Z0-9_-]{10,256}$/.test(token)) return review();
    // Internal binding only: never trust the reservation id supplied in a URL.
    const {data:attempt,error:attemptError} = await supabaseAdmin.from('webpay_intentos').select('reserva_id').eq('token',token).maybeSingle();
    if (attemptError) return review();
    const query = supabaseAdmin.from('reservas').select('*, domos(nombre)');
    const {data:reserva,error:reservaError} = await (attempt ? query.eq('id',attempt.reserva_id) : query.eq('payment_intent_id',token)).maybeSingle();
    if (reservaError || !reserva) return review();
    const commit = await resolveWebpayReturn(createWebpayProvider(),token,Boolean(normalToken));
    const {data:result,error:saveError} = await supabaseAdmin.rpc('confirmar_webpay_atomico',{p_token:token,p_respuesta:commit});
    if (saveError || !result || result.status !== 'registered') {
      if (result?.status === 'rejected') {
        const rejected = new URL('/confirmacion',baseUrl);
        rejected.searchParams.set('reserva_id',reserva.id);
        rejected.searchParams.set('status','FAILURE');
        return NextResponse.redirect(rejected,303);
      }
      return review();
    }
    const {data:reservaServicios} = await supabaseAdmin.from('reserva_servicios').select('servicios(nombre)').eq('reserva_id',reserva.id);
    const extrasNames = (reservaServicios || []).map((rs:any)=>rs.servicios?.nombre).filter(Boolean);
    // Existing notifications run only after the first durable confirmation.
    if (!result.repetido) {
      try {
        // Valor economico de la venta para GA4, Meta y Google Ads: el TOTAL de la
        // reserva, no el abono. Webpay cobra el 50% por diseno (regla del negocio,
        // ver montoEsperado mas arriba), pero si se le manda ese 50% a las
        // plataformas, cada venta les parece valer la mitad de lo que vale y
        // optimizan a la baja. Lo que se le cobra al cliente NO cambia: cambia
        // solo la cifra con la que los anuncios deciden a quien mostrarse.
        const valorVenta = Number(reserva.total) || commit.amount || 0;

        // 🎯 Lógica de Medición de Servidor (GA4 Measurement Protocol)
        // Se ejecuta ANTES del redirect para asegurar que el dato se envíe si el usuario cierra la pestaña
        try {
          await trackServerPurchase({
            transaction_id: token || reserva.id,
            value: valorVenta,
            currency: 'CLP',
            client_id: reserva.ga_client_id || undefined,
            check_in: reserva.fecha_inicio,
            check_out: reserva.fecha_fin,
            guests: reserva.adultos,
            dome_id: reserva.domo_id,
            dome_name: reserva.domos?.nombre,
            items: [{
              item_id: reserva.domo_id || 'reserva_treepod',
              item_name: reserva.domos?.nombre || 'Reserva TreePod',
              price: valorVenta,
              quantity: 1
            }]
          });
        } catch (analyticsError) {
          console.error("⚠️ Error disparando medición de servidor:", analyticsError);
        }

        // 📊 Meta Conversions API (CAPI) - CRÍTICO para Meta Ads optimization
        // Envía conversión directamente a Meta para que pueda optimizar las campañas
        try {
          const clientInfo = extractClientInfo(Object.fromEntries(req.headers));
          await trackMetaConversion({
            transaction_id: token || reserva.id,
            value: valorVenta,
            currency: 'CLP',
            content_name: 'Reserva TreePod',
            content_ids: ['reserva_treepod'],
            num_items: 1,
            email: reserva.email,
            first_name: reserva.nombre,
            last_name: reserva.apellido,
            event_source_url: `${baseUrl}/confirmacion`,
            ...clientInfo
          });
          console.log("🎯 Meta CAPI: Conversión enviada para optimización de anuncios");
        } catch (metaError) {
          console.error("⚠️ Error enviando a Meta CAPI:", metaError);
        }

        // 💾 Registrar conversión en Supabase (conversiones table)
        // Esto permite análisis histórico y atribución
        try {
          const clientInfo = extractClientInfo(Object.fromEntries(req.headers));
          await recordConversion({
            transaction_id: token || reserva.id,
            reserva_id: reserva.id,
            value: valorVenta,
            currency: 'CLP',
            conversion_type: 'purchase',
            source: reserva.utm_source || 'direct',
            utm_source: reserva.utm_source || undefined,
            utm_medium: reserva.utm_medium || undefined,
            utm_campaign: reserva.utm_campaign || undefined,
            utm_content: reserva.utm_content || undefined,
            utm_term: reserva.utm_term || undefined,
            user_agent: clientInfo.user_agent,
            ip_address: clientInfo.ip_address,
            conversion_timestamp: new Date().toISOString()
          });
          console.log("💾 Conversión registrada en Supabase para análisis");
        } catch (conversionError) {
          console.error("⚠️ Error registrando conversión en Supabase:", conversionError);
        }

        // Disparar Email de Bienvenida (Conserjería Digital)
        const guestName = `${reserva.nombre || 'Huésped'} ${reserva.apellido || ''}`.trim();
        // Nota: Fechas podrían formatearse mejor si tuviéramos date-fns, usaremos string simple por robustez
        const dateRange = `Check-in: ${reserva.fecha_inicio} | Check-out: ${reserva.fecha_fin}`;

        // Only send email if we have valid email address
        if (reserva.email?.trim()) {
          try {
            await NotificationService.sendWelcomeEmail(
              reserva.email,
              guestName,
              dateRange,
              "https://www.google.com/maps/search/?api=1&query=-36.9116,-71.5069",
              reserva.id.slice(-5),
              reserva.adultos,
              extrasNames,
              commit.amount || 0,
              reserva.total,
              reserva.id
            );
            console.log("📧 Email de bienvenida enviado exitosamente");
          } catch (emailError) {
            console.error("⚠️ Error enviando email de bienvenida:", emailError);
          }
        } else {
          console.warn("⚠️ No se pudo enviar email de bienvenida: email no disponible en la reserva", {
            reservaId: reserva.id,
            hasNombre: !!reserva.nombre,
            hasApellido: !!reserva.apellido
          });
        }

        // 📅 Sincronizar con Google Calendar (idempotente, no bloqueante)
        try {
          let domoNombre: string | null = null;
          if (reserva.domo_id) {
            const { data: d } = await supabaseAdmin
              .from("domos")
              .select("nombre")
              .eq("id", reserva.domo_id)
              .single();
            domoNombre = d?.nombre ?? null;
          }
          await NotificationService.syncReservaToCalendar({
            id: reserva.id,
            nombre: reserva.nombre,
            apellido: reserva.apellido,
            email: reserva.email,
            fecha_inicio: reserva.fecha_inicio,
            fecha_fin: reserva.fecha_fin,
            adultos: reserva.adultos,
            total: reserva.total,
            monto_pagado: commit.amount || 0,
            estado: "pagado",
            fuente: "web",
            domoNombre,
            extras: extrasNames,
          });
          console.log("📅 Reserva web sincronizada con Google Calendar");
        } catch (calErr) {
          console.error("⚠️ Error sincronizando reserva web con Google Calendar:", calErr);
        }

      } catch (error) {
        console.error("⚠️ Error crítico al registrar finanzas/notificación:", error);
        // No bloqueamos el redirect al usuario, pero logueamos el error grave
      }
    }

    const redirectUrl = new URL('/confirmacion',baseUrl);
    redirectUrl.searchParams.set('reserva_id',reserva.id);
    redirectUrl.searchParams.set('amount',String(result.monto));
    redirectUrl.searchParams.set('valor_venta',String(result.total));
    redirectUrl.searchParams.set('transaction_id',token);
    redirectUrl.searchParams.set('status','SUCCESS');
    return NextResponse.redirect(redirectUrl,303);
  } catch {
    console.error('WEBPAY_RETURN_REQUIRES_REVIEW');
    return review();
  }
}
export async function POST(req: Request) { return handleReturn(req); }
export async function GET(req: Request) { return handleReturn(req); }
