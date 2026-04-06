import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Domos Geodésicos en Las Trancas | Glamping TreePod Chillán',
    description: 'Domos de 38m² con estufa a pellet, cocina equipada, WiFi Starlink y tinaja de ciprés. Capacidad 4 personas. Desde $145.000/noche en Valle Las Trancas.',
    alternates: {
        canonical: '/domos',
    },
    openGraph: {
        title: 'Domos Geodésicos en Las Trancas | Glamping TreePod',
        description: 'Domos de 38m² con estufa a pellet, WiFi Starlink y tinaja de ciprés privada en Valle Las Trancas.',
        images: ['/images/hero/domo-treepod-ok-12.jpg'],
    },
};

export default function DomosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
