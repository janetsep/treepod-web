import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reservar Glamping en Las Trancas | Tarifas y Disponibilidad TreePod',
    description: 'Consulta disponibilidad y reserva tu domo en Valle Las Trancas. Tarifas desde $145.000/noche para 2 personas. Check-in flexible a las 15:00.',
    alternates: {
        canonical: '/disponibilidad',
    },
    openGraph: {
        title: 'Reservar Glamping en Las Trancas | TreePod',
        description: 'Consulta disponibilidad y reserva tu domo geodésico en Valle Las Trancas. Tarifas desde $145.000/noche.',
        images: ['/images/hero/domo-treepod-ok-12.jpg'],
    },
};

export default function DisponibilidadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
