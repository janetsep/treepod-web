import type { Metadata } from 'next';
import { getDomoPriceForNights } from '@/lib/pricing';

export async function generateMetadata(): Promise<Metadata> {
    const price = await getDomoPriceForNights(1);
    const priceText = price
        ? `Desde $${new Intl.NumberFormat('es-CL').format(price)}/noche`
        : 'Tarifas dinámicas según temporada';

    return {
        title: 'Finde Largo Glorias Navales Las Trancas | Escapada 21 Mayo Ñuble — TreePod',
        description: `Vive el finde largo de las Glorias Navales en Valle Las Trancas. Domos geodésicos en bosque nativo con tinaja exclusiva opcional. ${priceText}, 21–24 mayo 2026.`,
        keywords: ['finde largo glorias navales', 'escapada 21 mayo Ñuble', 'glorias navales Las Trancas', 'glamping 21 mayo', 'domos geodésicos mayo 2026', 'alojamiento glorias navales chile', 'finde largo 4 días mayo', 'glamping Ñuble mayo'],
        // Landing de fecha pasada (21-24 mayo 2026): noindex hasta reutilizarla
        // para la próxima edición, para no invitar a reservar fechas vencidas.
        robots: {
            index: false,
            follow: false,
        },
        alternates: {
            canonical: '/glorias-navales-las-trancas',
        },
        openGraph: {
            title: 'Finde Largo Glorias Navales Las Trancas | Escapada 21 Mayo Ñuble — TreePod',
            description: `Vive el finde largo de las Glorias Navales en Valle Las Trancas. Domos con tinaja exclusiva opcional. ${priceText}.`,
            images: ['/images/hero/Otono2.jpg'],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Finde Largo Glorias Navales Las Trancas | Escapada 21 Mayo Ñuble — TreePod',
            description: `Vive el finde largo de las Glorias Navales. Domos con tinaja exclusiva opcional. ${priceText}.`,
            images: ['/images/hero/Otono2.jpg'],
        }
    };
}

export default function GloriasNavalesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
