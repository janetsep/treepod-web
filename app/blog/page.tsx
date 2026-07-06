'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import TrackView from '../components/TrackView';
import { useState } from 'react';

// Artículos del blog con contenido real
// `comingSoon: true` marca artículos sin contenido desarrollado todavía
const blogPosts = [
    {
        slug: 'que-hacer-valle-las-trancas-por-temporada',
        title: 'Qué Hacer en Valle Las Trancas por Temporada',
        excerpt: 'Guía completa de actividades en Valle Las Trancas según la época del año. Desde ski en invierno hasta trekking en verano, descubre cuándo venir según tus intereses.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        category: 'Guías',
        readTime: '6 min',
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
    'Logística'
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
        <div className="bg-white text-text-main min-h-screen">
            <TrackView eventName="view_blog_page" />

            {/* HERO editorial estilo Awasi */}
            <section className="pt-32 pb-16 md:pb-20 bg-white">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-[11px] md:text-xs font-black tracking-[0.3em] uppercase text-primary mb-8 block">
                            Editorial TreePod
                        </span>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-text-main leading-[1.15] mb-8 tracking-tight">
                            Guías y reflexiones <br />
                            <span className="italic font-medium">desde Valle Las Trancas</span>
                        </h1>

                        <p className="text-lg md:text-xl text-text-sub font-medium italic font-display leading-relaxed max-w-2xl mx-auto">
                            Todo lo que necesitas saber sobre Valle Las Trancas, Nevados de Chillán
                            y cómo planear tu escapada al bosque nativo.
                        </p>

                        {/* Separador ornamental */}
                        <div className="flex items-center justify-center mt-12">
                            <span className="w-12 h-px bg-text-sub/30"></span>
                            <span className="mx-4 text-primary text-2xl font-display italic">~</span>
                            <span className="w-12 h-px bg-text-sub/30"></span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIAS */}
            <section className="py-12 bg-white border-b border-black/5">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                                    selectedCategory === category
                                        ? 'bg-primary text-white'
                                        : 'bg-background-light text-text-sub hover:bg-primary hover:text-white'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {selectedCategory !== 'Todas' && (
                        <div className="text-center mt-4">
                            <span className="text-text-sub font-bold text-sm">
                                {filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''} en {selectedCategory}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* ARTÍCULOS */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => {
                            const isComingSoon = (post as any).comingSoon === true;
                            const CardContent = (
                                <article className={`group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-black/5 h-full flex flex-col ${isComingSoon ? 'opacity-70' : 'hover:shadow-2xl transition-all duration-500 cursor-pointer'}`}>
                                    <div className="relative h-64 overflow-hidden shrink-0">
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className={`object-cover ${!isComingSoon ? 'transition-transform duration-700 group-hover:scale-110' : ''}`}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                                                {post.category}
                                            </span>
                                        </div>
                                        {post.featured && !isComingSoon && (
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-background-dark text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                                                    Destacado
                                                </span>
                                            </div>
                                        )}
                                        {isComingSoon && (
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-text-sub/80 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
                                                    Próximamente
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col grow">
                                        <div className="flex items-center gap-4 text-text-sub text-sm font-bold mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                {new Date(post.publishDate).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={16} />
                                                {post.readTime}
                                            </span>
                                        </div>

                                        <h2 className={`text-xl font-display font-black mb-4 text-text-main leading-tight transition-colors ${!isComingSoon ? 'group-hover:text-primary' : ''}`}>
                                            {post.title}
                                        </h2>

                                        <p className="text-text-sub leading-relaxed mb-6 text-sm grow">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-background-light text-text-sub px-3 py-1 rounded-full text-xs font-bold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="text-center mt-auto">
                                            <span className={`inline-flex items-center gap-2 font-bold text-sm transition-transform ${isComingSoon ? 'text-text-sub italic' : 'text-primary group-hover:translate-x-1'}`}>
                                                {isComingSoon ? 'Pronto disponible' : 'Leer artículo completo'}
                                                {!isComingSoon && <ArrowRight size={16} />}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                            return isComingSoon ? (
                                <div key={post.slug} className="h-full">{CardContent}</div>
                            ) : (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className="block h-full">
                                    {CardContent}
                                </Link>
                            );
                        })}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-text-sub text-lg font-bold">
                                No hay artículos en la categoría "{selectedCategory}"
                            </p>
                            <button
                                onClick={() => setSelectedCategory('Todas')}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                Ver todos los artículos
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-16 md:py-20 bg-background-dark text-white">
                <div className="container mx-auto px-6 md:px-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="h2-display mb-6 text-white">
                            ¿Listo para tu aventura en Valle Las Trancas?
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-medium mb-8 leading-relaxed">
                            Ahora que conoces todos los secretos del valle, reserva tu domo
                            y vive la experiencia TreePod.
                        </p>
                        <Link
                            href="/disponibilidad"
                            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg active:scale-95 items-center justify-center gap-2 text-base"
                        >
                            Ver disponibilidad
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}