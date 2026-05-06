import type { Metadata } from 'next';
import { getDomoPriceForNights } from '@/lib/pricing';

export async function generateMetadata(): Promise<Metadata> {
    const price = await getDomoPriceForNights(1);
    const priceText = price
        ? `Desde $${new Intl.NumberFormat('es-CL').format(price)}/noche`
        : 'Tarifas dinámicas según temporada';

    return {
        title: 'Domos Geodésicos Las Trancas | Tina y Mascotas — TreePod',
        description: `Glamping Las Trancas con domos geodésicos. Acepta mascotas, tinaja agua volcánica, WiFi Starlink. ${priceText} en Valle Las Trancas.`,
        alternates: {
            canonical: '/domos',
        },
        openGraph: {
            title: 'Domos Geodésicos en Las Trancas | Glamping con Tina Caliente y Mascotas',
            description: 'Glamping Las Trancas con domos geodésicos. Acepta mascotas, tinaja agua volcánica, WiFi Starlink en Valle Las Trancas.',
            images: ['/images/hero/domo-treepod-ok-12.jpg'],
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
