'use client';

import { useEffect } from 'react';

const JsonLdSchemas = () => {
  useEffect(() => {
    // Only add schemas on client side to avoid hydration mismatch
    const addSchema = (id: string, schema: object) => {
      if (document.getElementById(id)) return; // Schema already exists

      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // Add LodgingBusiness schema
    addSchema('schema-lodging-business', {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": "TreePod Glamping",
      "description": "Domos geodésicos con tinaja privada en el bosque nativo de Valle Las Trancas, cerca de Termas de Chillán.",
      "url": "https://domostreepod.cl",
      "telephone": "+56984643307",
      "email": "reservas@domostreepod.cl",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Ruta N-55 km 71 hacia Nevados de Chillan",
        "addressLocality": "Valle Las Trancas",
        "addressRegion": "Ñuble",
        "postalCode": "3780000",
        "addressCountry": "CL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "-36.905",
        "longitude": "-71.478"
      },
      "image": "https://domostreepod.cl/images/hero/domo-treepod-ok-12.jpg",
      "priceRange": "$$$",
      "starRating": {
        "@type": "Rating",
        "ratingValue": "4.9",
        "bestRating": "5"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "47",
        "bestRating": "5"
      },
      "amenityFeature": [
        {"@type": "LocationFeatureSpecification", "name": "WiFi Starlink", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Tinaja de ciprés privada", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Pet Friendly", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Estufa a pellet automática", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Cafetera Nespresso", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Cocina equipada", "value": true},
        {"@type": "LocationFeatureSpecification", "name": "Estacionamiento privado", "value": true}
      ],
      "petsAllowed": true,
      "checkinTime": "15:00",
      "checkoutTime": "15:00",
      "numberOfRooms": 3,
      "currenciesAccepted": "CLP",
      "paymentAccepted": "Tarjeta de crédito, Transferencia bancaria, WebPay",
      "sameAs": [
        "https://www.instagram.com/domostreepod",
        "https://www.facebook.com/domostreepod"
      ]
    });

    // Add FAQPage schema
    addSchema('schema-faq-page', {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Dónde queda TreePod Glamping?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TreePod está en Valle Las Trancas, ruta N-55 km 71 hacia Nevados de Chillan, Región de Ñuble, Chile. A 72 km de Chillán y a unas 5.5 horas de Santiago."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cuánto cuesta una noche en los domos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La tarifa base para 2 personas es de $145.000 CLP por noche. Los domos tienen capacidad para hasta 4 adultos."
          }
        },
        {
          "@type": "Question",
          "name": "¿Se aceptan mascotas en TreePod?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí, TreePod es Pet Friendly. Tu mascota es bienvenida siguiendo las normas de convivencia del glamping."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué incluye la estadía en TreePod?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cada domo incluye baño privado, cocina equipada, cafetera Nespresso, WiFi Starlink, estufa a pellet automática, terraza privada y estacionamiento. La tinaja de ciprés caliente es un servicio adicional."
          }
        },
        {
          "@type": "Question",
          "name": "¿Hay WiFi en los domos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí, contamos con internet Starlink de alta velocidad. Perfecto para teletrabajar o ver películas sin cortes."
          }
        }
      ]
    });

    // Cleanup function para remover schemas al desmontar
    return () => {
      // Verificar que el documento existe y no estamos en SSR
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        try {
          const schemaLodging = document.getElementById('schema-lodging-business');
          if (schemaLodging && schemaLodging.parentNode && document.contains(schemaLodging)) {
            schemaLodging.parentNode.removeChild(schemaLodging);
          }

          const schemaFaq = document.getElementById('schema-faq-page');
          if (schemaFaq && schemaFaq.parentNode && document.contains(schemaFaq)) {
            schemaFaq.parentNode.removeChild(schemaFaq);
          }
        } catch (error) {
          // Silenciosamente ignorar errores de cleanup durante navegación
          console.warn('Schema cleanup error (safe to ignore):', error);
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default JsonLdSchemas;