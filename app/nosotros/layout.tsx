import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nosotros | TreePod Glamping Valle Las Trancas',
    description: 'Conoce la empresa detrás de TreePod: glamping con propósito social en Valle Las Trancas, con encadenamiento productivo local y empleo comunitario.',
    alternates: {
        canonical: '/nosotros',
    },
    openGraph: {
        title: 'Nosotros | TreePod Glamping Valle Las Trancas',
        description: 'Conoce la empresa detrás de TreePod: glamping con propósito social en Valle Las Trancas.',
        images: ['/images/real/NOdomoaereo4.jpeg'],
        type: 'website',
        locale: 'es_CL',
    },
};

export default function NosotrosLayout({ children }: { children: React.ReactNode }) {
    return children;
}
