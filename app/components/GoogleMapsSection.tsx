'use client';

import Script from 'next/script';

interface GoogleMapsSectionProps {
    apiKey?: string; // Mantenemos la prop por compatibilidad, aunque no se use para Elfsight
}

export default function GoogleMapsSection({ apiKey }: GoogleMapsSectionProps) {
    return (
        <div className="w-full h-full min-h-[400px] relative bg-gray-100 flex items-center justify-center overflow-hidden">
            {/* Iframe de Google Maps centrado en Glamping Domos TreePod con zoom óptimo */}
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1599.4356!2d-71.508937!3d-36.9119224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9668e7ec8a7e0e75%3A0x67990c79f188358d!2sGlamping%20Domos%20TreePod!5e0!3m2!1ses-419!2scl!4v1710000000000!5m2!1ses-419!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 z-0"
            ></iframe>
        </div>
    );
}
