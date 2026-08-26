import Link from 'next/link';
import GeoArc from './components/deco/GeoArc';
import TriBullet from './components/deco/TriBullet';
import { btnPrimary } from './components/deco/cta';

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-[#F7F3EC] font-sans text-[#1E1B16] overflow-hidden flex items-center">
            {/* Arco geodésico como marca de agua: la página perdida sigue siendo TreePod */}
            <GeoArc className="absolute bottom-0 right-0 w-[420px] max-w-[70vw] text-[#1E1B16]/[0.08] pointer-events-none" />

            <div className="relative z-10 mx-auto w-full max-w-[720px] px-5 md:px-10 py-24">
                <p className="flex items-center gap-2 dato text-[#5B5348] mb-6">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                    Error 404 · Ruta N-55, Km desconocido
                </p>
                <h1 className="display-lg text-[#1E1B16]">
                    Te has desviado <span className="italic">del sendero</span>
                </h1>
                <p className="text-[#5B5348] leading-relaxed max-w-md mt-6">
                    La página que buscas no existe o fue trasladada. Puedes volver al inicio o consultar nuestros domos.
                </p>

                <div className="mt-10">
                    <Link href="/" className={btnPrimary}>
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
