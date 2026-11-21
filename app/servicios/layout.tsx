import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Servicios y Experiencias | Glamping TreePod Las Trancas',
    description: 'Desayunos servidos en tu domo, parrilla a domicilio y tinaja privada como servicio adicional. Conoce los servicios y extras de TreePod en Valle Las Trancas.',
    alternates: {
        canonical: '/servicios',
    },
    openGraph: {
        title: 'Servicios y Experiencias | Glamping TreePod',
        description: 'Desayunos servidos en tu domo, parrilla a domicilio y tinaja como servicio adicional en Valle Las Trancas.',
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
