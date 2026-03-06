import Link from "next/link";

export default function News() {
    const activities = [
        {
            image: "/images/exteriors/domo-exterior-arrival.jpg",
            title: "Mundial UCI MTB 2026",
            description: "Alojamiento exclusivo para competidores y equipos durante el UCI Mountain Bike World Championships.",
            tag: "Evento Mundial",
            details: "⭐ Ver Pack Especial Domos y Recuperación",
            href: "/mundial-mtb-nevados-chillan-2026"
        },
        {
            image: "/images/EquipamientoParaTuEstadia/Tinaja5.jpg",
            title: "Semana Santa 2026",
            description: "Vive un fin de semana sagrado de descanso real. Tinajas de ciprés privadas bajo el cielo estrellado y el silencio absoluto del bosque.",
            tag: "Evento Especial",
            details: "🧘 Reserva tu Refugio de Descanso",
            href: "/semana-santa-2026"
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqsbwWLwYH9OTmmwRGTC1khmaeUKNJEOoehlnkDbhxZ9eiVTw_1BXMHfnvo7rFLRLH21zVlKUP9MWlJbRj5Yux_dVwnobxV77Zw8FiQDXZpaECKb5-f05zTDNC6hBYT8uKmvhEjcbme3Y5b9lPV6o-1xsuVwkn6BbKJaV9L3RpK9fRzglqIzPJ9YLaL2buWMIw2nwrGbETzBx35iVYeOdN3PU_voROtg6kLWVADcoERZXhYkPTBum4lAe7wy-5INp7K1rVENpyFLs", // Ski photo
            title: "Nevados de Chillán",
            description: "A solo minutos de TreePod, disfruta del mejor centro de esquí del sur de Chile. Pistas para todos los niveles, snowpark y las famosas aguas termales volcánicas.",
            tag: "Deporte Invernal",
            details: "Centro de Ski & Resort con la pista más larga de Sudamérica."
        },
        {
            image: "/images/exteriors/Las Trancas Bosque Nativo.jpeg",
            title: "Las Trancas",
            description: "Las Trancas es sede de carreras de Trail Running y MTB de nivel mundial. Entrena o compite en la Garganta del Diablo y senderos épicos.",
            tag: "Deporte Outdoor",
            details: "Competiciones anuales y rutas para todos los niveles."
        }
    ];

    return (
        <section className="hidden md:block py-12 md:py-20 bg-white border-t border-black/[0.06]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Actividades</span>
                        </div>
                        <h2 className="h2-display text-text-main leading-tight mb-6">Lo que se viene en el Valle</h2>
                        <p className="text-lg md:text-xl text-text-sub font-bold max-w-lg leading-relaxed">Conoce y reserva tu lugar para los eventos y actividades imperdibles de la temporada.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {activities.map((item, index) => {
                        const CardContent = (
                            <div className="group bg-surface rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-black/5 ring-1 ring-black/5 relative hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden shrink-0">
                                    <img
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        src={item.image}
                                    />
                                </div>
                                <div className="p-8 flex flex-col grow">
                                    <h3 className="font-display font-bold text-xl mb-4 text-text-main group-hover:text-primary transition-colors leading-tight">
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
