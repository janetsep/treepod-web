import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { FinanceService } from "@/services/FinanceService";
import { NotificationService } from "@/services/NotificationService";
import { trackServerPurchase } from "@/lib/server-analytics";
import { trackMetaConversion } from "@/lib/meta-capi";
import { recordConversion, extractUTMParams, extractClientInfo } from "@/lib/track-conversion";

const config = {
  commerceCode: process.env.WEBPAY_COMMERCE_CODE || process.env.TRANSBANK_COMMERCE_CODE || "597055555532",
  apiKey: process.env.WEBPAY_API_KEY || process.env.TRANSBANK_API_KEY || "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
  environment: process.env.WEBPAY_ENV || process.env.TRANSBANK_ENVIRONMENT || "INTEGRATION",
  apiUrl: (process.env.WEBPAY_ENV === "PRODUCTION" || process.env.TRANSBANK_ENVIRONMENT === "PRODUCTION")
    ? "https://webpay3g.transbank.cl"
    : "https://webpay3gint.transbank.cl"
};

type WebpayCommitResponse = {
  vci?: string;
  amount?: number;
  status?: string;
  buy_order?: string;
  session_id?: string;
  card_detail?: { card_number?: string };
  accounting_date?: string;
  transaction_date?: string;
  authorization_code?: string;
  payment_type_code?: string;
  response_code?: number;
  installments_number?: number;
};

async function commitTransaction(token: string): Promise<WebpayCommitResponse> {
  const url = `${config.apiUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${encodeURIComponent(token)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Tbk-Api-Key-Id": config.commerceCode,
      "Tbk-Api-Key-Secret": config.apiKey,
    },
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
  }

  return JSON.parse(responseText) as WebpayCommitResponse;
}

function getBaseUrl(req: Request) {
  // En producción, siempre usar NEXT_PUBLIC_BASE_URL para que Transbank retorne al dominio correcto
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");

  if (host) {
    return `${proto}://${host}`;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  return new URL(req.url).origin;
}

async function handleReturn(req: Request) {
  const requestUrl = new URL(req.url);
  const baseUrl = getBaseUrl(req);

  console.log("📩 Webpay retorno recibido", {
    method: req.method,
    url: req.url,
    baseUrl,
    contentType: req.headers.get("content-type"),
    env: config.environment,
    commerceCode: config.commerceCode,
  });

  let token: string | null = null;
  const reservaId = requestUrl.searchParams.get("reserva_id");

  if (req.method === "POST") {
    const formData = await req.formData();
    const raw = formData.get("token_ws");
    token = typeof raw === "string" ? raw : null;

    const tbkToken = formData.get("TBK_TOKEN");
    if (!token && typeof tbkToken === "string" && tbkToken) {
      console.log("⚠️ Retorno con TBK_TOKEN (aborto/falla)", { tbkToken, reservaId });
      const target = reservaId ? `/reserva/${reservaId}?error=webpay_abort` : "/disponibilidad?error=webpay_abort";
      return NextResponse.redirect(new URL(target, baseUrl), 303);
    }
  } else {
    token = requestUrl.searchParams.get("token_ws");

    const tbkToken = requestUrl.searchParams.get("TBK_TOKEN");
    if (!token && tbkToken) {
      console.log("⚠️ Retorno con TBK_TOKEN (aborto/falla)", { tbkToken, reservaId });
      const target = reservaId ? `/reserva/${reservaId}?error=webpay_abort` : "/disponibilidad?error=webpay_abort";
      return NextResponse.redirect(new URL(target, baseUrl), 303);
    }
  }

  if (!token) {
    console.log("❌ Retorno sin token_ws", { reservaId });
    const target = reservaId ? `/reserva/${reservaId}?error=missing_token` : "/disponibilidad?error=missing_token";
    return NextResponse.redirect(new URL(target, baseUrl), 303);
  }

  try {
    const commit = await commitTransaction(token);
    console.log("✅ Webpay commit OK", {
      token,
      status: commit.status,
      response_code: commit.response_code,
      amount: commit.amount,
    });

    const { data: reserva, error: reservaError } = await supabaseAdmin
      .from("reservas")
      .select("id, total, domo_id, nombre, apellido, email, fecha_inicio, fecha_fin, adultos")
      .eq("payment_intent_id", token)
      .single();

    if (reservaError || !reserva) {
      console.log("❌ No se encontró reserva por payment_intent_id", {
        token,
        reservaError: reservaError?.message,
      });
      return NextResponse.redirect(new URL("/disponibilidad?error=reserva_no_encontrada", baseUrl), 303);
    }

    const { data: reservaServicios } = await supabaseAdmin
      .from("reserva_servicios")
      .select("servicios(nombre)")
      .eq("reserva_id", reserva.id);

    const extrasNames = (reservaServicios || [])
      .map((rs: any) => rs.servicios?.nombre)
      .filter(Boolean);

    const isApproved = commit.response_code === 0;

    // Actualizar estado de la reserva
    const { error: dbUpdateError } = await supabaseAdmin
      .from("reservas")
      .update({
        estado: isApproved ? "pagado" : "rechazado",
        monto_pagado: isApproved ? commit.amount ?? null : 0,
        numero_transaccion: isApproved ? token : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reserva.id);

    if (dbUpdateError) {
      console.error("❌ CRÍTICO: Webpay cobró pero falló update en Supabase:", dbUpdateError);
      // Ojo: Si ya cobró, ¡el cliente confía en que pagó!
    }

    // Si el pago es exitoso, registrar en finanzas via FinanceService
    if (isApproved) {
      try {
        await FinanceService.registrarMovimiento({
          tipo: 'ingreso',
          categoria: 'reservas',
          monto: commit.amount || 0,
          reserva_id: reserva.id,
          domo_id: reserva.domo_id,
          metodo_pago: 'webpay',
          transaccion_id: token,
          descripcion: `Reserva Webpay confirmada - Orden: ${commit.buy_order}`,
          tributario: true,
          dte_emitido: false,
          revisado_contabilidad: false,
          clasificacion_tributaria: 'ingreso_boleteado'
        });
        console.log("💰 Movimiento financiero registrado exitosamente via FinanceService");

        // 🎯 Lógica de Medición de Servidor (GA4 Measurement Protocol)
        // Se ejecuta ANTES del redirect para asegurar que el dato se envíe si el usuario cierra la pestaña
        try {
          await trackServerPurchase({
            transaction_id: token || reserva.id,
            value: commit.amount || 0,
            currency: 'CLP',
            items: [{
              item_id: 'reserva_treepod',
              item_name: 'Reserva TreePod',
              price: commit.amount || 0,
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
          const utmParams = extractUTMParams(Object.fromEntries(req.headers));

          await trackMetaConversion({
            transaction_id: token || reserva.id,
            value: commit.amount || 0,
            currency: 'CLP',
            content_name: 'Reserva TreePod',
            content_ids: ['reserva_treepod'],
            num_items: 1,
            email: reserva.email,
            first_name: reserva.nombre,
            last_name: reserva.apellido,
            event_source_url: 'https://www.domostreepod.cl/confirmacion',
            ...clientInfo,
            ...utmParams
          });
          console.log("🎯 Meta CAPI: Conversión enviada para optimización de anuncios");
        } catch (metaError) {
          console.error("⚠️ Error enviando a Meta CAPI:", metaError);
        }

        // 💾 Registrar conversión en Supabase (conversiones table)
        // Esto permite análisis histórico y atribución
        try {
          const clientInfo = extractClientInfo(Object.fromEntries(req.headers));
          const utmParams = extractUTMParams(Object.fromEntries(req.headers));

          await recordConversion({
            transaction_id: token || reserva.id,
            reserva_id: reserva.id,
            value: commit.amount || 0,
            currency: 'CLP',
            conversion_type: 'purchase',
            source: utmParams.utm_source || 'direct',
            utm_source: utmParams.utm_source,
            utm_medium: utmParams.utm_medium,
            utm_campaign: utmParams.utm_campaign,
            utm_content: utmParams.utm_content,
            utm_term: utmParams.utm_term,
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
              reserva.total
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

      } catch (error) {
        console.error("⚠️ Error crítico al registrar finanzas/notificación:", error);
        // No bloqueamos el redirect al usuario, pero logueamos el error grave
      }
    }

    // Redirigir a página de confirmación (dispara evento purchase)
    const redirectUrl = new URL('/confirmacion', baseUrl);
    redirectUrl.searchParams.set('reserva_id', reserva.id);
    redirectUrl.searchParams.set('amount', String(commit.amount || reserva.total));
    redirectUrl.searchParams.set('transaction_id', token);
    redirectUrl.searchParams.set('status', isApproved ? 'SUCCESS' : 'FAILURE');

    return NextResponse.redirect(redirectUrl, 303);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("❌ Error en handleReturn:", message);
    const redirectUrl = new URL("/disponibilidad", baseUrl);
    redirectUrl.searchParams.set("error", "webpay_commit");
    if (process.env.NODE_ENV === "development") {
      redirectUrl.searchParams.set("details", message);
    }
    return NextResponse.redirect(redirectUrl, 303);
  }
}

export async function POST(req: Request) {
  return handleReturn(req);
}

export async function GET(req: Request) {
  return handleReturn(req);
}
