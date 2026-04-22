import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Guía del Huésped | TreePod Glamping Valle Las Trancas',
    description: 'Todo lo que necesitas saber para tu estadía en TreePod: checkin, reglas de convivencia, actividades y recomendaciones para disfrutar al máximo el Valle Las Trancas.',
    alternates: {
        canonical: '/guia',
    },
};

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
