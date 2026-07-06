import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Paquetes y Ofertas | Glamping TreePod Las Trancas',
    description: 'Servicios extra para tu estadía: desayunos, cenas, tinaja privada de temporada y sorpresas especiales en Valle Las Trancas.',
    alternates: {
        canonical: '/paquetes',
    },
    openGraph: {
        title: 'Paquetes y Ofertas | Glamping TreePod',
        description: 'Servicios extra para tu estadía: desayunos, cenas y tinaja privada de temporada en Valle Las Trancas.',
        url: '/paquetes',
        // El openGraph del hijo reemplaza completo al del root: sin images aquí,
        // WhatsApp/Facebook no muestran vista previa al compartir esta página.
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function PaquetesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
