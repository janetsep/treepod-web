'use client';

import Script from 'next/script';

interface GoogleMapsSectionProps {
    apiKey?: string; // Mantenemos la prop por compatibilidad, aunque no se use para Elfsight
}

export default function GoogleMapsSection({ apiKey }: GoogleMapsSectionProps) {
    return (
        <div className="w-full h-full min-h-[400px] relative bg-gray-100 flex items-center justify-center overflow-hidden">
            {/* 1. RESPALDO SEGURO: Iframe de Google Maps (Siempre funciona) */}
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3198.8712398512!2d-71.508937!3d-36.9119224!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9668e7ec8a7e0e75%3A0x67990c79f188358d!2sGlamping%20Domos%20TreePod!5e0!3m2!1ses-419!2scl!4v1707512345678!5m2!1ses-419!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 z-0"
            ></iframe>

            {/* 2. CAPA ELFSIGHT: Se carga encima del Iframe si funciona */}
            <div
                className="elfsight-app-3b2bec9e-cc66-481c-88a9-3f156d8a74a3 w-full h-full relative z-10 bg-transparent"
            ></div>

            <style jsx global>{`
                /* Aseguramos que Elfsight sea transparente para que el Iframe se vea si la plataforma no carga */
                .elfsight-app-3b2bec9e-cc66-481c-88a9-3f156d8a74a3 {
                    width: 100% !important;
                    height: 100% !important;
                }
                .elfsight-app-3b2bec9e-cc66-481c-88a9-3f156d8a74a3 a[href*="elfsight.com"] {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
