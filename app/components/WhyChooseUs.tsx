import { EyeOff, Bed, Map, Sparkles } from "lucide-react";

export default function WhyChooseUs() {

    const reasons = [
        {
            icon: EyeOff,
            title: "Intimidad Real",
            description: "Sin muros colindantes. Aunque compartimos la piscina y el bosque, tu domo es un espacio 100% independiente."
        },
        {
            icon: Bed,
            title: "Descanso Profundo",
            description: "Camas matrimoniales, calefacción eficiente y Starlink para cuando decidas conectar con el mundo digital."
        },
        {
            icon: Map,
            title: "Ubicación Ideal",
            description: "A minutos de las termas y las pistas de ski, pero lo suficientemente lejos para escuchar solo el bosque."
        }
    ];

    return (
        <section className="py-24 bg-[#0A0F11] border-y border-white/5" id="why-choose-us">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Sparkles className="text-primary w-3 h-3" />
                        <span className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">La Diferencia TreePod</span>
                    </div>
                    <h2 className="h2-display !text-white">
                        ¿Por qué elegir <span className="text-primary italic font-light">nuestro refugio?</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reasons.map((reason, index) => (
                        <div key={index} className="group bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500 shadow-xl">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500 border border-primary/10">
                                <reason.icon size={28} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-4 text-white tracking-tight">
                                {reason.title}
                            </h3>
                            <p className="text-white/60 leading-relaxed text-sm font-medium">
                                {reason.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
