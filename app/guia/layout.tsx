import type { Metadata } from 'next';

export const metadata: Metadata = {
    // Título propio del thank-you del lead magnet: antes duplicaba el de /guia-huesped
    // y rotulaba mal la pestaña (esta página no es la guía del huésped).
    title: 'Tu Guía de Las Trancas está lista | TreePod',
    description: 'Gracias por pedir la Guía de Glamping en Las Trancas de TreePod. Revisa tu correo: te enviamos el acceso con recomendaciones locales para tu escapada.',
    alternates: {
        canonical: '/guia',
    },
    // Es una página de "gracias por descargar" (thank-you del lead magnet), no debe indexarse.
    // La guía pública indexable es /guia-huesped.
    robots: { index: false, follow: false },
    // openGraph propio para no heredar el og:title/og:url del home al compartir.
    openGraph: {
        title: 'Tu Guía de Las Trancas está lista | TreePod',
        description: 'Gracias por pedir la Guía de Glamping en Las Trancas de TreePod.',
        url: '/guia',
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
