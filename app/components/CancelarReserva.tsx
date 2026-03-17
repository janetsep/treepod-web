"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "../lib/analytics";

export default function CancelarReserva({ reservaId }: { reservaId: string }) {
  const router = useRouter();

  async function cancelar() {
    if (!confirm("¿Quieres cancelar esta reserva?")) return;

    trackEvent("reserva_cancelada");

    const res = await fetch("/api/reservas/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservaId }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "No se pudo cancelar la reserva.";
      try {
        const json = JSON.parse(text) as { error?: string };
        if (json?.error) message = json.error;
      } catch {
        // ignore
      }
      alert(message);
      return;
    }

    router.push("/disponibilidad");
  }

  return (
    <button onClick={cancelar} className="text-sm text-gray-600 underline">
      Cancelar reserva
    </button>
  );
}
