import type { Metadata } from 'next';
import SeasonalLanding from '../components/SeasonalLanding';

// Fiestas Patrias 2026: el 18 y el 19 de septiembre caen VIERNES y SÁBADO, así
// que el fin de semana largo va del jueves 17 al lunes 21. Al 30-jul-2026 los
// cuatro domos estaban libres esos días: es la mayor venta al alcance del año.
// Sigue siendo temporada de invierno (hasta el 21 de septiembre), por lo que
// esta página NO puede mostrar ni prometer la tinaja (cerrada todo el invierno)
// ni afirmar que habrá nieve. Ver [[veracidad-contenidos]] en el cerebro.

export const metadata: Metadata = {
    title: 'Fiestas Patrias 2026 en Las Trancas | Domos TreePod, Ñuble',
    description: 'Pasa el 18 de septiembre en el bosque nativo de Valle Las Trancas. Domos geodésicos cálidos para 2 a 4 personas, con parrilla en tu domo. Fin de semana largo del 17 al 21 de septiembre 2026.',
    keywords: ['fiestas patrias las trancas', 'donde alojar 18 de septiembre ñuble', '18 de septiembre valle las trancas', 'fin de semana largo septiembre 2026', 'glamping fiestas patrias', 'domos 18 de septiembre chillán', 'escapada fiestas patrias sur de chile', 'alojamiento 18 septiembre nevados de chillán'],
    alternates: {
        canonical: '/fiestas-patrias-las-trancas',
    },
    openGraph: {
        title: 'Fiestas Patrias 2026 en Valle Las Trancas | Domos TreePod',
        description: 'El 18 y 19 caen viernes y sábado. Cuatro domos en el bosque nativo, a 12 minutos de Nevados de Chillán.',
        images: ['/images/Galeria/domo3noche1.jpeg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fiestas Patrias 2026 en Valle Las Trancas | Domos TreePod',
        description: 'El 18 y 19 caen viernes y sábado. Cuatro domos en el bosque nativo, a 12 minutos de Nevados de Chillán.',
        images: ['/images/Galeria/domo3noche1.jpeg'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, quiero consultar por Fiestas Patrias, del 17 al 21 de septiembre.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

// Viernes 18 a lunes 21: tres noches, el tramo que más se pide. Quien quiera
// llegar el jueves lo ajusta en el calendario.
const reservaHref = "/disponibilidad?entrada=2026-09-18&salida=2026-09-21&adultos=4&event=fiestas-patrias";

export default function FiestasPatriasPage() {
    return (
        <SeasonalLanding
            trackViewEvent="view_fiestas_patrias_page"
            hero={{
                image: "/images/Galeria/domo3noche1.jpeg",
                alt: "Domo TreePod iluminado de noche entre los árboles, Valle Las Trancas",
                position: "center 40%",
                eyebrow: "Fiestas Patrias 2026 · Valle Las Trancas",
                title: <>Este 18 celebra en el bosque, no en el taco</>,
                text: "El 18 y el 19 caen viernes y sábado: son cuatro días. Tu domo entre los robles, con la parrilla en tu propio domo y el valle a 12 minutos de Nevados de Chillán.",
                priceLine: "Desde $175.000 la noche para 4 personas",
                priceSub: "Tarifa de invierno, estadías de 2 noches o más. Se reserva con el 50%.",
                stat: "17–21",
                statCaption: "septiembre 2026 · fin de semana largo",
                photoCaption: "Domo entre los árboles, Valle Las Trancas",
            }}
            heroCta={{
                href: reservaHref,
                eventName: "click_reservar_fiestas_patrias",
                secondEventName: "begin_checkout_fiestas_patrias",
                secondParams: { event: "fiestas_patrias_2026" },
                label: "Ver disponibilidad del 18",
                sublabel: "Solo tenemos 4 domos",
            }}
            whatsapp={{
                url: whatsappUrl,
                eventName: "click_whatsapp_fiestas_patrias",
                label: "Consultar por WhatsApp",
            }}
            beneficios={{
                label: "El fin de semana largo",
                title: <>Cuatro días de <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">septiembre</span> en la cordillera</>,
                lead: "Jueves 17, viernes 18, sábado 19 y domingo 20: el finde largo más grande del año",
                items: [
                    {
                        title: "La parrilla llega a tu domo",
                        desc: "Te llevamos la parrilla hasta tu domo para que hagas tu asado del 18 sin compartir espacio con nadie. Tú pones la carne y el vino; el bosque pone el resto.",
                    },
                    {
                        title: "Solo cuatro domos en todo el terreno",
                        desc: "No somos un complejo con cien cabañas. Son cuatro domos separados entre los árboles: el 18 se escucha el bosque y no la música del vecino.",
                    },
                    {
                        title: "Calor asegurado aunque afuera esté helado",
                        desc: "Septiembre en la montaña todavía es frío de noche. La estufa a pellet automática mantiene el domo completo temperado mientras duermes.",
                    },
                    {
                        title: "A 12 minutos de Nevados de Chillán",
                        desc: "El centro de ski y las termas quedan a un cuarto de hora. Si queda nieve, alcanzas a subir; si no, hay senderos, cabalgatas y el valle entero.",
                    },
                    {
                        title: "Cocina equipada y WiFi Starlink",
                        desc: "Cocina completa para los días largos, y conexión estable en un valle donde casi nadie tiene señal.",
                    },
                ],
            }}
            galeria={{
                title: <>Tu 18 de septiembre en <span className="italic">Valle Las Trancas</span></>,
                lead: "Así se ve el lugar donde vas a pasar el fin de semana largo",
                photos: [
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
                        alt: "Interior del domo con la cama y la estufa a pellet",
                        caption: "Domo temperado · estufa automática",
                    },
                    {
                        src: "/images/Galeria/lastrancas-exterior-domo-8-2.jpg",
                        alt: "Domo geodésico entre el bosque nativo de Valle Las Trancas",
                        caption: "Bosque nativo · terraza privada",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/Cocina.jpg",
                        alt: "Cocina equipada del domo",
                        caption: "Cocina completa · para los días largos",
                    },
                    {
                        src: "/images/Galeria/Desayuno.jpg",
                        alt: "Desayuno servido con productos de la zona",
                        caption: "Desayuno al domo · servicio con cargo",
                    },
                ],
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_fiestas_patrias_galeria",
                    label: "Ver disponibilidad del 17 al 21",
                },
            }}
            resenas={{
                title: <>Lo que dicen <span className="italic">nuestros huéspedes</span></>,
                lead: "4,9 con 209 reseñas sumando todas las plataformas",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_fiestas_patrias_testimonios",
                    label: "Reservar mi domo para el 18",
                },
            }}
            cierre={{
                label: "Fiestas Patrias 2026",
                title: <>Son cuatro domos <span className="italic text-[#00ADEF]">para todo el fin de semana largo</span></>,
                text: "El 18 y el 19 caen viernes y sábado, y este es de los findes largos que se llenan primero en la cordillera. Reserva con el 50%; el saldo lo pagas al llegar.",
                note: "Jueves 17 al lunes 21 de septiembre 2026 · atendido por sus dueños, Janet y Jaime",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_fiestas_patrias_final",
                    secondEventName: "begin_checkout_fiestas_patrias",
                    secondParams: { event: "fiestas_patrias_2026" },
                    label: "Reservar mi 18 en el bosque",
                },
                trust: ["Pago seguro con Webpay", "Reserva con el 50%", "Registro SERNATUR N° 36806"],
            }}
        />
    );
}
