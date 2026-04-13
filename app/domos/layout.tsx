import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Domos Geodésicos Las Trancas | Tina y Mascotas — TreePod',
    description: 'Glamping Las Trancas con domos geodésicos. Acepta mascotas, tinaja agua volcánica, WiFi Starlink. Desde $145.000/noche en Valle Las Trancas.',
    alternates: {
        canonical: '/domos',
    },
    openGraph: {
        title: 'Domos Geodésicos en Las Trancas | Glamping con Tina Caliente y Mascotas',
        description: 'Glamping Las Trancas con domos geodésicos. Acepta mascotas, tinaja agua volcánica, WiFi Starlink en Valle Las Trancas.',
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
