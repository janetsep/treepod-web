import Link from "next/link";
import Image from "next/image";

export default function News() {
    const activities = [
        {
            image: "/images/real/VegetacionOtono.jpg",
            title: "Otoño Valle Las Trancas",
            description: "El otoño tiñe el Valle Las Trancas de rojos y dorados. Bosque nativo, aire puro y la calma de la temporada baja.",
            tag: "Temporada baja",
            details: "Ver otoño en Las Trancas",
            href: "/otono-valle-las-trancas"
        },
        {
            image: "/images/hero/domonieve2.jpeg",
            title: "Domos Geodésicos Chillán",
            description: "Domos geodésicos con estufa a pellet, a minutos de las pistas de ski de Nevados de Chillán. Vuelve del cerro a una cama tibia.",
            tag: "Temporada de nieve",
            details: "Ver domos en Chillán",
            href: "/domos-geodesicos-chillan"
        },
        {
            image: "/images/Galeria/Las Trancas Bosque Nativo.jpeg",
            title: "Glamping Valle Las Trancas",
            description: "Bosque nativo, montaña y aventura a un paso de tu domo. Naturaleza y comodidad en un mismo lugar del Valle Las Trancas.",
            tag: "Valle Las Trancas",
            details: "Conocer el valle",
            href: "/glamping-valle-las-trancas"
        },
        {
            image: "/images/wellness/Tinaja5.jpg",
            title: "Escapada Romántica",
            description: "Una escapada para dos: cena íntima, bosque nativo y el cielo estrellado de Las Trancas, sin nadie más alrededor.",
            tag: "Solo para dos",
            details: "Ver escapada romántica",
            href: "/escapada-romantica-las-trancas"
        }
    ];

    return (
        <section className="py-12 md:py-20 bg-white border-t border-black/[0.06]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col items-center text-center mb-12 md:mb-20">
                    <div className="max-w-4xl w-full">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">Todo lo que puedes hacer cerca</span>
                        </div>
                        <h2 className="h2-display text-text-main leading-tight mb-6">Más allá del domo, todo un valle por descubrir</h2>
                        <p className="text-lg md:text-xl text-text-sub font-bold leading-relaxed">
                            Descubre los secretos del bosque, la adrenalina de la montaña y los mejores planes que tenemos listos para ti esta temporada.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {activities.map((item, index) => {
                        const CardContent = (
                            <div className="group bg-surface rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-black/5 ring-1 ring-black/5 relative hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden shrink-0">
                                    <Image
                                        alt={item.title}
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                        src={item.image}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="p-8 flex flex-col grow">
                                    <h3 className="h4-display mb-4 text-text-main group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-text-sub mb-6 leading-relaxed grow font-medium">
                                        {item.description}
                                    </p>
                                    <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                                        <p className={`text-xs font-bold leading-tight ${item.href ? 'text-primary' : 'text-text-sub/80 italic'}`}>
                                            {item.details}
                                        </p>
                                        {item.href && (
                                            <span className="text-primary ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );

                        return item.href ? (
                            <Link key={index} href={item.href} className="block h-full cursor-pointer">
                                {CardContent}
                            </Link>
                        ) : (
                            <div key={index} className="h-full">
                                {CardContent}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
