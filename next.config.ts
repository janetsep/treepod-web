import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // pdfjs-dist debe cargarse desde node_modules en runtime (no bundleado),
  // para que su worker se resuelva correctamente en el servidor.
  serverExternalPackages: ['pdfjs-dist'],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // AVIF primero (≈30% más liviano que WebP), WebP de respaldo. next/image
    // sirve el formato moderno según el navegador → LCP y peso mucho menores.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'domostreepod.cl',
      },
      {
        protocol: 'https',
        hostname: 'www.domostreepod.cl',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      }
    ],
  },
  async rewrites() {
    return [
      // Airbnb requiere que la URL termine en .ics
      {
        source: '/api/calendar/:domoId.ics',
        destination: '/api/calendar/:domoId',
      },
    ];
  },
  async redirects() {
    return [
      // WWW to non-WWW redirects (SEO Fix)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.domostreepod.cl' }],
        destination: 'https://domostreepod.cl/:path*',
        permanent: true,
      },
      // Link corto para pedir reseñas por WhatsApp/tarjeta (campaña UGC)
      {
        source: '/resena',
        destination: 'https://search.google.com/local/writereview?placeid=ChIJLeBk77CVbpYROCttTaLeCpw',
        permanent: false,
      },
      // Existing redirects
      {
        source: '/domos-2',
        destination: '/domos',
        permanent: true,
      },
      {
        source: '/galeria/',
        destination: '/galeria',
        permanent: true,
      },
      {
        source: '/reservas',
        destination: '/disponibilidad',
        permanent: true,
      },
      {
        source: '/reserva',
        destination: '/disponibilidad',
        permanent: true,
      },
      // Antigravity fix - redirect home-4 to home
      {
        source: '/home-4',
        destination: '/',
        permanent: true,
      },
      // Eventos 2026 ya pasados (URL con año): redirect permanente
      {
        source: '/semana-santa-2026',
        destination: '/disponibilidad',
        permanent: true,
      },
      {
        source: '/mundial-mtb-nevados-chillan-2026',
        destination: '/disponibilidad',
        permanent: true,
      },
      // Eventos pasados con URL reutilizable el próximo año: redirect temporal
      // (para reactivar la página en 2027, basta eliminar el redirect)
      {
        source: '/glorias-navales-las-trancas',
        destination: '/disponibilidad',
        permanent: false,
      },
      {
        source: '/glamping-dia-de-la-madre',
        destination: '/disponibilidad',
        permanent: false,
      },
      {
        source: '/finde-largo-dia-trabajo-las-trancas',
        destination: '/disponibilidad',
        permanent: false,
      },
      // Otoño: fuera de temporada en invierno. Reactivar el próximo otoño
      // (abril–junio) eliminando este redirect.
      {
        source: '/otono-valle-las-trancas',
        destination: '/disponibilidad',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
