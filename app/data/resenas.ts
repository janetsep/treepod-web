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
        fecha: "enero 2026",
        rating: 5,
        destacada: true,
        texto: "Fuimos con mi marido a celebrar año nuevo, estos domos son la definición exacta de descanso, naturaleza y comodidad. La atención de don Jaime fue maravillosa, siempre preocupado de cada detalle, y estaremos eternamente agradecidos de que nos hayan recibido con nuestros hijos perrunos. El desayuno es espectacular. Sin duda una experiencia que repetiremos, pero esta vez en invierno.",
    },
    {
        plataforma: "Google",
        autor: "Lorenzo García",
        fecha: "noviembre 2025",
        rating: 5,
        destacada: true,
        texto: "Nuestra experiencia en los domos fue fantástica. Un ambiente para relajarse y descansar en un entorno tranquilo y en medio del bosque. Mención especial a Jaime, muy atento, acogedor y preocupado. La tinaja también estuvo buenísima y dan sugerencias de actividades en Las Trancas. El desayuno muy rico, 10/10.",
    },
    {
        plataforma: "Google",
        autor: "Daniel Sarmiento",
        fecha: "julio 2025",
        rating: 5,
        texto: "Excelente estadía. El servicio es increíble, los domos cómodos y el paraje está rodeado de un precioso bosque. El servicio por parte de don Jaime fue excelente. Volvería sin duda.",
    },
    {
        plataforma: "Google",
        autor: "Paulina Moya",
        fecha: "julio 2022",
        rating: 5,
        destacada: true,
        texto: "Una maravillosa experiencia. Los domos son preciosos, los dueños cuidan cada detalle. Pese al frío exterior, el domo permaneció muy temperado y cuando llegamos nos estaban esperando hasta con las camas tibias. El desayuno exquisito, hasta el pan estaba recién hecho por ellos mismos. Volveríamos en invierno y en verano.",
    },
    {
        plataforma: "Google",
        autor: "Víctor Pasmiño",
        fecha: "enero 2024",
        rating: 5,
        texto: "Una experiencia inolvidable, lo recomiendo al 100%. Tiene todas las comodidades de un hotel en un ambiente mágico. El lugar estaba en óptimas condiciones, muy limpio, ambiente tranquilo y don Jaime fue muy amable, nos recomendó panoramas y senderos, atento en todo momento.",
    },
    {
        plataforma: "Google",
        autor: "Damien Dauge",
        fecha: "febrero 2024",
        rating: 5,
        texto: "Séjour incroyable. Dès notre arrivée nous nous sommes sentis comme chez nous avec des hôtes d'une gentillesse rare. Les petits déjeuners sont très bons, les pizzas sont excellentes. L'emplacement est parfait pour faire les dizaines de balades aux alentours.",
    },
    {
        plataforma: "TripAdvisor",
        autor: "Matías",
        fecha: "julio 2021",
        rating: 5,
        texto: "Llegamos y el domo estaba calentito, muy equipado, todo muy limpio. El encargado nos dio tips sobre qué hacer durante el día y mantuvo el contacto por WhatsApp en todo momento. El desayuno exquisito y contundente, perfecto para ir con energía a la nieve. Calidad/precio garantizado.",
    },
    {
        plataforma: "Google",
        autor: "Eleonora",
        fecha: "julio 2025",
        rating: 5,
        texto: "Lindo lugar, los domos muy bien mantenidos, buena calefacción.",
    },
];
