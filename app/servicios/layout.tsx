import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Servicios y Experiencias | Glamping TreePod Las Trancas',
    description: 'Desayunos a la habitación, quincho equipado para asados y tinaja privada de temporada. Conoce los servicios y extras de TreePod en Valle Las Trancas.',
    alternates: {
        canonical: '/servicios',
    },
    openGraph: {
        title: 'Servicios y Experiencias | Glamping TreePod',
        description: 'Desayunos a la habitación, quincho para asados y tinaja de temporada en Valle Las Trancas.',
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function ServiciosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
