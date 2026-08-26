import type { Metadata } from 'next';
import SeasonalLanding from '../components/SeasonalLanding';

// Fiestas Patrias 2026: el 18 y el 19 de septiembre caen VIERNES y SÁBADO. La
// estadía promocionada entra el jueves 17 y sale el domingo 20. Al 30-jul-2026 los
// cuatro domos estaban libres esos días: es la mayor venta al alcance del año.
// Sigue siendo temporada de invierno (hasta el 21 de septiembre), por lo que
// esta página NO puede mostrar ni prometer la tinaja (cerrada todo el invierno)
// ni afirmar que habrá nieve. Ver [[veracidad-contenidos]] en el cerebro.

export const metadata: Metadata = {
    title: 'Fiestas Patrias 2026 en Las Trancas | Domos TreePod, Ñuble',
    description: 'Pasa el 18 de septiembre en el bosque nativo de Valle Las Trancas. Domos geodésicos cálidos para 2 a 4 personas. Estadía del 17 al 20 de septiembre 2026.',
    keywords: ['fiestas patrias las trancas', 'donde alojar 18 de septiembre ñuble', '18 de septiembre valle las trancas', 'fin de semana largo septiembre 2026', 'glamping fiestas patrias', 'domos 18 de septiembre chillán', 'escapada fiestas patrias sur de chile', 'alojamiento 18 septiembre nevados de chillán'],
    alternates: {
        canonical: '/fiestas-patrias-las-trancas',
    },
    openGraph: {
        title: 'Fiestas Patrias 2026 en Valle Las Trancas | Domos TreePod',
        description: 'El 18 y el 19 caen viernes y sábado. Cuatro domos en el bosque nativo, a 12 minutos de Nevados de Chillán.',
        images: ['/images/Galeria/domo3noche1.jpeg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fiestas Patrias 2026 en Valle Las Trancas | Domos TreePod',
        description: 'El 18 y el 19 caen viernes y sábado. Cuatro domos en el bosque nativo, a 12 minutos de Nevados de Chillán.',
        images: ['/images/Galeria/domo3noche1.jpeg'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, quiero consultar por Fiestas Patrias, del 17 al 20 de septiembre.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

// La landing promociona ingreso jueves 17 y salida domingo 20: tres noches.
// El calendario debe abrir exactamente ese rango.
const reservaHref = "/disponibilidad?entrada=2026-09-17&salida=2026-09-20&adultos=4&event=fiestas-patrias#reservar";

export default function FiestasPatriasPage() {
    return (
        <SeasonalLanding
            trackViewEvent="view_fiestas_patrias_page"
            hero={{
                image: "/images/Galeria/domo3noche1.jpeg",
                alt: "Domo TreePod iluminado de noche entre los árboles, Valle Las Trancas",
                position: "center 40%",
                eyebrow: "Fiestas Patrias 2026 · Valle Las Trancas",
                title: <>Este 18, celebra entre los árboles</>,
                text: "Ingresa el jueves 17 y sal el domingo 20: son tres noches en tu domo geodésico, entre los robles y a 12 minutos de Nevados de Chillán. Para tu asado, llevamos la parrilla hasta el domo.",
                priceLine: "Desde $175.000 la noche para 4 personas",
                priceSub: "Tarifa de invierno. Reserva con el 50%.",
                stat: "17–20",
                statCaption: "septiembre 2026 · fin de semana largo",
                photoCaption: "Domo entre los árboles, Valle Las Trancas",
            }}
            heroCta={{
                href: reservaHref,
                eventName: "click_reservar_fiestas_patrias",
                secondEventName: "begin_checkout_fiestas_patrias",
                secondParams: { event: "fiestas_patrias_2026" },
                label: "Ver disponibilidad del 17 al 20",
                sublabel: "Reserva directa con TreePod",
            }}
            whatsapp={{
                url: whatsappUrl,
                eventName: "click_whatsapp_fiestas_patrias",
                label: "Consultar por WhatsApp",
            }}
            beneficios={{
                label: "El fin de semana largo",
                title: <>Tres noches de <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">septiembre</span> en la cordillera</>,
                lead: "Ingreso el jueves 17 y salida el domingo 20: tres noches para pasar Fiestas Patrias en la cordillera.",
                items: [
                    {
                        // El quincho salió de esta landing: a agosto de 2026 la obra
                        // lleva tres meses sin terminarse y no se anuncia lo que no
                        // se puede cumplir. Volver a sumarlo solo con la obra recibida
                        // y una foto real.
                        title: "Tu asado del 18, junto a tu domo",
                        desc: "Llevamos la parrilla hasta tu domo para que prepares tu asado. Tú eliges qué cocinar y nosotros dejamos la parrilla lista en tu espacio.",
                    },
                    {
                        title: "Cuatro domos entre los árboles",
                        desc: "TreePod tiene cuatro domos geodésicos distribuidos en el terreno. Cada uno cuenta con su propio espacio para disfrutar la estadía.",
                    },
                    {
                        title: "Un domo temperado para las noches frías",
                        desc: "En septiembre, las noches de montaña todavía pueden ser frías. La estufa a pellet automática ayuda a mantener temperado el domo completo.",
                    },
                    {
                        title: "A 12 minutos de Nevados de Chillán",
                        desc: "Nevados de Chillán y las termas están a 12 minutos en auto. La presencia de nieve varía según el clima y la temporada; consúltanos antes de viajar.",
                    },
                    {
                        title: "Cocina equipada y Wi-Fi Starlink",
                        desc: "Cada domo cuenta con cocina equipada y conexión Wi-Fi Starlink para usar durante la estadía.",
                    },
                ],
            }}
            galeria={{
                title: <>Así es tu domo para <span className="italic">Fiestas Patrias</span></>,
                lead: "Imágenes reales de TreePod y de los espacios que encontrarás durante tu estadía.",
                photos: [
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
                        alt: "Interior del domo con la cama y la estufa a pellet",
                        caption: "Domo temperado · estufa automática",
                    },
                    {
                        src: "/images/Galeria/lastrancas-exterior-domo-8-2.jpg",
                        alt: "Domo geodésico en el bosque nativo de Valle Las Trancas",
                        caption: "Bosque nativo · terraza privada",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/Cocina.jpg",
                        alt: "Cocina equipada del domo",
                        caption: "Cocina equipada · dentro del domo",
                    },
                    {
                        src: "/images/Galeria/Desayuno.jpg",
                        alt: "Desayuno servido en el domo",
                        caption: "Desayuno al domo · servicio con cargo",
                    },
                ],
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_fiestas_patrias_galeria",
                    label: "Ver disponibilidad del 17 al 20",
                },
            }}
            resenas={{
                title: <>Lo que dicen <span className="italic">nuestros huéspedes</span></>,
                lead: "4,9 · 209 reseñas de todas las plataformas",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_fiestas_patrias_testimonios",
                    label: "Reservar del 17 al 20",
                },
            }}
            cierre={{
                label: "Fiestas Patrias 2026",
                title: <>Tres noches en un domo geodésico <span className="italic text-[#00ADEF]">en Valle Las Trancas</span></>,
                text: "El 18 y el 19 caen viernes y sábado. Ingresa el jueves 17, sal el domingo 20 y confirma pagando el 50% mediante Webpay. El saldo se paga al llegar.",
                note: "Del jueves 17 al domingo 20 de septiembre de 2026 · atendido por sus dueños, Janet y Jaime",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_fiestas_patrias_final",
                    secondEventName: "begin_checkout_fiestas_patrias",
                    secondParams: { event: "fiestas_patrias_2026" },
                    label: "Reservar del 17 al 20",
                },
                trust: ["Pago seguro con Webpay", "Reserva con el 50%", "Registro SERNATUR N° 36805"],
            }}
        />
    );
}
