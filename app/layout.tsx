import type { Metadata } from 'next';
import { Fraunces, Figtree } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { Suspense } from 'react';
import AdminAwareLayout from './components/AdminAwareLayout';
import MicrosoftClarity from './components/MicrosoftClarity';
import AuthRecoveryRedirect from './components/AuthRecoveryRedirect';
import DebugGTM from './components/DebugGTM';
import UTMCapture from './components/UTMCapture';
import JsonLdSchemas from './components/JsonLdSchemas';


// Fraunces: serif suave y cálido para titulares (reemplaza Playfair, de alto
// contraste). Figtree: sans humanista y legible para el cuerpo (reemplaza Inter,
// que es una "grotesque" más fría). Se conservan los nombres de variable CSS
// (--font-playfair / --font-inter) para no tocar globals.css.
const playfair = Fraunces({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  // La itálica de Fraunces es "la voz" del sistema editorial (folios, pies de foto,
  // palabras clave). Sin declararla, el navegador sintetiza una cursiva falsa.
  style: ['normal', 'italic'],
});

const inter = Figtree({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://domostreepod.cl'),
  title: 'Glamping en Valle Las Trancas | Domos TreePod - Chillán',
  description: 'Domos geodésicos en el bosque nativo de Valle Las Trancas. Glamping cerca de Termas de Chillán y Nevados de Chillán. Reserva tu domo en TreePod.',
  keywords: ['glamping chile', 'glamping chillan', 'valle las trancas', 'alojamiento montaña', 'domos las trancas', 'treepod domos', 'glamping cerca de santiago', 'domos geodesicos chile', 'cabañas valle las trancas', 'termas de chillan alojamiento', 'glamping con tinaja', 'escapada romantica chile', 'donde alojar en las trancas', 'turismo nuble'],
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
    url: 'https://domostreepod.cl',
    siteName: 'TreePod Glamping',
    images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    locale: 'es_CL',
    type: 'website',
  },
  // Sin bloque twitter global: los metadatos twitter:* del root se heredaban en
  // todas las páginas internas mostrando el título del home al compartir en X.
  // Sin twitter:*, X/Twitter usa los og:* de cada página, que sí son correctos.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    // Las variables de fuente van en <html>: los alias --font-display/--font-sans
    // se declaran en :root (globals.css) y las custom properties resuelven sus
    // var() en el elemento donde se DECLARAN. Con las variables en <body>,
    // --font-display quedaba vacía y todos los .display-*/.folio/h1-h6 caían en
    // silencio a Figtree.
    <html lang="es" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
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

        {/*
          GA4 explícito para los eventos del embudo. GTM conserva la medición de
          páginas y las integraciones históricas; send_page_view:false evita que
          esta segunda vía duplique cada visita.
        */}
        {gaMeasurementId && (
          <>
            <Script
              id="google-analytics-library"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: false });
              `}
            </Script>
          </>
        )}

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
      <body suppressHydrationWarning className="antialiased">
        {/* Google Tag Manager (noscript) - Fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KFDWNCT"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

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
