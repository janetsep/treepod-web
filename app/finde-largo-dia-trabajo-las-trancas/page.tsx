import type { Metadata } from 'next';
import SeasonalLanding from '../components/SeasonalLanding';

export const metadata: Metadata = {
    title: 'Finde Largo Mayo Las Trancas | Escapada 1 Mayo Ñuble — TreePod',
    description: 'Pasa el finde largo del día del trabajo en Valle Las Trancas. Domos geodésicos en bosque nativo, con tinaja privada opcional (servicio de temporada). Escapada 1 mayo Ñuble.',
    keywords: ['finde largo mayo Las Trancas', 'escapada 1 mayo Ñuble', 'día del trabajo Valle Las Trancas', 'glamping finde largo', 'domos geodésicos mayo', 'alojamiento 1 mayo chile', 'finde largo ñuble', 'glamping día del trabajo'],
    // Landing de fecha pasada (finde largo 01-04 mayo 2026): noindex hasta
    // reutilizarla para la próxima edición, para no invitar a reservar fechas vencidas.
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/finde-largo-dia-trabajo-las-trancas',
    },
    openGraph: {
        title: 'Finde Largo Mayo Las Trancas | Escapada 1 Mayo Ñuble — TreePod',
        description: 'Pasa el finde largo del día del trabajo en Valle Las Trancas. Domos geodésicos en bosque nativo, con tinaja privada opcional (servicio de temporada).',
        images: ['/images/hero/Las Trancas Bosque Nativo 4.jpeg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Finde Largo Mayo Las Trancas | Escapada 1 Mayo Ñuble — TreePod',
        description: 'Finde largo del día del trabajo en Valle Las Trancas. Domos en el bosque, con tinaja privada opcional (servicio de temporada).',
        images: ['/images/hero/Las Trancas Bosque Nativo 4.jpeg'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me gustaría consultar por el finde largo del día del trabajo en mayo 2026.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const reservaHref = "/disponibilidad?entrada=2026-05-01&salida=2026-05-04&adultos=2&event=finde-largo-mayo";

export default function FindeLargoPage() {
    return (
        <SeasonalLanding
            trackViewEvent="view_finde_largo_mayo_page"
            hero={{
                image: "/images/hero/Las Trancas Bosque Nativo 4.jpeg",
                alt: "Finde largo mayo Las Trancas TreePod",
                eyebrow: "Finde Largo Mayo · Valle Las Trancas",
                title: <>Tu finde largo del día del trabajo en el bosque nativo de Valle Las Trancas</>,
                text: "Tres días en la montaña, con el bosque nativo y el otoño en la cordillera. Con opción de tinaja privada (servicio de temporada, vuelve en primavera).",
                priceLine: "Tarifas según temporada",
                priceSub: "Revisa el precio de tus fechas en el calendario de reservas",
                stat: "01–04",
                statCaption: "mayo 2026 · finde largo",
                photoCaption: "Bosque nativo, Valle Las Trancas",
            }}
            heroCta={{
                href: reservaHref,
                eventName: "click_reservar_finde_largo_mayo",
                secondEventName: "begin_checkout_finde_largo",
                secondParams: { event: "finde_largo_mayo_2026" },
                label: "Reserva tu escapada ahora",
            }}
            whatsapp={{
                url: whatsappUrl,
                eventName: "click_whatsapp_finde_largo_mayo",
                label: "Consultar por WhatsApp",
            }}
            beneficios={{
                label: "La estadía",
                title: <>El finde largo para <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">descansar</span> después del trabajo</>,
                lead: "Escapada 1 mayo en Ñuble, para cortar la rutina y descansar",
                items: [
                    {
                        title: "Otoño en la cordillera, con menos gente",
                        desc: "Mayo en Las Trancas tiene días templados, noches frescas y colores de otoño, lejos de las multitudes de la temporada alta de invierno."
                    },
                    {
                        title: "Tinaja privada opcional (servicio de temporada)",
                        desc: "Tinaja de ciprés con agua caliente, en uso exclusivo para tu domo. Es un servicio de temporada que vuelve en primavera: consúltanos si está disponible para tus fechas."
                    },
                    {
                        title: "Calefacción automática 24/7",
                        desc: "Las noches de mayo son frescas. Tu domo mantiene una temperatura agradable con estufa a pellet automática mientras afuera disfrutas el otoño."
                    },
                    {
                        title: "3 días para descansar",
                        desc: "Jueves 1, viernes 2 y fin de semana. El finde largo justo para cortar la rutina del trabajo y recargar en la naturaleza."
                    },
                    {
                        title: "WiFi Starlink cuando lo necesites",
                        desc: "Conexión estable disponible. Ideal para compartir fotos del otoño en Las Trancas o seguir conectado si lo necesitas."
                    }
                ],
            }}
            galeria={{
                title: <>Tu refugio otoñal en <span className="italic">Valle Las Trancas</span></>,
                lead: "Lo necesario para tu finde largo de mayo en Las Trancas",
                photos: [
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
                        alt: "Interior cálido del domo con estufa automática",
                        caption: "Calor perfecto · estufa automática",
                    },
                    {
                        src: "/images/wellness/Tinaja1.jpg",
                        alt: "Tinaja privada en el bosque para el finde largo",
                        caption: "Tinaja privada · servicio de temporada",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/Cocina.jpg",
                        alt: "Cocina equipada para el finde largo",
                        caption: "Cocina completa · todo incluido",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-domo-acogedor-21-3.jpg",
                        alt: "Ambiente acogedor para el otoño",
                        caption: "Ambiente perfecto · para relajar",
                    },
                ],
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_finde_largo_mayo_galeria",
                    label: "Ver disponibilidad finde largo mayo",
                },
            }}
            resenas={{
                title: <>Lo que dicen <span className="italic">nuestros huéspedes</span></>,
                lead: "Experiencias reales de quienes ya disfrutaron TreePod",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_finde_largo_mayo_testimonios",
                    label: "Únete a nuestros huéspedes satisfechos",
                },
            }}
            cierre={{
                label: "Finde Largo Mayo 2026",
                title: <>Tenemos solo 4 domos <span className="italic text-[#00ADEF]">para el finde largo</span></>,
                text: "El día del trabajo es uno de los findes largos más buscados del año. Mayo en Valle Las Trancas trae los colores del otoño. Reserva con tiempo tu escapada 1 mayo en Ñuble.",
                note: "Estadía mínima 3 noches: 01 al 04 de mayo 2026",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_finde_largo_mayo_final",
                    secondEventName: "begin_checkout_finde_largo",
                    secondParams: { event: "finde_largo_mayo_2026" },
                    label: "Reserva tu finde largo ahora",
                },
                trust: ["Pago Seguro", "Reserva con el 50%", "Bosque Nativo"],
            }}
        />
    );
}
