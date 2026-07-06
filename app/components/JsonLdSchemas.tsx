// Server Component: renderiza el JSON-LD directamente en el HTML (visible para Google y
// bots de IA sin ejecutar JS). Estático (sin llamadas a BD) para no penalizar la carga.

const LODGING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "TreePod Glamping",
  "description": "Domos geodésicos en el bosque nativo de Valle Las Trancas, cerca de Termas de Chillán y Nevados de Chillán.",
  "url": "https://domostreepod.cl",
  "telephone": "+56984643307",
  "email": "reservas@domostreepod.cl",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ruta N-55, Km 72, hacia Nevados de Chillán",
    "addressLocality": "Valle Las Trancas",
    "addressRegion": "Ñuble",
    "postalCode": "3780000",
    "addressCountry": "CL",
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "-36.905", "longitude": "-71.478" },
  "image": "https://domostreepod.cl/images/hero/domo-treepod-camara-18-2.jpg",
  "priceRange": "$$$",
  "starRating": { "@type": "Rating", "ratingValue": "4.9", "bestRating": "5" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "59", "bestRating": "5" },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "WiFi Starlink", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Tinaja de ciprés privada (servicio de temporada)", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Estufa a pellet automática", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cafetera Nespresso", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cocina equipada", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Estacionamiento privado", "value": true },
  ],
  "petsAllowed": false,
  "checkinTime": "16:00",
  "checkoutTime": "12:00",
  "numberOfRooms": 4,
  "currenciesAccepted": "CLP",
  "paymentAccepted": "Tarjeta de crédito, Transferencia bancaria, WebPay",
  "sameAs": ["https://www.instagram.com/domostreepod", "https://www.facebook.com/domostreepod"],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Dónde queda TreePod Glamping?",
      "acceptedAnswer": { "@type": "Answer", "text": "TreePod está en Valle Las Trancas, Ruta N-55, Km 72, hacia Nevados de Chillán, Región de Ñuble, Chile. A 72 km de Chillán y a unas 5,5 horas de Santiago." },
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta una noche en los domos?",
      "acceptedAnswer": { "@type": "Answer", "text": "Las tarifas para 2 personas varían según temporada y duración de la estadía. Los domos tienen capacidad para hasta 4 adultos. Consulta disponibilidad y precios en domostreepod.cl/disponibilidad." },
    },
    {
      "@type": "Question",
      "name": "¿Se aceptan mascotas en TreePod?",
      "acceptedAnswer": { "@type": "Answer", "text": "Por ahora no recibimos mascotas. Buscamos cuidar la tranquilidad del entorno y el bienestar de los propios animales, ya que los domos no son un espacio adecuado para dejarlos solos." },
    },
    {
      "@type": "Question",
      "name": "¿Qué incluye la estadía en TreePod?",
      "acceptedAnswer": { "@type": "Answer", "text": "Cada domo incluye baño privado, cocina equipada, cafetera Nespresso, WiFi Starlink, estufa a pellet automática, terraza privada y estacionamiento. La tinaja de ciprés caliente es un servicio adicional de temporada." },
    },
    {
      "@type": "Question",
      "name": "¿Hay WiFi en los domos?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sí, contamos con internet Starlink de alta velocidad. Perfecto para teletrabajar o ver películas sin cortes." },
    },
  ],
};

export default function JsonLdSchemas() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LODGING_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
    </>
  );
}
