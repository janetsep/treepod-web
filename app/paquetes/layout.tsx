import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Paquetes y Ofertas | Glamping TreePod Las Trancas',
    description: 'Paquetes especiales para parejas, familias y grupos. Incluyen alojamiento en domo, tinaja privada y experiencias en Valle Las Trancas.',
    alternates: {
        canonical: '/paquetes',
    },
    openGraph: {
        title: 'Paquetes y Ofertas | Glamping TreePod',
        description: 'Paquetes especiales con alojamiento, tinaja privada y experiencias en Valle Las Trancas.',
    },
};

export default function PaquetesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
