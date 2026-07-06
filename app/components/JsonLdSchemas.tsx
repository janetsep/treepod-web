// Server Component: renderiza el JSON-LD directamente en el HTML (visible para Google y
// bots de IA sin ejecutar JS). Estático (sin llamadas a BD) para no penalizar la carga.

import { faqs } from "./faq-data";

const LODGING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  // @id común: las landings SEO (glamping-valle-las-trancas, domos-geodesicos-chillan)
  // referencian esta misma entidad para que Google no vea negocios contradictorios.
  "@id": "https://domostreepod.cl/#lodging",
  "name": "TreePod Glamping",
  "description": "Domos geodésicos en el bosque nativo de Valle Las Trancas, cerca de Termas de Chillán y Nevados de Chillán.",
  "url": "https://domostreepod.cl",
  "telephone": "+56984643307",
  "email": "info@domostreepod.cl",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ruta N-55, Km 72, hacia Nevados de Chillán",
    "addressLocality": "Valle Las Trancas",
    "addressRegion": "Ñuble",
    "postalCode": "3780000",
    "addressCountry": "CL",
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "-36.9116", "longitude": "-71.5069" },
  "image": "https://domostreepod.cl/images/hero/domo-treepod-camara-18-2.jpg",
  "priceRange": "$$",
  // Sin starRating: en schema.org es la clasificación oficial del establecimiento
  // (estrellas de hotel), no el promedio de reseñas; eso va en aggregateRating.
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "209", "bestRating": "5" },
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

// FAQPage generado desde las mismas preguntas visibles del home (FAQ.tsx vía
// faq-data.ts). Se renderiza SOLO en el home (app/page.tsx), porque Google exige
// que el markup FAQPage refleje contenido visible de la página donde aparece.
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a },
  })),
};

export function FaqJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
  );
}

export default function JsonLdSchemas() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LODGING_SCHEMA) }} />
  );
}
