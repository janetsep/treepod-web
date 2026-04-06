import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TreePod Glamping',
    robots: {
        index: false,
        follow: false,
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
