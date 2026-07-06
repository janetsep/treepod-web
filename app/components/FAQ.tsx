"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";

// Contenido copiado de las políticas reales de producción (/terminos): horarios,
// cancelación, mascotas, pago, ubicación. Responder dudas al instante es la
// palanca #1 contra el abandono hacia las OTA.
const faqs: { q: string; a: string }[] = [
  {
    q: "¿Cuál es el horario de check-in y check-out?",
    a: "Check-in a partir de las 16:00 hrs y check-out hasta las 12:00 hrs. Si estimas llegar más tarde, avísanos para coordinar el acceso.",
  },
  {
    q: "¿Cómo reservo y cómo pago?",
    a: "Reservas online en pocos pasos. Pagas con Webpay/Transbank o transferencia electrónica. Para confirmar pagas un abono del 50% y el saldo lo pagas al momento del check-in. La reserva queda confirmada una vez verificado el pago.",
  },
  {
    q: "¿Cuál es la política de cancelación?",
    a: "Con más de 15 días de antelación al check-in puedes reembolsar o reprogramar según las condiciones contratadas, contactándonos directamente. Dentro de los 14 días previos o en caso de No-Show no aplica devolución. Una rebaja de noches cuenta como cancelación sobre esas noches. El detalle exacto queda en tu comprobante de reserva.",
  },
  {
    q: "¿Aceptan mascotas?",
    a: "Por ahora no recibimos mascotas. Lo decidimos pensando en el bienestar de los propios animales y en la tranquilidad del entorno: los domos no son un espacio adecuado para dejarlas solas. Gracias por tu comprensión.",
  },
  {
    q: "¿Qué incluye el domo?",
    a: "El domo viene totalmente equipado: cama cómoda, calefacción automática (cero humo, cero frío), baño privado, cocina equipada con cafetera Nespresso y WiFi Starlink. La tinaja caliente privada al aire libre es un adicional opcional de temporada: no opera en invierno y vuelve en primavera.",
  },
  {
    q: "¿Cómo llego a TreePod?",
    a: "Estamos en Ruta N-55, Km 72, Valle Las Trancas, Pinto, Región de Ñuble. Al confirmar tu reserva te enviamos la ubicación exacta y la mejor ruta para llegar sin problemas.",
  },
];

export default function FAQ() {
  const [abierto, setAbierto] = useState<number | null>(0);

  return (
    <section className="bg-surface-light py-16 md:py-24" id="faq">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-4 block">Antes de reservar</span>
          <h2 className="h2-display text-text-main">Preguntas frecuentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const open = abierto === i;
            return (
              <div key={i} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <button
                  onClick={() => setAbierto(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4 md:py-5"
                  aria-expanded={open}
                >
                  <span className="font-bold text-text-main text-[15px] md:text-base">{f.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 md:px-6 pb-5 text-text-sub leading-relaxed text-[14px] md:text-[15px]">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-text-sub mb-4 font-medium">¿Tienes otra consulta? Con gusto te ayudamos.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/56984643307"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Escríbenos por WhatsApp
            </a>
            <Link
              href="/terminos"
              className="inline-flex items-center text-text-sub font-semibold hover:text-primary px-4 py-3 transition-colors"
            >
              Ver términos y condiciones completos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
