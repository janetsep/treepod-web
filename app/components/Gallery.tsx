"use client";

import Script from "next/script";

export default function Gallery() {
    return (
        <section className="py-12 bg-white dark:bg-background-dark overflow-hidden" id="galeria">
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="inline-block mb-4">
                        <span className="text-text-sub-light dark:text-text-sub-dark text-[10px] font-bold tracking-[0.3em] uppercase">Capturando la Esencia</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-text-main-light dark:text-text-main-dark">Así se Vive <span className="text-primary italic">TreePod</span></h2>
                    <p className="text-xl text-text-sub-light dark:text-text-sub-dark font-light">
                        Cada rincón que ves es una ventana auténtica a la experiencia que te espera.
                    </p>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-2xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 p-4 md:p-8">
                    <div className="elfsight-app-95014e6a-2fd5-4219-b0c5-e50cd23e4e72" data-elfsight-app-lazy></div>
                </div>

                <Script
                    src="https://elfsightcdn.com/platform.js"
                    strategy="lazyOnload"
                />

                <p className="mt-12 text-sm text-text-sub-light dark:text-text-sub-dark italic">
                    Síguenos en <a href="#" className="text-primary font-bold hover:underline">@domostreepod</a> para más momentos.
                </p>
            </div>
        </section>
    );
}
