import Link from "next/link";
import Image from "next/image";

export default function News() {
    const activities = [
        {
            image: "/images/real/VegetacionOtono.jpg",
            title: "Otoño Valle Las Trancas",
            description: "Vive el otoño más mágico en el corazón del Valle Las Trancas. Colores únicos, aire puro y la tranquilidad absoluta que solo esta época puede ofrecerte.",
            tag: "Temporada Especial",
            details: "Descubre la magia del otoño",
            href: "/otono-valle-las-trancas"
        },
        {
            image: "/images/hero/domonieve2.jpeg",
            title: "Domos Geodésicos Chillán",
            description: "Experimenta el glamping más auténtico del sur de Chile. Domos geodésicos únicos con tinaja privada, a minutos de las pistas de ski de Nevados de Chillán.",
            tag: "Glamping Premium",
            details: "Ski + Glamping perfecto",
            href: "/domos-geodesicos-chillan"
        },
        {
            image: "/images/Galeria/Las Trancas Bosque Nativo.jpeg",
            title: "Glamping Valle Las Trancas",
            description: "Descubre por qué Valle Las Trancas es el destino de glamping más exclusivo de Chile. Naturaleza, aventura y comodidad en perfecta armonía.",
            tag: "Experiencia Única",
            details: "El mejor glamping del valle",
            href: "/glamping-valle-las-trancas"
        },
        {
            image: "/images/wellness/Tinaja5.jpg",
            title: "Escapada Romántica",
            description: "Una escapada perfecta para parejas que buscan reconectarse. Tinaja privada bajo las estrellas, cenas íntimas y la magia del bosque nativo.",
            tag: "Solo Para Dos",
            details: "Romance en el bosque",
            href: "/escapada-romantica-las-trancas"
        }
    ];

    return (
        <section className="py-12 md:py-20 bg-white border-t border-black/[0.06]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col items-center text-center mb-12 md:mb-20">
                    <div className="max-w-4xl w-full">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Que tu única preocupación sea qué aventura elegir hoy</span>
                        </div>
                        <h2 className="h2-display text-text-main leading-tight mb-6">Vive el Valle al máximo: No vengas solo a encerrarte.</h2>
                        <p className="text-lg md:text-xl text-text-sub font-bold leading-relaxed">
                            Descubre los secretos del bosque, la adrenalina de la montaña y los mejores planes que tenemos listos para ti esta temporada. 
                            <br /><br />
                            Haz clic en el botón para reservar tu domo y comenzar a disfrutar.
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
