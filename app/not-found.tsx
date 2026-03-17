import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4 text-center">
            <div className="relative w-64 h-64 mb-8 opacity-80">
                {/* Using a nature image or just the logo. Let's use the logo for clarity */}
                <Image
                    src="/images/branding/logo-treepod.jpg"
                    alt="TreePod Logo"
                    fill
                    className="object-contain"
                />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-text-main-light dark:text-text-main-dark mb-6">
                Te has desviado del sendero
            </h2>
            <p className="text-text-sub-light dark:text-text-sub-dark max-w-md mb-8 text-lg">
                La página que buscas no existe o ha sido movida. Pero no te preocupes, el refugio siempre está cerca.
            </p>

            <Link
                href="/"
                className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all transform hover:-translate-y-1 shadow-lg"
            >
                Volver al Inicio
            </Link>
        </div>
    );
}
