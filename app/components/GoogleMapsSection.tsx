'use client';

interface GoogleMapsSectionProps {
    apiKey?: string;
}

export default function GoogleMapsSection({ apiKey }: GoogleMapsSectionProps) {
    return (
        <div className="w-full h-full min-h-[400px] relative bg-gray-100 flex items-center justify-center overflow-hidden">
            <iframe
                src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=-36.9116,-71.5069&zoom=16&maptype=roadmap"
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
