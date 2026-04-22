import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import TrackView from '../../components/TrackView';

// Lista simple de artículos disponibles
const availableArticles = [
    'que-hacer-valle-las-trancas-por-temporada',
    'como-llegar-valle-las-trancas-desde-santiago',
    'mejores-restaurantes-valle-las-trancas-2026',
    'termas-nevados-chillan-precios-horarios-2026',
    'que-llevar-glamping-valle-las-trancas-lista',
    'clima-valle-las-trancas-por-mes-2026'
];

const articleContent: Record<string, any> = {
    'que-hacer-valle-las-trancas-por-temporada': {
        title: 'Qué Hacer en Valle Las Trancas por Temporada',
        excerpt: 'Guía completa de actividades en Valle Las Trancas según la época del año',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        content: `
# Qué Hacer en Valle Las Trancas por Temporada

Valle Las Trancas ofrece actividades únicas durante todo el año. Aquí tienes la guía completa para planificar tu visita según la temporada.

## 🏔️ Invierno (Junio - Septiembre)

### Ski y Snowboard
- **Nevados de Chillán**: Pistas para todos los niveles
- **Temporada**: Junio a septiembre
- **Precios day pass**: Desde $35.000 adulto
- **Escuela de ski**: Disponible todos los días

### Termas en Invierno
Las termas son especialmente mágicas en invierno:
- **Termas de Chillán**: Experiencia completa
- **Shangri-La**: Más íntima y exclusiva
- **Termas naturales**: Acceso gratuito en algunos puntos

## 🌸 Primavera (Septiembre - Diciembre)

### Trekking y Senderismo
- **Sendero Shangri-La**: 3 km, dificultad fácil
- **Laguna Huemul**: 8 km, dificultad media
- **Mirador Los Cóndores**: Vista panorámica increíble

### Flora y Fauna
La primavera despierta el valle con:
- Floración de especies nativas
- Avistamiento de aves
- Fotografía de paisajes

## ☀️ Verano (Diciembre - Marzo)

### Actividades Acuáticas
- **Río Renegado**: Pesca deportiva y kayak
- **Pozas naturales**: Refrescantes y cristalinas
- **Rafting**: En ríos cercanos

### Mountain Bike y Trekking
- **Circuitos señalizados** para MTB
- **Senderos de gran recorrido**
- **Camping** bajo las estrellas

## 🍂 Otoño (Marzo - Junio)

### Espectáculo de Colores
- **Bosque nativo**: Rojos y dorados únicos
- **Fotografía**: Luz perfecta para retratos
- **Tranquilidad**: Menos turistas, más paz

### Actividades Relajantes
- **Termas**: Perfectas con aire fresco
- **Caminatas suaves**: Entre hojas otoñales
- **Contemplación**: Silencio y naturaleza

## 📅 Cuándo Venir Según tus Intereses

| Actividad | Mejor Época | Por Qué |
|-----------|-------------|---------|
| **Ski** | Julio - Agosto | Nieve garantizada |
| **Trekking** | Diciembre - Marzo | Senderos libres |
| **Termas** | Todo el año | Cada época tiene su magia |
| **Fotografía** | Marzo - Abril | Colores otoñales |
| **Tranquilidad** | Mayo - Junio | Menos visitantes |

Valle Las Trancas te espera con experiencias únicas en cada temporada. Solo necesitas elegir cuándo vivir tu aventura.
`,
        category: 'Guías',
        readTime: '6 min',
        publishDate: '2026-04-15'
    },
    'como-llegar-valle-las-trancas-desde-santiago': {
        title: 'Cómo Llegar a Valle Las Trancas desde Santiago',
        excerpt: 'Todas las opciones de transporte para llegar a Valle Las Trancas',
        image: '/images/Galeria/Las Trancas Bosque Nativo 2.jpeg',
        content: `
# Cómo Llegar a Valle Las Trancas desde Santiago

## 🚗 En Auto (Recomendado)

### Ruta Principal
- **Distancia**: 425 km
- **Tiempo**: 5.5 horas aprox.
- **Ruta**: Santiago → Los Ángeles → Chillán → Valle Las Trancas

### Detalles del Viaje
1. **Santiago a Los Ángeles**: 3.5 horas por Ruta 5 Sur
2. **Los Ángeles a Chillán**: 1.5 horas por Ruta 5 Sur
3. **Chillán a Valle Las Trancas**: 30 minutos por Ruta N-55

### Consejos Importantes
- **Combustible**: Carga completa en Chillán (última estación)
- **Peajes**: Aproximadamente $8.000 total
- **Neumáticos**: Revisar antes del viaje
- **Cadenas**: Obligatorias en invierno

## 🚌 En Bus

### Buses a Chillán
- **Líneas**: Tur Bus, Pullman Bus, Buses Bio Bio
- **Frecuencia**: Cada 30 minutos
- **Precio**: $15.000 - $25.000
- **Duración**: 6 horas

### Desde Chillán a Las Trancas
- **Buses rurales**: 3 servicios diarios
- **Transfer privado**: $25.000 por trayecto
- **Uber/taxi**: No disponible

## ✈️ En Avión + Auto

### Vuelo Santiago - Concepción
- **Aerolíneas**: Sky, JetSmart, LATAM
- **Duración**: 1.5 horas
- **Precio**: $80.000 - $150.000

### Desde Concepción
- **Auto**: 2.5 horas hasta Valle Las Trancas
- **Arriendo**: Desde $35.000/día

## 🏨 Dónde Hospedarse al Llegar

**TreePod** te espera con domos geodésicos únicos:
- Ubicación privilegiada en el valle
- Tinaja privada con agua termal
- WiFi Starlink de alta velocidad
- Estacionamiento privado

[Reserva tu estadía →](/disponibilidad)
`,
        category: 'Logística',
        readTime: '4 min',
        publishDate: '2026-04-12'
    }
    // Agregar más artículos según necesidad
};

export async function generateStaticParams() {
    return availableArticles.map((slug) => ({
        slug: slug,
    }));
}

interface Props {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: Props) {
    const article = articleContent[params.slug];
    if (!article) return {};
    return {
        title: `${article.title} | Blog TreePod`,
        description: article.excerpt,
        alternates: {
            canonical: `/blog/${params.slug}`,
        },
    };
}

export default function BlogPost({ params }: Props) {
    const { slug } = params;

    if (!availableArticles.includes(slug)) {
        notFound();
    }

    const article = articleContent[slug];

    // Si el artículo no tiene contenido desarrollado, mostrar placeholder
    if (!article) {
        return (
            <div className="bg-white text-text-main min-h-screen">
                <TrackView eventName="view_blog_post_placeholder" params={{ slug }} />

                <section className="py-24 md:py-32">
                    <div className="container mx-auto px-6 md:px-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="bg-background-light rounded-[2.5rem] p-12">
                                <h1 className="h2-display mb-6 text-text-main">
                                    Artículo en Desarrollo
                                </h1>
                                <p className="text-xl text-text-sub font-bold mb-8">
                                    Este artículo está siendo escrito por nuestro equipo.
                                    Vuelve pronto para leer el contenido completo.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Link
                                        href="/blog"
                                        className="inline-flex items-center gap-2 bg-primary text-white font-black py-3 px-6 rounded-full transition-all hover:bg-primary-dark"
                                    >
                                        <ArrowLeft size={20} />
                                        Volver al Blog
                                    </Link>
                                    <Link
                                        href="/disponibilidad"
                                        className="inline-flex items-center gap-2 bg-background-dark text-white font-black py-3 px-6 rounded-full transition-all hover:bg-black"
                                    >
                                        Reservar Estadía
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-white text-text-main min-h-screen">
            <TrackView eventName="view_blog_post" params={{ slug }} />

            {/* BREADCRUMB */}
            <section className="py-6 bg-background-light border-b border-black/5">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="flex items-center gap-2 text-sm font-bold text-text-sub">
                        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
                        <span>→</span>
                        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <span>→</span>
                        <span className="text-primary">{article.category}</span>
                    </div>
                </div>
            </section>

            {/* ARTICLE */}
            <article className="py-16 md:py-20">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-black uppercase tracking-wide">
                                {article.category}
                            </span>
                            <span className="flex items-center gap-2 text-text-sub font-bold text-sm">
                                <Calendar size={16} />
                                {new Date(article.publishDate).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-2 text-text-sub font-bold text-sm">
                                <Clock size={16} />
                                {article.readTime}
                            </span>
                        </div>

                        <h1 className="h1-display mb-8 text-text-main leading-tight">
                            {article.title}
                        </h1>

                        <div className="prose prose-lg max-w-none">
                            <div
                                className="text-text-main leading-relaxed [&>h1]:text-3xl [&>h1]:font-display [&>h1]:font-black [&>h1]:mb-6 [&>h1]:text-text-main [&>h2]:text-2xl [&>h2]:font-display [&>h2]:font-black [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-text-main [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:mt-6 [&>h3]:text-text-main [&>p]:mb-6 [&>p]:text-lg [&>ul]:mb-6 [&>ul]:ml-6 [&>li]:mb-2 [&>li]:text-lg [&>strong]:text-primary [&>strong]:font-black [&>a]:text-primary [&>a]:font-bold [&>a]:underline hover:[&>a]:text-primary-dark [&>table]:w-full [&>table]:border-collapse [&>table]:mb-6 [&>th]:border [&>th]:border-black/10 [&>th]:p-3 [&>th]:bg-background-light [&>th]:font-bold [&>th]:text-left [&>td]:border [&>td]:border-black/10 [&>td]:p-3"
                                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
                            />
                        </div>

                        <div className="mt-16 pt-8 border-t border-black/10 flex justify-between items-center">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                            >
                                <ArrowLeft size={20} />
                                Volver al blog
                            </Link>

                            <Link
                                href="/disponibilidad"
                                className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-3 px-6 rounded-full transition-all items-center gap-2 tracking-wide uppercase"
                            >
                                Reservar ahora
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}