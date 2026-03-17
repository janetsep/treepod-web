import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Galería de Momentos | TreePod Glamping',
    description: 'Una ventana visual a la magia de TreePod. Descubre la belleza de lo auténtico y los momentos de calma que te esperan en nuestra reserva natural.',
};

export default function GaleriaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
