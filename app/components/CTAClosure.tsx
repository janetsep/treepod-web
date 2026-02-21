"use client";

import { useRouter } from "next/navigation";

export default function CTAClosure() {
    const router = useRouter();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <section className="py-24 bg-gray-900 text-white text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 leading-tight text-white">
                El bosque te espera.<br />
                Solo faltas tú.
            </h2>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-10">
                <button
                    onClick={() => router.push('/disponibilidad')}
                    className="w-full sm:w-auto bg-primary text-white font-bold py-4 px-10 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-primary/30 text-lg"
                >
                    Revisar disponibilidad
                </button>

                <button
                    onClick={scrollToTop}
                    className="w-full sm:w-auto bg-transparent border border-gray-600 text-gray-300 font-semibold py-4 px-10 rounded-full hover:bg-gray-800 hover:text-white transition-all text-lg flex items-center justify-center gap-2"
                >
                    Volver al inicio <span className="text-xl">↑</span>
                </button>
            </div>
        </section>
    );
}
