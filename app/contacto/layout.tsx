import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contacto | Glamping TreePod - Valle Las Trancas, Chillán',
    description: 'Contáctanos para consultas, reservas especiales o grupos. Glamping TreePod en Valle Las Trancas, camino a Termas de Chillán.',
    alternates: {
        canonical: '/contacto',
    },
    openGraph: {
        title: 'Contacto | Glamping TreePod',
        description: 'Contáctanos para consultas y reservas en Valle Las Trancas.',
        url: '/contacto',
        // El openGraph del hijo reemplaza completo al del root: sin images aquí,
        // WhatsApp/Facebook no muestran vista previa al compartir esta página.
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function ContactoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
