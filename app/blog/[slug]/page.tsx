import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TrackView from '../../components/TrackView';
import SectionFolio from '../../components/SectionFolio';
import TriBullet from '../../components/deco/TriBullet';
import GeoDivider from '../../components/deco/GeoDivider';
import { btnPrimaryDark, linkLineDark, btnPrimary, linkLine } from '../../components/deco/cta';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// publishDate viene como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') la interpreta como
// medianoche UTC: en un servidor/navegador con huso horario detrás de UTC (Chile,
// UTC-4) muestra el día anterior. Construimos la fecha local con sus componentes.
function formatFechaPublicacion(dateString: string) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Lista simple de artículos disponibles. Solo los que tienen contenido escrito:
// los demás quedaban como "Artículo en Desarrollo" (404) y no deben indexarse.
const availableArticles = [
    'que-hacer-valle-las-trancas-por-temporada',
    'como-llegar-valle-las-trancas-desde-santiago'
];

const articleContent: Record<string, any> = {
    'que-hacer-valle-las-trancas-por-temporada': {
        title: 'Qué Hacer en Valle Las Trancas por Temporada',
        excerpt: 'Guía general de actividades en Valle Las Trancas según la época del año.',
        metaDescription: 'Qué hacer en Valle Las Trancas en cada temporada: ski en Nevados de Chillán, termas, trekking y colores de otoño. Planifica tu visita y reserva tu domo.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        content: `
Valle Las Trancas, en plena cordillera de la Región de Ñuble, ofrece experiencias muy distintas según la temporada. Esta guía te ayuda a elegir cuándo venir según lo que buscas vivir.

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

### Descanso junto a la estufa
Las noches frescas son perfectas para un asado en el quincho o un libro junto a la estufa. La tinaja al aire libre es un servicio de temporada: consúltanos si estará disponible en la fecha de tu visita.

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

¿Listo para venir? Conoce nuestros [domos en Las Trancas](/glamping-valle-las-trancas) y reserva directo: pagas el 50% de abono y el saldo en el check-in.
`,
        category: 'Guías',
        readTime: '4 min',
        publishDate: '2026-04-15'
    },
    'como-llegar-valle-las-trancas-desde-santiago': {
        title: 'Cómo Llegar a Valle Las Trancas desde Santiago',
        excerpt: 'Las opciones más comunes para llegar a Valle Las Trancas desde Santiago y otras ciudades.',
        metaDescription: 'Cómo llegar a Valle Las Trancas desde Santiago: en auto, bus o avión, con tiempos, rutas y consejos. Planifica tu viaje y reserva tu domo en TreePod.',
        image: '/images/Galeria/Las Trancas Bosque Nativo 2.jpeg',
        content: `
Valle Las Trancas se ubica en la Región de Ñuble, a unos 72 km al oriente de la ciudad de **Chillán**. La forma más común de llegar es por carretera. Aquí están las alternativas principales.

## En auto (la más cómoda)

### Ruta general desde Santiago
- **Distancia aproximada:** 480 km
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

- **Vuelo a Concepción:** operado por Sky, JetSmart y LATAM. Alrededor de 1 hora de vuelo desde Santiago. Precios y disponibilidad varían — consulta directo en cada aerolínea.
- **Desde Concepción a Valle Las Trancas:** ~3 horas en auto vía Chillán

Hay servicios de arriendo de auto en el aeropuerto de Concepción.

## Una vez en TreePod

Te enviaremos las **instrucciones detalladas de cómo llegar al domo** una vez confirmes tu reserva. Tienes acceso a estacionamiento privado dentro del recinto. Si aún no eliges dónde alojar, mira nuestros [domos en Las Trancas](/glamping-valle-las-trancas).

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
        // Sufijo corto "| TreePod": con "| Blog TreePod" el title de
        // como-llegar-... superaba los 60 caracteres y Google lo truncaba.
        title: `${article.title} | TreePod`,
        description: article.metaDescription ?? article.excerpt,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: article.title,
            description: article.metaDescription ?? article.excerpt,
            images: [article.image],
            type: 'article',
            locale: 'es_CL',
        },
        // Sin este bloque, el artículo hereda el twitter:* del layout de /blog
        // (título e imagen del listado) y al compartir en X se ve la card equivocada.
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.metaDescription ?? article.excerpt,
            images: [article.image],
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
            <div className="bg-[#F7F3EC] text-[#1E1B16] font-sans min-h-screen">
                <TrackView eventName="view_blog_post_placeholder" params={{ slug }} />

                <section className="py-24 md:py-32">
                    <div className="mx-auto max-w-[720px] px-5 md:px-10">
                        <div className="bg-white rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] p-8 md:p-12">
                            <p className="dato text-[#5B5348] mb-5">Editorial TreePod</p>
                            <h1 className="display-md text-[#1E1B16] mb-5">
                                Artículo en Desarrollo
                            </h1>
                            <p className="text-[#5B5348] leading-relaxed mb-8">
                                Este artículo está siendo escrito por nuestro equipo.
                                Vuelve pronto para leer el contenido completo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                                <Link href="/disponibilidad" className={btnPrimary}>
                                    Reservar estadía
                                </Link>
                                <Link href="/blog" className={`${linkLine} !text-sm`}>
                                    Volver al blog <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // JSON-LD BlogPosting con datos ya presentes en articleContent: describe el
    // artículo (titular, fecha, imagen) que el LodgingBusiness global no cubre.
    const blogPostingJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.metaDescription ?? article.excerpt,
        "image": `https://domostreepod.cl${encodeURI(article.image)}`,
        "datePublished": article.publishDate,
        "inLanguage": "es-CL",
        "mainEntityOfPage": `https://domostreepod.cl/blog/${slug}`,
        "author": { "@type": "Organization", "name": "TreePod Glamping", "url": "https://domostreepod.cl" },
        "publisher": {
            "@type": "Organization",
            "name": "TreePod Glamping",
            "logo": { "@type": "ImageObject", "url": "https://domostreepod.cl/icon-192.png" },
        },
    };

    return (
        <div className="bg-white text-text-main min-h-screen">
            <TrackView eventName="view_blog_post" params={{ slug }} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
            />

            {/* Cabecera editorial KM 72: folio + filete, titular a la izquierda */}
            <section className="pt-32 pb-10 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Bitácora" label={article.category} note={`${article.readTime} de lectura`} />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
                        <div className="col-span-12 lg:col-span-9">
                            <h1 className="display-lg text-[#1E1B16]">
                                {article.title}
                            </h1>
                            <p className="lead text-[#5B5348] mt-6 max-w-2xl font-display italic">
                                {article.excerpt}
                            </p>
                            <p className="mt-8 flex items-center gap-2 dato text-[#5B5348]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                {formatFechaPublicacion(article.publishDate)} · TreePod Editorial
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOTO DE APERTURA con pie de foto editorial */}
            <section className="relative w-full">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <figure>
                        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-[2px]">
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                priority
                                className="object-cover object-center"
                                sizes="100vw"
                            />
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">Valle Las Trancas, Ñuble</span>
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* CONTENIDO — narrow column editorial */}
            <article className="py-16 md:py-24">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-2xl mx-auto">
                        <div className="prose prose-lg max-w-none text-text-main
                            prose-headings:font-display prose-headings:text-text-main prose-headings:tracking-tight
                            prose-h1:hidden
                            prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:font-black prose-h2:mb-6 prose-h2:mt-16 prose-h2:leading-tight
                            prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 prose-h3:mt-10 prose-h3:text-text-main
                            prose-p:text-lg md:prose-p:text-xl prose-p:mb-7 prose-p:leading-[1.8] prose-p:text-text-main prose-p:font-normal
                            prose-p:first-of-type:first-letter:font-display prose-p:first-of-type:first-letter:text-7xl prose-p:first-of-type:first-letter:font-black prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:mr-3 prose-p:first-of-type:first-letter:mt-1 prose-p:first-of-type:first-letter:leading-[0.85] prose-p:first-of-type:first-letter:text-primary-dark
                            prose-ul:mb-8 prose-ul:list-none prose-ul:pl-0
                            prose-ol:mb-8 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:mb-3 prose-li:text-lg md:prose-li:text-xl prose-li:text-text-main prose-li:leading-relaxed
                            prose-ul>li:relative prose-ul>li:pl-6 prose-ul>li:before:content-[''] prose-ul>li:before:absolute prose-ul>li:before:left-0 prose-ul>li:before:top-[0.85em] prose-ul>li:before:w-3 prose-ul>li:before:h-px prose-ul>li:before:bg-primary
                            prose-strong:text-text-main prose-strong:font-bold
                            prose-em:italic prose-em:font-display
                            prose-a:text-primary-dark prose-a:font-bold prose-a:no-underline prose-a:border-b prose-a:border-primary/40 hover:prose-a:border-primary
                            prose-blockquote:border-0 prose-blockquote:my-12 prose-blockquote:px-0 prose-blockquote:py-0
                            prose-blockquote:font-display prose-blockquote:italic prose-blockquote:text-2xl md:prose-blockquote:text-3xl prose-blockquote:font-medium prose-blockquote:text-text-main prose-blockquote:text-center prose-blockquote:leading-snug prose-blockquote:relative
                            prose-table:w-full prose-table:border-collapse prose-table:my-10
                            prose-th:border-b-2 prose-th:border-text-main/20 prose-th:p-4 prose-th:font-display prose-th:font-bold prose-th:text-left prose-th:text-base prose-th:uppercase prose-th:tracking-wide
                            prose-td:border-b prose-td:border-black/5 prose-td:p-4 prose-td:text-text-main
                            prose-hr:my-16 prose-hr:border-0 prose-hr:h-px prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-text-sub/30 prose-hr:to-transparent
                        ">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Las tablas del markdown se envuelven en un contenedor con
                                    // scroll horizontal propio: sin esto desbordan la página en móvil.
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto">
                                            <table {...props} />
                                        </div>
                                    ),
                                }}
                            >
                                {article.content}
                            </ReactMarkdown>
                        </div>

                        {/* Separador triangulado: el motivo geodésico, no la tilde curva */}
                        <div className="flex items-center gap-4 my-16" aria-hidden="true">
                            <span className="flex-1 h-px bg-[#1E1B16]/15"></span>
                            <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                            <span className="flex-1 h-px bg-[#1E1B16]/15"></span>
                        </div>

                        {/* DISCLAIMER — estilo editorial sutil */}
                        <div className="border-l-2 border-[#00ADEF] pl-6 py-2 my-12">
                            <p className="text-sm md:text-base text-text-sub italic font-display leading-relaxed">
                                <strong className="not-italic font-semibold text-[#1E1B16] dato block mb-2">Nota editorial</strong>
                                Los precios, horarios y disponibilidad de operadores externos cambian con frecuencia. Te recomendamos verificar valores actualizados directamente con cada operador antes de tu viaje.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            <GeoDivider left="84%" />

            {/* CTA FINAL — banda charcoal editorial, composición asimétrica */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Tu refugio en Valle Las Trancas" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                Domos geodésicos{' '}
                                <span className="italic text-[#00ADEF]">en bosque nativo</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl font-display italic">
                                Calefacción a pellet las 24 horas, WiFi Starlink y tinaja privada en temporada. Reserva directa con abono del 50%.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-6">
                            <Link href="/disponibilidad" className={btnPrimaryDark}>
                                Ver disponibilidad
                            </Link>
                            <Link href="/blog" className={`${linkLineDark} !text-sm`}>
                                Volver al blog <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
