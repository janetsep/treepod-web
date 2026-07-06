import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reservar Glamping en Las Trancas | Domos TreePod',
    description: 'Consulta disponibilidad y reserva tu domo en Valle Las Trancas. Tarifas según temporada para 2 personas. Check-in 16:00, check-out 12:00.',
    alternates: {
        canonical: '/disponibilidad',
    },
    openGraph: {
        title: 'Reservar Glamping en Las Trancas | TreePod',
        description: 'Consulta disponibilidad y reserva tu domo geodésico en Valle Las Trancas. Tarifas según temporada para 2 personas.',
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function DisponibilidadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
