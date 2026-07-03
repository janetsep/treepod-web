import type { Metadata } from 'next';
import { getDomoPriceForNights } from '@/lib/pricing';

export async function generateMetadata(): Promise<Metadata> {
    const price = await getDomoPriceForNights(1);
    const priceText = price
        ? `Desde $${new Intl.NumberFormat('es-CL').format(price)}/noche`
        : 'Tarifas dinámicas según temporada';

    return {
        title: 'Domos Geodésicos en Las Trancas | TreePod Glamping',
        description: `Glamping Las Trancas con domos geodésicos. Tinaja exclusiva opcional, WiFi Starlink, estufa a pellet. ${priceText} en Valle Las Trancas.`,
        alternates: {
            canonical: '/domos',
        },
        openGraph: {
            title: 'Domos Geodésicos en Las Trancas | Glamping con Tinaja Caliente',
            description: 'Glamping Las Trancas con domos geodésicos. Tinaja exclusiva opcional, WiFi Starlink y estufa a pellet en Valle Las Trancas.',
            images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
        },
    };
}

export default function DomosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
