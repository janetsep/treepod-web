import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
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
  async redirects() {
    return [
      // WWW to non-WWW redirects (SEO Fix)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.domostreepod.cl' }],
        destination: 'https://domostreepod.cl/:path*',
        permanent: true,
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
    ];
  },
};

export default nextConfig;
