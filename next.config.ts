import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
