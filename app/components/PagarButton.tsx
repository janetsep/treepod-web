'use client';

import { useState, type ReactNode } from 'react';
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

  type WebpayCreateResponse = {
    url?: string;
    token?: string;
    returnUrl?: string;
    baseUrl?: string;
    error?: string;
    details?: string;
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
  };

  const pagarWebpay = async () => {
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

      const raw = await res.text();
      let data: WebpayCreateResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as WebpayCreateResponse) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message =
          data?.error ||
          data?.details ||
          `Error iniciando pago (HTTP ${res.status})`;
        alert(message);
        return;
      }

      if (data?.url && data?.token) {
        if (data.returnUrl) {
          const currentOrigin = window.location.origin;
          if (!data.returnUrl.startsWith(currentOrigin)) {
            alert(
              `Webpay está configurado para retornar a:\n${data.returnUrl}\n\nPero tu web está en:\n${currentOrigin}\n\nEsto normalmente impide que el retorno llegue a tu app. Revisa NEXT_PUBLIC_BASE_URL o el puerto que estás usando.`
            );
          }
        }

        trackEvent("begin_checkout", { metodo: "webpay", reserva_id: reservaId });

        redirectToWebpay(data.url, data.token);
        return;
      }

      alert(data?.error || 'Error iniciando pago');
    } catch (error) {
      console.error("Error al procesar el pago:", error);
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
