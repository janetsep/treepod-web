// Reseñas REALES de huéspedes, citadas textualmente desde cada plataforma.
// Sistema propio (reemplaza Elfsight): texto indexable por Google, carga cero JS externo.
// Para agregar una reseña: copiar el texto exacto de la plataforma y añadir un objeto aquí.

export type Plataforma = "Google" | "TripAdvisor" | "Airbnb" | "Booking.com";

export interface Resena {
    plataforma: Plataforma;
    autor: string;
    fecha: string; // como se muestra, p. ej. "enero 2026"
    rating: number; // 1 a 5
    texto: string;
    url: string; // link directo a la reseña original en la plataforma
    destacada?: boolean;
}

// Datos agregados verificados (julio 2026)
export const RESUMEN = {
    rating: "4,9",
    totalTexto: "209 reseñas de todas las plataformas",
    plataformas: [
        {
            nombre: "Google",
            rating: "4,9",
            detalle: "59 reseñas",
            url: "https://www.google.com/maps/place/?q=place_id:ChIJLeBk77CVbpYROCttTaLeCpw",
        },
        {
            nombre: "Airbnb",
            rating: "5,0",
            detalle: "Favorito entre huéspedes — Superhost",
            url: "https://www.airbnb.cl/rooms/37213792",
        },
        {
            nombre: "Booking.com",
            rating: "9,6",
            detalle: "76 opiniones (ficha pausada temporalmente)",
            url: null,
        },
        {
            nombre: "TripAdvisor",
            rating: "5,0",
            detalle: "N° 2 de alojamientos especiales en Las Trancas",
            url: "https://www.tripadvisor.cl/Hotel_Review-g11848562-d16665666-Reviews-Glamping_Domos_Treepod-Valle_Las_Trancas_Biobio_Region.html",
        },
    ],
};

export const RESENAS: Resena[] = [
    {
        plataforma: "TripAdvisor",
        autor: "Lidia y Andrés",
        url: "https://www.tripadvisor.cl/ShowUserReviews-g11848562-d16665666-r1044794415",
        fecha: "enero 2026",
        rating: 5,
        destacada: true,
        texto: "Fuimos con mi marido a celebrar año nuevo, estos domos son la definición exacta de descanso, naturaleza y comodidad. La atención de don Jaime fue maravillosa, siempre preocupado de cada detalle, y estaremos eternamente agradecidos de que nos hayan recibido con nuestros hijos perrunos. El desayuno es espectacular. Sin duda una experiencia que repetiremos, pero esta vez en invierno.",
    },
    {
        plataforma: "Google",
        autor: "Lorenzo García",
        url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2toUk1FZDVkMjFTVTNrMVZtOXVWR2RqVWpsWE5IYxAB!2m1!1s0x0:0x9c0adea24d6d2b38!3m1!1s2@1:CAIQACodChtycF9oOkhRMEd5d21SU3k1Vm9uVGdjUjlXNHc%7C%7C?hl=es",
        fecha: "noviembre 2025",
        rating: 5,
        destacada: true,
        texto: "Nuestra experiencia en los domos fue fantástica. Un ambiente para relajarse y descansar en un entorno tranquilo y en medio del bosque. Mención especial a Jaime, muy atento, acogedor y preocupado. La tinaja también estuvo buenísima y dan sugerencias de actividades en Las Trancas. El desayuno muy rico, 10/10.",
    },
    {
        plataforma: "Google",
        autor: "Daniel Sarmiento",
        url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT21rek0wdGhPRWhqWlZsVlNXUktTM0EwZG5kTVpuYxAB!2m1!1s0x0:0x9c0adea24d6d2b38!3m1!1s2@1:CAIQACodChtycF9oOmkzM0thOEhjZVlVSWRKS3A0dndMZnc%7C%7C?hl=es",
        fecha: "julio 2025",
        rating: 5,
        texto: "Excelente estadía. El servicio es increíble, los domos cómodos y el paraje está rodeado de un precioso bosque. El servicio por parte de don Jaime fue excelente. Volvería sin duda.",
    },
    {
        plataforma: "Google",
        autor: "Paulina Moya",
        url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChZDSUhNMG9nS0VJQ0FnSURPNjZQZkFREAE!2m1!1s0x0:0x9c0adea24d6d2b38!3m1!1s2@1:CIHM0ogKEICAgIDO66PfAQ%7C%7C?hl=es",
        fecha: "julio 2022",
        rating: 5,
        destacada: true,
        texto: "Una maravillosa experiencia. Los domos son preciosos, los dueños cuidan cada detalle. Pese al frío exterior, el domo permaneció muy temperado y cuando llegamos nos estaban esperando hasta con las camas tibias. El desayuno exquisito, hasta el pan estaba recién hecho por ellos mismos. Volveríamos en invierno y en verano.",
    },
    {
        plataforma: "Google",
        autor: "Víctor Pasmiño",
        url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChdDSUhNMG9nS0VJQ0FnSUMxeGRhUW93RRAB!2m1!1s0x0:0x9c0adea24d6d2b38!3m1!1s2@1:CIHM0ogKEICAgIC1xdaQowE%7C%7C?hl=es",
        fecha: "enero 2024",
        rating: 5,
        texto: "Una experiencia inolvidable, lo recomiendo al 100%. Tiene todas las comodidades de un hotel en un ambiente mágico. El lugar estaba en óptimas condiciones, muy limpio, ambiente tranquilo y don Jaime fue muy amable, nos recomendó panoramas y senderos, atento en todo momento.",
    },
    {
        plataforma: "Google",
        autor: "Damien Dauge",
        url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChdDSUhNMG9nS0VJQ0FnSUR0dHNidjFBRRAB!2m1!1s0x0:0x9c0adea24d6d2b38!3m1!1s2@1:CIHM0ogKEICAgIDttsbv1AE%7C%7C?hl=es",
        fecha: "febrero 2024",
        rating: 5,
        texto: "Séjour incroyable. Dès notre arrivée nous nous sommes sentis comme chez nous avec des hôtes d'une gentillesse rare. Les petits déjeuners sont très bons, les pizzas sont excellentes. L'emplacement est parfait pour faire les dizaines de balades aux alentours.",
    },
    {
        plataforma: "TripAdvisor",
        autor: "Matías",
        url: "https://www.tripadvisor.cl/ShowUserReviews-g11848562-d16665666-r797767433",
        fecha: "julio 2021",
        rating: 5,
        texto: "Llegamos y el domo estaba calentito, muy equipado, todo muy limpio. El encargado nos dio tips sobre qué hacer durante el día y mantuvo el contacto por WhatsApp en todo momento. El desayuno exquisito y contundente, perfecto para ir con energía a la nieve. Calidad/precio garantizado.",
    },
    {
        plataforma: "Google",
        autor: "Eleonora",
        url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xkQlNtUnRka0phVm1Jek5XdDFVVmxVT1ZaMlVuYxAB!2m1!1s0x0:0x9c0adea24d6d2b38!3m1!1s2@1:CAIQACodChtycF9oOldBSmRtdkJaVmIzNWt1UVlUOVZ2Unc%7C%7C?hl=es",
        fecha: "julio 2025",
        rating: 5,
        texto: "Lindo lugar, los domos muy bien mantenidos, buena calefacción.",
    },
];

// Distinciones verificadas (solo con respaldo público comprobable)
// Distinción principal: se muestra destacada, separada de la lista
export const DISTINCION_PRINCIPAL = {
    titulo: "Más Valor Turístico 2024",
    subtitulo: "Ganador regional, Región de Ñuble",
    detalle: "Concurso nacional de Sernatur que premia la innovación turística",
    logo: "/images/distinciones/sernatur-color.jpg",
    url: "https://www.sernatur.cl/empresas-de-nuble-recibieron-reconocimientos-mas-valor-turistico-codigo-esnna-y-sellos-r-de-registro-sernatur/",
};

export const DISTINCIONES = [
    {
        titulo: "Ponle Energía a tu Pyme",
        detalle: "Ministerio de Energía — eficiencia energética (2024)",
        logo: "/images/distinciones/energia.png",
        url: "https://energia.gob.cl/noticias/nuble/seremi-de-energia-nuble-visito-emprendimientos-beneficiados-por-ponle-energia-tu-pyme-en-pinto",
    },
    {
        titulo: "Sello Impacta Sustentable 2025",
        detalle: "Sercotec + FEN U. de Chile — categoría Travesía",
        logo: "/images/distinciones/sercotec.svg",
        url: "https://www.instagram.com/reel/DYmt_uVASu6/",
    },
    {
        titulo: "Favorito entre huéspedes y Superhost",
        detalle: "Airbnb",
        logo: null,
        url: "https://www.airbnb.cl/rooms/37213792",
    },
    {
        titulo: "Registro Nacional de Sernatur",
        detalle: "Servicio turístico registrado N° 36805",
        logo: null,
        url: "https://serviciosturisticos.sernatur.cl/",
    },
];
