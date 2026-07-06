import SeasonalLanding from '../components/SeasonalLanding';
import { getDomoPriceForNights } from '@/lib/pricing';

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me gustaría consultar por el finde largo de las Glorias Navales (21–24 mayo 2026).";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const reservaHref = "/disponibilidad?entrada=2026-05-21&salida=2026-05-24&adultos=2&event=glorias-navales";

export default async function GloriasNavalesPage() {
    const priceNight = await getDomoPriceForNights(1);
    const priceText = priceNight
        ? `Desde $${new Intl.NumberFormat('es-CL').format(priceNight)} por noche`
        : 'Tarifas dinámicas según temporada';
    return (
        <SeasonalLanding
            trackViewEvent="view_glorias_navales_page"
            hero={{
                image: "/images/hero/Otono2.jpg",
                alt: "Otoño en Valle Las Trancas — Glorias Navales TreePod",
                position: "center 30%",
                eyebrow: "Finde Largo 21–24 Mayo · Valle Las Trancas",
                title: <>Tu finde largo de Glorias Navales en el bosque nativo <span className="italic">de Valle Las Trancas</span></>,
                text: "4 días en la cordillera, con el bosque nativo y opción de tinaja privada (servicio de temporada, vuelve en primavera).",
                priceLine: priceText,
                priceSub: "Glorias Navales · 21 al 24 Mayo 2026",
                stat: "21–24",
                statCaption: "mayo 2026 · Glorias Navales",
                photoCaption: "Otoño en Valle Las Trancas",
            }}
            heroCta={{
                href: reservaHref,
                eventName: "click_reservar_glorias_navales",
                secondEventName: "begin_checkout_glorias_navales",
                secondParams: { event: "glorias_navales_2026" },
                label: "Reserva tu escapada ahora",
            }}
            whatsapp={{
                url: whatsappUrl,
                eventName: "click_whatsapp_glorias_navales",
                label: "Consultar por WhatsApp",
            }}
            beneficios={{
                label: "La estadía",
                title: <>El finde largo que <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">vale la pena</span> planificar bien</>,
                lead: "Escapada Glorias Navales 21–24 mayo: 4 días para vivir la naturaleza en familia o en pareja",
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
                        title: "4 días para estar en la naturaleza",
                        desc: "Jueves 21 (Glorias Navales), viernes 22 sándwich y fin de semana. El finde largo justo para recargar en la naturaleza, sin apuros."
                    },
                    {
                        title: "WiFi Starlink cuando lo necesites",
                        desc: "Conexión estable disponible. Ideal para compartir fotos del otoño en Las Trancas o seguir conectado si lo necesitas."
                    }
                ],
            }}
            galeria={{
                title: <>Tu refugio otoñal en <span className="italic">Valle Las Trancas</span></>,
                lead: "Lo necesario para tu finde largo de Glorias Navales",
                photos: [
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
                        alt: "Interior cálido del domo con estufa automática",
                        caption: "Calor perfecto · estufa automática",
                    },
                    {
                        src: "/images/wellness/Tinaja1.jpg",
                        alt: "Tinaja privada en el bosque para Glorias Navales",
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
                    eventName: "click_reservar_glorias_navales_galeria",
                    label: "Ver disponibilidad Glorias Navales",
                },
            }}
            resenas={{
                title: <>Lo que dicen <span className="italic">nuestros huéspedes</span></>,
                lead: "Experiencias reales de quienes ya disfrutaron TreePod",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_glorias_navales_testimonios",
                    label: "Únete a nuestros huéspedes satisfechos",
                },
            }}
            cierre={{
                label: "Glorias Navales · 21–24 Mayo 2026",
                title: <>Tenemos solo 4 domos <span className="italic text-[#00ADEF]">para Glorias Navales</span></>,
                text: "Las Glorias Navales son uno de los findes largos más buscados del año. Mayo en Valle Las Trancas trae los colores del otoño. Reserva con tiempo tu escapada del 21 de mayo en Ñuble.",
                note: "Estadía mínima 3 noches: 21 al 24 de mayo 2026",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_glorias_navales_final",
                    secondEventName: "begin_checkout_glorias_navales",
                    secondParams: { event: "glorias_navales_2026" },
                    label: "Reserva tu finde largo ahora",
                },
                trust: ["Pago Seguro", "Reserva con el 50%", "Bosque Nativo"],
            }}
        />
    );
}
