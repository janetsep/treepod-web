import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Galería de Fotos | Glamping TreePod Valle Las Trancas',
    description: 'Fotos reales de nuestros domos geodésicos, el bosque nativo, tinajas de ciprés y las experiencias que viven nuestros huéspedes en TreePod.',
    alternates: {
        canonical: '/galeria',
    },
    openGraph: {
        title: 'Galería de Fotos | Glamping TreePod',
        description: 'Fotos reales de nuestros domos, bosque nativo y experiencias en Valle Las Trancas.',
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function GaleriaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
