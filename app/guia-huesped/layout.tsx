import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Guía del Huésped | Glamping TreePod Valle Las Trancas',
    description: 'Todo lo que necesitas saber antes de llegar a TreePod: cómo llegar, qué traer, horarios, actividades cercanas y tips para tu estadía en Las Trancas.',
    alternates: {
        canonical: '/guia-huesped',
    },
    openGraph: {
        title: 'Guía del Huésped | Glamping TreePod',
        description: 'Todo lo que necesitas saber para tu estadía en TreePod, Valle Las Trancas.',
        url: '/guia-huesped',
        // El openGraph del hijo reemplaza completo al del root: sin images aquí,
        // WhatsApp/Facebook no muestran vista previa al compartir esta página.
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function GuiaHuespedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
