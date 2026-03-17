"use client";

import { useRouter } from "next/navigation";
import { trackEvent } from "../lib/analytics";

export default function ModificarReserva({ reservaId }: { reservaId: string }) {
  const router = useRouter();

  async function modificar() {
    trackEvent("reserva_modificada");

    const res = await fetch("/api/reservas/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservaId }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "No se pudo cambiar la reserva.";
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
    <button onClick={modificar} className="text-sm text-gray-600 underline">
      Cambiar fechas
    </button>
  );
}
