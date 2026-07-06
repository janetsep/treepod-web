'use client';
import Image from 'next/image';
import Link from 'next/link';
import TrackView from '../components/TrackView';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimaryDark } from '../components/deco/cta';
import { useState } from 'react';

// publishDate viene como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') la interpreta como
// medianoche UTC y en Chile (UTC-4) muestra el día anterior, además de poder
// diferir entre servidor y navegador (hydration mismatch). Fecha local explícita.
function formatFechaPublicacion(dateString: string) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Artículos del blog con contenido real
// `comingSoon: true` marca artículos sin contenido desarrollado todavía
const blogPosts = [
    {
        slug: 'historia-valle-las-trancas-volcan-termas-pincheira',
        title: 'Historia del Valle Las Trancas: Volcán, Termas y Pincheira',
        excerpt: 'Un volcán de 17 cráteres, aguas famosas desde 1869 y la cueva de los hermanos Pincheira en el km 67. Las tres historias que se cruzan en el camino a tu domo.',
        image: '/images/real/NOdomoaereo5.jpeg',
        category: 'Historia',
        readTime: '6 min',
        publishDate: '2026-07-06',
        author: 'TreePod Team',
        tags: ['Historia', 'Pincheira', 'Termas', 'Volcán']
    },
    {
        slug: 'que-hacer-valle-las-trancas-por-temporada',
        title: 'Qué Hacer en Valle Las Trancas por Temporada',
        excerpt: 'Guía completa de actividades en Valle Las Trancas según la época del año. Desde ski en invierno hasta trekking en verano, descubre cuándo venir según tus intereses.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        category: 'Guías',
        readTime: '4 min',
        publishDate: '2026-04-15',
        author: 'TreePod Team',
        tags: ['Valle Las Trancas', 'Actividades', 'Temporadas', 'Guía'],
        featured: true
    },
    {
        slug: 'como-llegar-valle-las-trancas-desde-santiago',
        title: 'Cómo Llegar a Valle Las Trancas desde Santiago',
        excerpt: 'Todas las opciones para llegar a Valle Las Trancas desde Santiago: auto, bus, avión. Rutas, tiempos, costos y recomendaciones para tu viaje.',
        image: '/images/Galeria/Las Trancas Bosque Nativo 2.jpeg',
        category: 'Logística',
        readTime: '4 min',
        publishDate: '2026-04-12',
        author: 'TreePod Team',
        tags: ['Transporte', 'Santiago', 'Viaje', 'Logística']
    },
    {
        slug: 'mejores-restaurantes-valle-las-trancas-2026',
        title: 'Mejores Restaurantes Valle Las Trancas 2026',
        excerpt: 'Selección de los mejores restaurantes en Valle Las Trancas. Desde comida casera hasta alta cocina, descubre dónde comer bien durante tu estadía.',
        image: '/images/real/comidatreepod.jpg',
        category: 'Gastronomía',
        readTime: '5 min',
        publishDate: '2026-04-08',
        author: 'TreePod Team',
        tags: ['Restaurantes', 'Comida', 'Valle Las Trancas', 'Gastronomía'],
        comingSoon: true
    },
    {
        slug: 'termas-nevados-chillan-precios-horarios-2026',
        title: 'Termas Nevados Chillán: Precios y Horarios 2026',
        excerpt: 'Todo sobre las Termas de Nevados de Chillán: precios actualizados, horarios, cómo llegar y qué esperar de tu visita a las termas.',
        image: '/images/wellness/Tinaja1.jpg',
        category: 'Termas',
        readTime: '4 min',
        publishDate: '2026-04-05',
        author: 'TreePod Team',
        tags: ['Termas', 'Nevados Chillán', 'Precios', 'Relajación'],
        comingSoon: true
    },
    {
        slug: 'que-llevar-glamping-valle-las-trancas-lista',
        title: 'Qué Llevar al Glamping Valle Las Trancas: Lista Completa',
        excerpt: 'Lista definitiva de qué empacar para tu estadía de glamping en Valle Las Trancas. Ropa, elementos esenciales y tips para una experiencia perfecta.',
        image: '/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg',
        category: 'Consejos',
        readTime: '3 min',
        publishDate: '2026-04-01',
        author: 'TreePod Team',
        tags: ['Glamping', 'Qué llevar', 'Valle Las Trancas', 'Tips'],
        comingSoon: true
    },
    {
        slug: 'clima-valle-las-trancas-por-mes-2026',
        title: 'Clima Valle Las Trancas por Mes: Qué Esperar en 2026',
        excerpt: 'Guía del clima en Valle Las Trancas mes a mes. Temperaturas, precipitaciones y qué ropa llevar según la época de tu visita.',
        image: '/images/Galeria/domoinvierno.jpeg',
        category: 'Clima',
        readTime: '5 min',
        publishDate: '2026-03-28',
        author: 'TreePod Team',
        tags: ['Clima', 'Tiempo', 'Valle Las Trancas', 'Planificación'],
        comingSoon: true
    }
];

// Solo categorías con artículos publicados (los coming-soon no se muestran).
const categories = [
    'Todas',
    'Guías',
    'Logística',
    'Historia'
];

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    // Solo se listan artículos con contenido real. Los marcados `comingSoon` aún no
    // están escritos: mostrarlos llevaba a un "Artículo en Desarrollo" (404) y hacía
    // ver el blog inconcluso. Sus datos quedan en el array para escribirlos más adelante.
    const publishedPosts = blogPosts.filter(post => !post.comingSoon);

    const filteredPosts = selectedCategory === 'Todas'
        ? publishedPosts
        : publishedPosts.filter(post => post.category === selectedCategory);

    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <TrackView eventName="view_blog_page" />

            {/* Cabecera editorial KM 72: folio + filete, titular a la izquierda */}
            <section className="pt-32 pb-12 md:pb-16 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Bitácora" label="Editorial TreePod" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
                        <div className="col-span-12 lg:col-span-9">
                            <h1 className="display-lg text-[#1E1B16]">
                                Guías y reflexiones{' '}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                    desde Valle Las Trancas
                                </span>
                            </h1>
                            <p className="lead text-[#5B5348] mt-6 max-w-2xl">
                                Todo lo que necesitas saber sobre Valle Las Trancas, Nevados de Chillán
                                y cómo planear tu escapada al bosque nativo.
                            </p>
                        </div>
                    </div>

                    {/* Filtro de categorías: pestañas de subraya, cero píldoras */}
                    <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-b border-[#1E1B16]/12 pb-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`font-sans font-semibold text-[12px] uppercase tracking-[0.14em] transition-colors ${
                                    selectedCategory === category
                                        ? 'text-[#1E1B16] underline decoration-[#00ADEF] decoration-[3px] underline-offset-[8px]'
                                        : 'text-[#5B5348] hover:text-[#1E1B16]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                        {selectedCategory !== 'Todas' && (
                            <span className="caption-editorial">
                                {filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''} en {selectedCategory}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ÍNDICE DE ARTÍCULOS: filas numeradas entre filetes, no tarjetas */}
            <section className="pb-20 md:pb-28">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <div className="border-b border-[#1E1B16]/12">
                        {filteredPosts.map((post, index) => (
                            <article key={post.slug} className="group border-t border-[#1E1B16]/12">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-6 py-8 md:py-10 items-center"
                                >
                                    <div
                                        className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums"
                                        aria-hidden="true"
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </div>

                                    <div className="col-span-10 md:col-span-6 lg:col-span-7">
                                        <p className="flex items-baseline gap-3 mb-3">
                                            <span className="dato text-[#5B5348]">{post.category}</span>
                                            {post.featured && (
                                                <span className="inline-flex items-center gap-1.5 dato text-[#1E1B16]">
                                                    <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                                    Destacado
                                                </span>
                                            )}
                                        </p>
                                        <h2 className="display-md text-[#1E1B16] group-hover:underline group-hover:decoration-[#00ADEF] group-hover:decoration-[3px] group-hover:underline-offset-[6px]">
                                            {post.title}
                                        </h2>
                                        <p className="text-[15px] text-[#5B5348] leading-relaxed mt-3 max-w-2xl">
                                            {post.excerpt}
                                        </p>
                                        <p className="caption-editorial mt-4">
                                            {formatFechaPublicacion(post.publishDate)} · {post.readTime} de lectura
                                        </p>
                                        <span className="mt-5 inline-flex items-center gap-2 font-semibold text-[15px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] group-hover:decoration-[#008CBF] transition-colors">
                                            Leer artículo completo <span aria-hidden="true">→</span>
                                        </span>
                                    </div>

                                    <figure className="col-span-12 md:col-span-5 lg:col-span-4">
                                        <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden">
                                            <Image
                                                src={post.image}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    </figure>
                                </Link>
                            </article>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="py-16">
                            <p className="lead text-[#5B5348]">
                                No hay artículos en la categoría "{selectedCategory}"
                            </p>
                            <button
                                onClick={() => setSelectedCategory('Todas')}
                                className="mt-4 inline-flex items-center gap-2 font-semibold text-[15px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors"
                            >
                                Ver todos los artículos <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <GeoDivider left="84%" />

            {/* Cierre: banda charcoal editorial con sello de imprenta */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Reserva directa" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                ¿Listo para tu aventura{' '}
                                <span className="italic text-[#00ADEF]">en Valle Las Trancas?</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Ahora que conoces todos los secretos del valle, reserva tu domo
                                y vive la experiencia TreePod.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 lg:text-right">
                            <Link href="/disponibilidad" className={btnPrimaryDark}>
                                Ver disponibilidad
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
