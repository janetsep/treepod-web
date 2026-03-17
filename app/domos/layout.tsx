import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nuestros Domos | TreePod Glamping Las Trancas',
    description: 'Explora nuestra selección de domos geodésicos equipados en Valle Las Trancas. Con tinajas de ciprés, terrazas exclusivas y vistas panorámicas a la cordillera.',
};

export default function DomosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
