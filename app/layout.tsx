import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { Suspense } from 'react';
import AdminAwareLayout from './components/AdminAwareLayout';
import MicrosoftClarity from './components/MicrosoftClarity';
import AuthRecoveryRedirect from './components/AuthRecoveryRedirect';
import DebugGTM from './components/DebugGTM';
import UTMCapture from './components/UTMCapture';
import CanonicalURL from './components/CanonicalURL';
import JsonLdSchemas from './components/JsonLdSchemas';


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

export const metadata: Metadata = {
  metadataBase: new URL('https://domostreepod.cl'),
  title: 'Glamping en Valle Las Trancas | Domos TreePod - Chillán',
  description: 'Domos geodésicos en el bosque nativo de Valle Las Trancas. Glamping cerca de Termas de Chillán y Nevados de Chillán. Reserva tu refugio hoy.',
  keywords: ['glamping chile', 'glamping chillan', 'valle las trancas', 'alojamiento montaña', 'domos las trancas', 'treepod refugio', 'glamping cerca de santiago', 'domos geodesicos chile', 'cabañas valle las trancas', 'termas de chillan alojamiento', 'glamping con tinaja', 'escapada romantica chile', 'donde alojar en las trancas', 'turismo nuble'],
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Glamping en Valle Las Trancas | Domos TreePod',
    description: 'Domos geodésicos en el bosque nativo de Valle Las Trancas. Glamping cerca de Termas de Chillán y Nevados de Chillán.',
    images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glamping en Valle Las Trancas | Domos TreePod',
    description: 'Domos geodésicos en el bosque nativo de Valle Las Trancas. Glamping cerca de Termas de Chillán y Nevados de Chillán.',
    images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KFDWNCT');
          `}
        </Script>

        {/* Meta Pixel - Tracking Conversiones */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2854221251389085');
            fbq('track', 'PageView');
            console.log('🟢 Meta Pixel initialized: 2854221251389085');
          `}
        </Script>
      </head>
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${inter.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) - Fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KFDWNCT"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Scripts Globales de Terceros */}
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />

        {/* UTM Capture — captura parámetros de campaña al llegar al sitio */}
        <Suspense fallback={null}>
          <UTMCapture />
        </Suspense>

        {/* Datos estructurados (JSON-LD) en el HTML para Google y bots de IA */}
        <JsonLdSchemas />

        {/* AdminAwareLayout gestiona la UI según la ruta (Admin vs Web) */}
        <AuthRecoveryRedirect />
        {process.env.NODE_ENV === 'development' && <DebugGTM enabled={true} />}
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
