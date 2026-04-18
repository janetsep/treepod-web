import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog TreePod | Guías Valle Las Trancas y Nevados Chillán',
    description: 'Descubre todo sobre Valle Las Trancas: qué hacer, cómo llegar, dónde comer, clima y consejos para tu estadía perfecta en TreePod.',
    keywords: ['blog Valle Las Trancas', 'qué hacer Nevados Chillán', 'guía glamping chile', 'actividades Las Trancas', 'turismo Ñuble', 'consejos glamping'],
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Blog TreePod | Guías Valle Las Trancas',
        description: 'Guías completas para tu estadía perfecta en Valle Las Trancas',
        images: ['/images/Galeria/Las Trancas Bosque Nativo.jpeg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog TreePod | Guías Valle Las Trancas',
        description: 'Guías completas para tu estadía perfecta en Valle Las Trancas',
        images: ['/images/Galeria/Las Trancas Bosque Nativo.jpeg'],
    }
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}