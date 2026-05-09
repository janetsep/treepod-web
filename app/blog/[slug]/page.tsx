import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Clock, Info } from 'lucide-react';
import TrackView from '../../components/TrackView';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        excerpt: 'Guía general de actividades en Valle Las Trancas según la época del año.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        content: `
Valle Las Trancas, en plena cordillera de la Región del Ñuble, ofrece experiencias muy distintas según la temporada. Esta guía te ayuda a elegir cuándo venir según lo que buscas vivir.

## Invierno (junio a septiembre)

### Ski y snowboard en Nevados de Chillán
A 8 km del valle se encuentra el centro de ski **Nevados de Chillán**, con pistas para todos los niveles, escuela de ski y arriendo de equipos. La temporada parte usualmente en junio y se extiende hasta septiembre, dependiendo de las condiciones de nieve.

### Termas de Chillán
Las **Termas de Chillán** ofrecen piscinas termales rodeadas de cordillera. Es un panorama relajante después de un día en la nieve, y especialmente atractivo en invierno.

### Otros panoramas
- Caminatas suaves por senderos cercanos al valle (consultar condiciones de nieve antes de salir)
- Restaurantes locales con cocina de montaña
- Fotografía de paisajes nevados

## Primavera (septiembre a diciembre)

### Trekking y caminatas
La nieve empieza a retirarse y se abren los senderos por el bosque nativo. Hay varias rutas en la zona — recomendamos consultar con tu hospedaje o **Sernatur Ñuble** sobre los senderos abiertos según la fecha de tu visita.

### Flora y fauna
La primavera trae floración de especies nativas y mayor actividad de aves. Es buena época para fotografía de naturaleza.

## Verano (diciembre a marzo)

### Río Renegado y entorno
El **Río Renegado** atraviesa la zona y ofrece paisajes preciosos para caminatas y fotografía. Algunas pozas son aptas para refrescarse.

### Mountain bike y ciclismo
Existen circuitos de mountain bike en el área de Nevados de Chillán durante temporada de verano.

### Camping y caminatas
Días largos y temperaturas agradables para recorrer el valle a pie.

## Otoño (marzo a junio)

### Espectáculo de colores
El bosque nativo se llena de tonos rojos, dorados y ocres. Es la temporada favorita de fotógrafos y de quienes buscan tranquilidad: hay menos visitantes y los paisajes están en su mejor momento.

### Tinaja y descanso
Las noches frescas son perfectas para disfrutar tinaja al aire libre, fogones y libros junto a la estufa.

## Resumen rápido

| Buscas... | Mejor temporada |
|---|---|
| Ski y nieve | Julio – agosto |
| Trekking sin nieve | Diciembre – marzo |
| Termas | Todo el año |
| Fotografía y colores | Marzo – mayo |
| Tranquilidad y poco turismo | Mayo – junio |

> **Nota:** Las actividades, precios y operadores cambian según la temporada y el operador. Te recomendamos verificar disponibilidad con cada centro (Nevados de Chillán, Termas de Chillán, etc.) antes de tu viaje.

---

¿Listo para venir? Reserva tu domo en TreePod con confirmación inmediata.
`,
        category: 'Guías',
        readTime: '4 min',
        publishDate: '2026-04-15'
    },
    'como-llegar-valle-las-trancas-desde-santiago': {
        title: 'Cómo Llegar a Valle Las Trancas desde Santiago',
        excerpt: 'Las opciones más comunes para llegar a Valle Las Trancas desde Santiago y otras ciudades.',
        image: '/images/Galeria/Las Trancas Bosque Nativo 2.jpeg',
        content: `
Valle Las Trancas se ubica en la Región del Ñuble, a unos 80 km al oriente de la ciudad de **Chillán**. La forma más común de llegar es por carretera. Aquí están las alternativas principales.

## En auto (la más cómoda)

### Ruta general desde Santiago
- **Distancia aproximada:** 425 km
- **Tiempo estimado:** entre 6 y 7 horas, dependiendo del tráfico
- **Ruta:** Santiago → Ruta 5 Sur hasta Chillán → Ruta N-55 hasta Valle Las Trancas

### Tramos
1. **Santiago a Chillán:** ~5 horas por la Ruta 5 Sur (autopista con peajes)
2. **Chillán a Valle Las Trancas:** ~1 hora a 1 hora 15 por la Ruta N-55 (camino pavimentado)

### Antes de viajar
- **Combustible:** hay bencineras en el camino (Pinto, Recinto), pero conviene salir de Chillán con tanque lleno por seguridad
- **Peajes:** suman varios miles de pesos en la Ruta 5 Sur — los valores cambian, consulta el sitio del **Ministerio de Obras Públicas** o las concesionarias antes del viaje
- **Neumáticos en buen estado:** especialmente importante en invierno
- **Cadenas:** pueden ser exigidas en invierno cuando hay nieve en la ruta hacia Nevados

## En bus

Las líneas que cubren la ruta Santiago–Chillán incluyen **Tur Bus**, **Pullman Bus** y **Buses Bío Bío**, entre otras. Los horarios y precios varían según día y temporada — consulta en pasajebus.com o directamente en cada empresa.

Una vez en Chillán, las opciones para llegar a Valle Las Trancas son:
- **Buses rurales** con frecuencia limitada (generalmente algunas salidas al día)
- **Transfer privado** o radiotaxi (precio sujeto a temporada)
- **Auto arrendado** desde Chillán

> **Tip:** En Las Trancas no hay servicio de Uber ni taxis disponibles las 24 horas, así que es buena idea coordinar el transfer de vuelta con anticipación.

## En avión + auto

Si vienes desde el norte y quieres ahorrar horas de manejo:

- **Vuelo a Concepción:** operado por Sky, JetSmart y LATAM. Duración ~1h30 desde Santiago. Precios y disponibilidad varían — consulta directo en cada aerolínea.
- **Desde Concepción a Valle Las Trancas:** ~3 horas en auto vía Chillán

Hay servicios de arriendo de auto en el aeropuerto de Concepción.

## Una vez en TreePod

Te enviaremos las **instrucciones detalladas de cómo llegar al domo** una vez confirmes tu reserva. Tienes acceso a estacionamiento privado dentro del recinto.

---

> **Nota:** los tiempos, precios y servicios mencionados son referenciales y pueden cambiar. Recomendamos verificar valores actualizados con cada operador (peajes, buses, aerolíneas) antes de tu viaje.

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
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const article = articleContent[slug];
    if (!article) return {};
    return {
        title: `${article.title} | Blog TreePod`,
        description: article.excerpt,
        alternates: {
            canonical: `/blog/${slug}`,
        },
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;

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

            {/* HERO con imagen */}
            <section className="relative h-[60vh] min-h-[420px] text-white overflow-hidden flex items-end pt-20">
                <div className="absolute inset-0 bg-background-dark">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80 z-10"></div>
                </div>

                <div className="relative z-20 container mx-auto px-6 md:px-10 pb-12 md:pb-16">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white/80 mb-6">
                            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
                            <span>·</span>
                            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                            <span>·</span>
                            <span className="text-primary">{article.category}</span>
                        </div>

                        <h1 className="h1-display mb-6 !text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-primary text-white px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wide">
                                {article.category}
                            </span>
                            <span className="flex items-center gap-2 text-white/90 font-bold text-sm">
                                <Calendar size={16} />
                                {new Date(article.publishDate).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-2 text-white/90 font-bold text-sm">
                                <Clock size={16} />
                                {article.readTime}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENIDO */}
            <article className="py-16 md:py-24">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="prose prose-lg max-w-none text-text-main leading-relaxed
                            prose-headings:font-display prose-headings:text-text-main
                            prose-h1:hidden
                            prose-h2:text-3xl prose-h2:font-black prose-h2:mb-5 prose-h2:mt-12 prose-h2:pb-3 prose-h2:border-b prose-h2:border-primary/20
                            prose-h3:text-xl prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-text-main
                            prose-p:text-lg prose-p:mb-6 prose-p:leading-relaxed prose-p:text-text-sub
                            prose-ul:mb-6 prose-ul:list-disc prose-ul:pl-6
                            prose-ol:mb-6 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:mb-2 prose-li:text-lg prose-li:text-text-sub prose-li:leading-relaxed
                            prose-strong:text-text-main prose-strong:font-bold
                            prose-em:italic
                            prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-background-light prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-bold prose-blockquote:text-text-main prose-blockquote:my-8
                            prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:rounded-2xl prose-table:overflow-hidden
                            prose-th:border prose-th:border-black/10 prose-th:p-3 prose-th:bg-background-light prose-th:font-bold prose-th:text-left
                            prose-td:border prose-td:border-black/10 prose-td:p-3 prose-td:text-text-sub
                            prose-hr:my-12 prose-hr:border-black/10
                        ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {article.content}
                            </ReactMarkdown>
                        </div>

                        {/* DISCLAIMER */}
                        <div className="mt-16 bg-background-light rounded-[2rem] p-6 md:p-8 border border-black/5 flex items-start gap-4">
                            <Info className="text-primary flex-shrink-0 mt-1" size={24} strokeWidth={2.5} />
                            <p className="text-sm md:text-base text-text-sub font-bold leading-relaxed">
                                <strong className="text-text-main">Datos referenciales:</strong> los precios, horarios y disponibilidad de operadores externos (Nevados de Chillán, Termas, buses, aerolíneas, etc.) cambian con frecuencia. Te recomendamos verificar valores actualizados directamente con cada operador antes de tu viaje.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* CTA FINAL */}
            <section className="py-16 md:py-20 bg-background-dark text-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="h2-display mb-6 !text-white">
                            ¿Listo para tu escapada en Valle Las Trancas?
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-bold mb-10 leading-relaxed">
                            Reserva tu domo TreePod con confirmación inmediata. Bosque nativo, calefacción 24/7, WiFi Starlink y opción de tinaja exclusiva.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <Link
                                href="/disponibilidad"
                                className="inline-flex bg-primary hover:bg-primary-dark text-white font-black py-4 px-8 rounded-full transition-all shadow-xl items-center gap-2 tracking-widest uppercase"
                            >
                                Reservar mi domo
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Volver al blog
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
