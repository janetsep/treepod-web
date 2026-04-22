import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nosotros | TreePod Glamping Valle Las Trancas',
    description: 'Conoce a Migryk Correa Ltda., empresa detrás de TreePod. Glamping con propósito social en Valle Las Trancas: encadenamiento productivo local, empleo comunitario y turismo regenerativo.',
    alternates: {
        canonical: '/nosotros',
    },
};

export default function NosotrosLayout({ children }: { children: React.ReactNode }) {
    return children;
}
