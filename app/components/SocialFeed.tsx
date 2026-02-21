"use client";

import Script from "next/script";

export default function SocialFeed() {
    return (
        <section className="py-16 bg-white" id="social-feed">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
                    Síguenos en Instagram
                </h2>
                <p className="text-center text-gray-500 mb-12">
                    Descubre la magia de TreePod día a día @domostreepod
                </p>

                <div className="min-h-[400px]">
                    <div className="elfsight-app-997d64da-bc31-4252-aaea-4e030bfce7a5" data-elfsight-app-lazy></div>
                </div>

                <Script
                    src="https://elfsightcdn.com/platform.js"
                    strategy="lazyOnload"
                />
            </div>
        </section>
    );
}
