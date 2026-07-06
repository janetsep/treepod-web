import type { Metadata } from 'next';
import SeasonalLanding from '../components/SeasonalLanding';

export const metadata: Metadata = {
    title: 'Semana Santa 2026 en TreePod | Glamping Valle Las Trancas',
    description: 'Pasa Semana Santa con calma en nuestros domos geodésicos del Valle Las Trancas. Bosque nativo, estufa a pellet y descanso real cerca de Nevados de Chillán.',
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/semana-santa-2026',
    },
    openGraph: {
        title: 'Semana Santa 2026 en TreePod | Valle Las Trancas',
        description: 'Pasa Semana Santa con calma en nuestros domos del Valle Las Trancas: bosque nativo, estufa a pellet y descanso real.',
        images: ['/images/Semana Santa en el bosque.png'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me gustaría consultar por la estadía de Semana Santa 2026.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const reservaHref = "/disponibilidad?entrada=2026-04-02&salida=2026-04-05&adultos=2&event=semana-santa";

export default function SemanaSantaPage() {
    return (
        <SeasonalLanding
            trackViewEvent="view_semana_santa_page"
            hero={{
                image: "/images/Semana Santa en el bosque.png",
                alt: "Semana Santa en TreePod",
                eyebrow: "Semana Santa 2026 · Valle Las Trancas",
                title: <>Pasa Semana Santa lejos del bullicio en un domo entre el bosque <span className="italic">de Valle Las Trancas</span></>,
                text: "Mientras los destinos de siempre se llenan, aquí tienes bosque nativo, aire puro y un domo cálido en plena cordillera de Ñuble. Sin filas, sin ruido, sin apuro.",
                priceLine: "Tarifas según temporada",
                priceSub: "Revisa el precio de tus fechas en el calendario de reservas",
                stat: "02–05",
                statCaption: "abril · Semana Santa 2026",
                photoCaption: "Valle Las Trancas · Ñuble",
            }}
            heroCta={{
                href: reservaHref,
                eventName: "click_reservar_semana_santa",
                secondEventName: "begin_checkout_semana_santa",
                secondParams: { event: "semana_santa_2026" },
                label: "Reserva tu refugio ahora",
            }}
            whatsapp={{
                url: whatsappUrl,
                eventName: "click_whatsapp_semana_santa",
                label: "Consultar disponibilidad por WhatsApp",
            }}
            beneficios={{
                label: "La estadía",
                title: <>Olvida la rutina. Tu único trabajo aquí será <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">descansar</span></>,
                items: [
                    {
                        title: "El sonido del viento y poco más",
                        desc: "Estás lo bastante lejos del bullicio para descansar de verdad. Duerme hasta la hora que quieras y despierta rodeado de bosque nativo."
                    },
                    {
                        title: "Bosque nativo y cielo estrellado",
                        desc: "Domos separados entre sí e inmersos en bosque nativo, cada uno con su pasarela. De noche, el cielo despejado de Las Trancas. La tinaja de ciprés es un servicio de temporada que vuelve en primavera."
                    },
                    {
                        title: "Afuera hace frío, adentro estás en polera",
                        desc: "Nada de pasar frío en la montaña. Tu domo tiene una estufa a pellet automática que lo mantiene cálido de día y de noche."
                    },
                    {
                        title: "Mañanas sin prisa",
                        desc: "Despierta con la luz natural y tómate un café caliente en tu terraza, sin apuro."
                    },
                    {
                        title: "Aislado de todo, pero conectado (si quieres)",
                        desc: "Internet satelital Starlink de alta velocidad. Perfecto por si quieres subir fotos o ver una película por la noche sin cortes."
                    }
                ],
            }}
            galeria={{
                title: <>Tu refugio privado <span className="italic">en el bosque</span></>,
                lead: "Interior cálido, cocina equipada y todo lo necesario para descansar tranquilo",
                photos: [
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
                        alt: "Interior acogedor del domo con cama y estufa",
                        caption: "Interior cálido · estufa a pellet automática",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/Cocina.jpg",
                        alt: "Cocina completa del domo",
                        caption: "Cocina equipada · todo para cocinar",
                    },
                    {
                        src: "/images/wellness/Tinaja1.jpg",
                        alt: "Tinaja de ciprés rodeada de bosque nativo",
                        caption: "Tinaja de ciprés · servicio de temporada (vuelve en primavera)",
                    },
                    {
                        src: "/images/EquipamientoParaTuEstadia/interior-domo-acogedor-21-3.jpg",
                        alt: "Ambiente acogedor del interior",
                        caption: "Espacio para relajar · ambiente perfecto",
                    },
                ],
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_semana_santa",
                    label: "Ver disponibilidad para estas fechas",
                },
            }}
            resenas={{
                title: <>Lo que dicen <span className="italic">nuestros huéspedes</span></>,
                lead: "Reseñas reales de quienes ya vivieron la experiencia TreePod",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_semana_santa",
                    label: "Únete a nuestros huéspedes satisfechos",
                },
            }}
            cierre={{
                label: "Cupos limitados",
                title: <>Semana Santa se llena rápido <span className="italic text-[#00ADEF]">en el Valle</span></>,
                text: "Es uno de los fines de semana más buscados del año y tenemos pocos domos disponibles para estas fechas. Si te interesa, conviene reservar con tiempo.",
                note: "Estadía mínima de 3 noches: 02 al 05 de abril",
                cta: {
                    href: reservaHref,
                    eventName: "click_reservar_semana_santa_final",
                    secondEventName: "begin_checkout_semana_santa",
                    secondParams: { event: "semana_santa_2026" },
                    label: "Reserva antes de que se agoten las fechas",
                },
                trust: ["Pago Verificado", "Reserva con el 50%", "Entorno Natural"],
            }}
        />
    );
}
