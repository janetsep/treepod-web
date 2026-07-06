import type { Metadata } from 'next';
import SeasonalLanding from '../components/SeasonalLanding';

export const metadata: Metadata = {
    title: 'Otoño en Valle Las Trancas | Glamping TreePod - Colores del Bosque',
    description: 'Vive el otoño en Valle Las Trancas. Bosque nativo con colores rojos y dorados, estufa a pellet y temporada baja sin multitudes. Abril a junio en Domos TreePod.',
    keywords: [
        'otoño valle las trancas',
        'otoño las trancas',
        'las trancas otoño',
        'glamping otoño chile',
        'domos las trancas otoño',
        'colores otoño bosque nativo',
        'que hacer en las trancas otoño',
        'valle las trancas abril mayo',
        'escapada otoño chile',
        'glamping otoño cordillera',
    ],
    alternates: {
        canonical: '/otono-valle-las-trancas',
    },
    openGraph: {
        title: 'Otoño en Valle Las Trancas | Domos TreePod',
        description: 'Bosque nativo en colores rojos y dorados, aire puro y la calma de la temporada baja en Valle Las Trancas.',
        images: ['/images/real/VegetacionOtono.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa una escapada de otoño a los domos. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const reservaHref = "/disponibilidad?adultos=2&event=otono-las-trancas";

export default function OtonoValleLasTrancasPage() {
    return (
        <SeasonalLanding
            trackViewEvent="view_otono_las_trancas"
            hero={{
                image: "/images/real/VegetacionOtono.jpg",
                alt: "Bosque nativo de Valle Las Trancas en otoño con colores dorados y naranjas",
                eyebrow: "Otoño · Abril a junio",
                title: <>Otoño en Las Trancas: el bosque se tiñe de rojos y dorados <span className="italic">y el valle está en calma</span></>,
                text: "El otoño tiñe el Valle Las Trancas de rojos y dorados. Los robles cambian de color, los senderos quedan tranquilos y el bosque nativo se disfruta con el frío justo. Sin filas, sin ruido, sin apuro.",
                priceLine: "Precios de temporada baja",
                priceSub: "Menos gente y el bosque en su mejor momento. Revisa la tarifa de tu fecha en el calendario.",
                photoCaption: "Bosque nativo en otoño, Valle Las Trancas",
            }}
            heroCta={{
                href: reservaHref,
                eventName: "click_reservar_otono",
                secondEventName: "begin_checkout_otono",
                secondParams: { event: "otono_las_trancas_2026" },
                label: "Reserva tu escapada de otoño",
            }}
            whatsapp={{
                url: whatsappUrl,
                eventName: "click_whatsapp_otono",
                label: "Consultar por WhatsApp",
            }}
            beneficios={{
                label: "La temporada",
                title: <>¿Por qué venir en otoño a <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">Las Trancas</span>?</>,
                items: [
                    {
                        title: "El bosque nativo cambia de color",
                        desc: "Robles, coigües y ñirres se tiñen de naranja, dorado y rojo. El paisaje cambia cada semana entre abril y junio."
                    },
                    {
                        title: "Menos gente, más privacidad",
                        desc: "Otoño es temporada baja. Los senderos están tranquilos y hay más domos disponibles. Sin las aglomeraciones de invierno o verano."
                    },
                    {
                        title: "Días frescos, noches frías",
                        desc: "El otoño en la cordillera trae mañanas con neblina y noches frías. El clima ideal para caminar de día y quedarte en el domo al anochecer."
                    },
                    {
                        title: "Tu domo cálido mientras afuera refresca",
                        desc: "La estufa a pellet mantiene el domo cálido toda la noche, mientras afuera la temperatura baja. Llegas del frío a un domo tibio."
                    },
                    {
                        title: "Fotografía de otoño en bosque nativo",
                        desc: "Luz dorada entre las hojas, neblina matutina en el valle, hongos en los troncos. Si te gusta la fotografía, el otoño en Las Trancas tiene mucho que mostrar."
                    },
                    {
                        title: "Trekking sin calor y sin nieve",
                        desc: "Los senderos están secos pero sin calor. Trekking a la Laguna del Huemul, cascadas y rutas por el bosque con buena temperatura para caminar."
                    },
                ],
            }}
            galeria={{
                title: <>Otoño real en los domos <span className="italic">TreePod</span></>,
                lead: "Fotos reales de nuestros domos en temporada de otoño. Sin filtros, sin IA.",
                photos: [
                    {
                        src: "/images/real/VegetacionOtono.jpg",
                        alt: "Vegetación otoñal en Valle Las Trancas con colores dorados",
                        caption: "Bosque en otoño · colores dorados y naranjas",
                    },
                    {
                        src: "/images/wellness/Tinaja1.jpg",
                        alt: "Tinaja de ciprés rodeada de bosque nativo",
                        caption: "Tinaja en el bosque · servicio de temporada (vuelve en primavera)",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
                        alt: "Interior cálido del domo con estufa a pellet encendida",
                        caption: "Interior cálido · estufa a pellet automática",
                    },
                    {
                        src: "/images/Galeria/lastrancas-exterior-domo-14-2.jpg",
                        alt: "Domo TreePod rodeado de bosque nativo",
                        caption: "Tu domo en el bosque · privacidad entre el bosque nativo",
                    },
                ],
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_otono",
                    label: "Ver disponibilidad de otoño",
                },
            }}
            resenas={{
                title: <>Lo que dicen <span className="italic">nuestros huéspedes</span></>,
                lead: "4,9 estrellas en Google con 59 reseñas verificadas",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_otono",
                    label: "Ver disponibilidad de otoño",
                },
            }}
            cierre={{
                label: "Temporada baja",
                title: <>El otoño dura poco. <span className="italic text-[#00ADEF]">Tu domo te espera.</span></>,
                text: "Los colores del bosque cambian cada semana entre abril y junio. Reserva directo y aprovecha los precios de temporada baja.",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_otono_final",
                    secondEventName: "begin_checkout_otono",
                    secondParams: { event: "otono_las_trancas_2026" },
                    label: "Reserva tu otoño en el bosque",
                },
                trust: ["Mejor Precio Directo", "Temporada Baja", "Cero Multitudes"],
            }}
        />
    );
}
