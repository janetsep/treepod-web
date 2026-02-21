export default function News() {
    const activities = [
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
        },
        {
            image: "/images/hero/interior-domo-acogedor-105-2.jpg",
            title: "Panoramas y Sabores",
            description: "Panoramas ideales todo el año. Disfruta de la gastronomía local, fiestas costumbristas y la vibrante vida de montaña.",
            tag: "Vida Social",
            details: "Restaurantes, ferias locales y eventos en el valle."
        }
    ];

    return (
        <section className="hidden md:block py-24 md:py-32 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="max-w-xl">
                        <div className="inline-block px-4 py-1.5 border border-primary/20 rounded-full mb-8 bg-primary/10 shadow-sm">
                            <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">Actividades</span>
                        </div>
                        <h2 className="h2-display text-text-main leading-tight mb-6">Vida en el Valle</h2>
                        <p className="text-lg md:text-xl text-text-sub font-bold max-w-lg leading-relaxed">Más allá del refugio: vive la intensidad de la montaña y la cultura local.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {activities.map((item, index) => (
                        <div key={index} className="group bg-surface rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-black/5 ring-1 ring-black/5">
                            <div className="relative h-72 overflow-hidden shrink-0">
                                <img
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src={item.image}
                                />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-primary text-white text-[11px] font-black tracking-widest uppercase px-5 py-2 rounded-xl shadow-2xl">
                                        {item.tag}
                                    </span>
                                </div>
                            </div>
                            <div className="p-10 flex flex-col grow">
                                <h3 className="font-display font-bold text-2xl mb-6 text-text-main group-hover:text-primary transition-colors leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-base md:text-lg text-text-sub mb-8 leading-relaxed grow font-bold">
                                    {item.description}
                                </p>
                                <div className="pt-6 border-t border-black/5">
                                    <p className="text-sm text-text-sub/80 font-bold italic">
                                        {item.details}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
