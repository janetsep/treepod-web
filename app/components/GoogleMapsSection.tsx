'use client';

interface GoogleMapsSectionProps {
    apiKey?: string;
}

export default function GoogleMapsSection({ apiKey }: GoogleMapsSectionProps) {
    const mapApiKey = apiKey || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

    return (
        <div className="w-full h-full min-h-[400px] relative bg-gray-100 flex items-center justify-center overflow-hidden">
            <iframe
                title="Ubicación de Glamping Domos TreePod en Valle Las Trancas"
                src={`https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(mapApiKey)}&center=-36.9116,-71.5069&zoom=16&maptype=roadmap`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 z-0"
            ></iframe>
        </div>
    );
}
