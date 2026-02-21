import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Inter, Plus_Jakarta_Sans, Noto_Sans } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import AdminAwareLayout from './components/AdminAwareLayout';
import MicrosoftClarity from './components/MicrosoftClarity';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TreePod | Refugio de Montaña en Valle Las Trancas',
  description: 'Tu pausa en el bosque nativo. Domos TreePod en Valle Las Trancas para vivir la montaña auténtica y descansar de verdad. Reserva tu refugio.',
  keywords: ['glamping chillan', 'valle las trancas', 'alojamiento montaña', 'domos las trancas', 'treepod refugio'],
  openGraph: {
    title: 'TreePod | Refugio de Montaña en Valle Las Trancas',
    description: 'Recupera tu energía real. Domos inmersos en el bosque para vivir la montaña auténtica.',
    images: ['/images/hero/interior-domo-acogedor-105-2.jpg'],
    locale: 'es_CL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>

        {/* Google Tag Manager - Base Code */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
            `}
          </Script>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} ${plusJakarta.variable} ${notoSans.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) - Fallback */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {/* Scripts Globales de Terceros */}
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />

        {/* AdminAwareLayout gestiona la UI según la ruta (Admin vs Web) */}
        <AdminAwareLayout>
          {children}
        </AdminAwareLayout>
        <MicrosoftClarity />

        {/* Aura: Global Film Grain Texture for Premium Feel */}
        <div className="fixed inset-0 z-[40] pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </body>
    </html>
  );
}
