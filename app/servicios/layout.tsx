import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Servicios y Experiencias | Glamping TreePod Las Trancas',
    description: 'Desayuno orgánico, cena privada, tinaja de ciprés caliente, tour por el bosque nativo. Conoce todos los servicios incluidos y extras en TreePod.',
    alternates: {
        canonical: '/servicios',
    },
    openGraph: {
        title: 'Servicios y Experiencias | Glamping TreePod',
        description: 'Desayuno orgánico, cena privada, tinaja de ciprés y más en Valle Las Trancas.',
        images: ['/images/hero/domo-treepod-ok-12.jpg'],
    },
};

export default function ServiciosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
