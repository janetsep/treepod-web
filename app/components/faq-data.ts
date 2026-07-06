// Fuente única de verdad para las preguntas frecuentes del home.
// La usa el componente visible (FAQ.tsx) y el JSON-LD FAQPage (JsonLdSchemas.tsx),
// de modo que el markup estructurado siempre refleje el contenido visible,
// como exige Google para FAQPage.
// Contenido copiado de las políticas reales de producción (/terminos): horarios,
// cancelación, mascotas, pago, ubicación.
export const faqs: { q: string; a: string }[] = [
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
