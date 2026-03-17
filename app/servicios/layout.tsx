import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Servicios & Experiencias | TreePod Glamping',
    description: 'Relájate con nuestros rituales de Spa, disfruta de la gastronomía local y aventúrate en la naturaleza de Valle Las Trancas. Experiencias diseñadas para tu bienestar.',
};

export default function ServiciosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
