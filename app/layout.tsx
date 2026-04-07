import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Inter, Plus_Jakarta_Sans, Noto_Sans } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import AdminAwareLayout from './components/AdminAwareLayout';
import MicrosoftClarity from './components/MicrosoftClarity';
import AuthRecoveryRedirect from './components/AuthRecoveryRedirect';
import DebugGTM from './components/DebugGTM';


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
  metadataBase: new URL('https://domostreepod.cl'),
  title: 'Glamping en Valle Las Trancas | Domos TreePod - Chillán',
  description: 'Domos geodésicos con tinaja privada en el bosque nativo. Glamping pet friendly en Valle Las Trancas, cerca de Termas de Chillán. Reserva tu refugio hoy.',
  keywords: ['glamping chile', 'glamping chillan', 'valle las trancas', 'alojamiento montaña', 'domos las trancas', 'treepod refugio', 'glamping cerca de santiago', 'domos geodesicos chile', 'cabañas valle las trancas', 'termas de chillan alojamiento', 'glamping con tinaja', 'escapada romantica chile', 'alojamiento pet friendly chile', 'donde alojar en las trancas', 'turismo nuble'],
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Glamping en Valle Las Trancas | Domos TreePod',
    description: 'Domos geodésicos con tinaja privada en el bosque nativo. Glamping pet friendly en Valle Las Trancas, cerca de Termas de Chillán.',
    images: ['/images/hero/domo-treepod-ok-12.jpg'],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glamping en Valle Las Trancas | Domos TreePod',
    description: 'Domos geodésicos con tinaja privada en el bosque nativo. Glamping pet friendly cerca de Termas de Chillán.',
    images: ['/images/hero/domo-treepod-ok-12.jpg'],
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
        {/* Schema.org JSON-LD — LodgingBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              "name": "TreePod Glamping",
              "description": "Domos geodésicos con tinaja privada en el bosque nativo de Valle Las Trancas, cerca de Termas de Chillán.",
              "url": "https://domostreepod.cl",
              "telephone": "+56984643307",
              "email": "reservas@domostreepod.cl",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Camino a Termas de Chillán km 28",
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
            })
          }}
        />

        {/* Schema.org JSON-LD — FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Dónde queda TreePod Glamping?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "TreePod está en Valle Las Trancas, camino a Termas de Chillán km 28, Región de Ñuble, Chile. A 72 km de Chillán y a unas 5.5 horas de Santiago."
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
            })
          }}
        />

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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} ${plusJakarta.variable} ${notoSans.variable} antialiased`}
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

        {/* AdminAwareLayout gestiona la UI según la ruta (Admin vs Web) */}
        <AuthRecoveryRedirect />
        <DebugGTM enabled={true} />
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
