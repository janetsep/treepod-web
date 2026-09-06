'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { trackEvent } from "../lib/analytics";

export default function PagarButton({
  reservaId,
  disabled = false,
  className,
  label,
}: {
  reservaId: string;
  disabled?: boolean;
  className?: string;
  label?: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [reservaTotal, setReservaTotal] = useState<number>(0);
  const [booking, setBooking] = useState<{
    domoId?: string;
    domoNombre?: string;
    entrada?: string;
    salida?: string;
    huespedes?: number;
  }>({});

  // Obtener total de la reserva para calcular el 50% en begin_checkout
  useEffect(() => {
    const fetchReservaTotal = async () => {
      try {
        const res = await fetch(`/api/reservas/obtener?id=${reservaId}`);
        const data = res.ok ? await res.json() : null;
        if (data?.total) {
          setReservaTotal(data.total);
          setBooking({
            domoId: data.domo_id,
            domoNombre: data.domos?.nombre,
            entrada: data.fecha_inicio,
            salida: data.fecha_fin,
            huespedes: data.adultos,
          });
        }
      } catch (error) {
        console.error('Error obteniendo total de reserva:', error);
      }
    };

    if (reservaId) {
      fetchReservaTotal();
    }
  }, [reservaId]);

  type WebpayCreateResponse = {
    url?: string;
    token?: string;
    returnUrl?: string;
    baseUrl?: string;
    error?: string;
    details?: string;
    alreadyPaid?: boolean;
    review?: boolean;
    redirectUrl?: string;
  };

  const redirectToWebpay = (url: string, token: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();

    // Limpiar formulario después de submit para evitar acumulación
    setTimeout(() => {
      if (form && form.parentNode) {
        form.parentNode.removeChild(form);
      }
    }, 100);
  };

  const pagarWebpay = async () => {
    let webpayHttpStatus = 0;
    try {
      if (!reservaId) {
        alert('No se encontró el ID de la reserva.');
        return;
      }

      trackEvent("click_pagar", { metodo: "webpay" });
      trackEvent("payment_started", { metodo: "webpay" });

      setIsLoading(true);
      const res = await fetch("/api/pagos/webpay/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservaId }),
      });
      webpayHttpStatus = res.status;

      const raw = await res.text();
      let data: WebpayCreateResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as WebpayCreateResponse) : null;
      } catch {
        data = null;
      }

      if (data?.review) {
        window.location.href = '/pago-en-revision';
        return;
      }
      if (!res.ok) {
        trackEvent("webpay_start_failed", {
          stage: "webpay_create",
          failure_reason: "http_error",
          http_status: res.status,
        });
        const message =
          data?.error ||
          data?.details ||
          `Error iniciando pago (HTTP ${res.status})`;
        alert(message);
        return;
      }

      if (data?.alreadyPaid && data?.redirectUrl) {
        trackEvent("webpay_redirect_started", {
          stage: "already_paid",
          value: reservaTotal,
          currency: "CLP",
        });
        window.location.href = data.redirectUrl;
        return;
      }

      if (data?.url && data?.token) {
        trackEvent("webpay_redirect_started", {
          stage: "token_created",
          value: reservaTotal,
          currency: "CLP",
        });
        if (data.returnUrl) {
          const currentOrigin = window.location.origin;
          if (!data.returnUrl.startsWith(currentOrigin)) {
            alert(
              `Webpay está configurado para retornar a:\n${data.returnUrl}\n\nPero tu web está en:\n${currentOrigin}\n\nEsto normalmente impide que el retorno llegue a tu app. Revisa NEXT_PUBLIC_BASE_URL o el puerto que estás usando.`
            );
          }
        }

        // Evento begin_checkout antes de salir a Webpay.
        trackEvent('begin_checkout', {
          reserva_id: reservaId,
          value: reservaTotal, // valor económico total, consistente con purchase
          deposit_value: Math.round(reservaTotal * 0.5),
          currency: 'CLP',
          check_in: booking.entrada,
          check_out: booking.salida,
          guests: booking.huespedes,
          dome_id: booking.domoId,
          dome_name: booking.domoNombre,
          items: [{
            item_id: booking.domoId || 'DOMO-GENERICO',
            item_name: booking.domoNombre || 'Domo TreePod',
            item_category: 'Glamping',
            price: reservaTotal,
            quantity: 1,
          }]
        });

        redirectToWebpay(data.url, data.token);
        return;
      }

      trackEvent("webpay_start_failed", {
        stage: "webpay_create",
        failure_reason: "missing_redirect_data",
        http_status: res.status,
      });
      alert(data?.error || 'Error iniciando pago');
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      trackEvent("webpay_start_failed", {
        stage: "webpay_create",
        failure_reason: webpayHttpStatus ? "response_parse_error" : "network_error",
        http_status: webpayHttpStatus,
      });
      alert("Error al procesar el pago. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={pagarWebpay}
      disabled={isLoading || disabled}
      className={
        className ??
        `px-4 py-2 rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        }`
      }
    >
      {isLoading ? 'Procesando...' : label ?? 'Pagar con Webpay'}
    </button>
  );
}
