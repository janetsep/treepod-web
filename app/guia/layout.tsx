import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Guía del Huésped | TreePod Glamping Valle Las Trancas',
    description: 'Todo lo que necesitas saber para tu estadía en TreePod: checkin, reglas de convivencia, actividades y recomendaciones para disfrutar al máximo el Valle Las Trancas.',
    alternates: {
        canonical: '/guia',
    },
    // Es una página de "gracias por descargar" (thank-you del lead magnet), no debe indexarse.
    // La guía pública indexable es /guia-huesped.
    robots: { index: false, follow: false },
    // openGraph propio para no heredar el og:title/og:url del home al compartir.
    openGraph: {
        title: 'Guía del Huésped | TreePod Glamping',
        description: 'Todo lo que necesitas saber para tu estadía en TreePod, Valle Las Trancas.',
        url: '/guia',
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
