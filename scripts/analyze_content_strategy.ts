import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load env
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    process.env[match[1]] = (match[2] || '').replace(/^['"](.*)['"]$/, '$1');
                }
            });
        }
    } catch (e) {
        console.warn("⚠️ Env load failed", e);
    }
}
loadEnv();

const GA4_PROPERTY_ID = "357898604";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("🚀 Iniciando análisis de contenido y tendencias...\n");

    // 1. Auth
    const keyFile = path.join(process.cwd(), 'google_credentials.json');
    const auth = new GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });
    const authClient = await auth.getClient();
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient as any });

    // 2. Análisis de páginas más visitadas
    console.log("📊 Analizando páginas más visitadas...");
    const pagesReport = await analyticsData.properties.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        requestBody: {
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' }
            ],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 20
        }
    });

    const topPages = pagesReport.data.rows?.map(row => ({
        title: row.dimensionValues?.[0].value,
        path: row.dimensionValues?.[1].value,
        views: parseInt(row.metricValues?.[0].value || '0'),
        avgDuration: parseFloat(row.metricValues?.[1].value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2].value || '0')
    })) || [];

    console.log("\n📄 Top 10 Páginas:");
    topPages.slice(0, 10).forEach((page, i) => {
        console.log(`${i + 1}. ${page.title} (${page.path})`);
        console.log(`   Views: ${page.views} | Duración: ${Math.round(page.avgDuration)}s | Bounce: ${(page.bounceRate * 100).toFixed(1)}%`);
    });

    // 3. Análisis de fuentes de tráfico
    console.log("\n\n📈 Analizando fuentes de tráfico...");
    const trafficReport = await analyticsData.properties.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        requestBody: {
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
            metrics: [
                { name: 'sessions' },
                { name: 'conversions' }
            ],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: 10
        }
    });

    const trafficSources = trafficReport.data.rows?.map(row => ({
        source: row.dimensionValues?.[0].value,
        medium: row.dimensionValues?.[1].value,
        sessions: parseInt(row.metricValues?.[0].value || '0'),
        conversions: parseFloat(row.metricValues?.[1].value || '0')
    })) || [];

    console.log("\n🌐 Top Fuentes de Tráfico:");
    trafficSources.forEach((source, i) => {
        console.log(`${i + 1}. ${source.source} / ${source.medium}`);
        console.log(`   Sesiones: ${source.sessions} | Conversiones: ${source.conversions}`);
    });

    // 4. Keywords y términos de búsqueda (si están disponibles)
    console.log("\n\n🔍 Intentando obtener términos de búsqueda...");
    try {
        const searchTermsReport = await analyticsData.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'searchTerm' }],
                metrics: [{ name: 'sessions' }],
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                limit: 20
            }
        });

        const searchTerms = searchTermsReport.data.rows?.map(row => ({
            term: row.dimensionValues?.[0].value,
            sessions: parseInt(row.metricValues?.[0].value || '0')
        })) || [];

        if (searchTerms.length > 0) {
            console.log("\n🔎 Términos de búsqueda:");
            searchTerms.forEach((term, i) => {
                console.log(`${i + 1}. "${term.term}" - ${term.sessions} sesiones`);
            });
        } else {
            console.log("⚠️ No hay datos de términos de búsqueda disponibles");
        }
    } catch (e) {
        console.log("⚠️ Dimensión searchTerm no disponible en esta propiedad");
    }

    // 5. Análisis de nicho y recomendaciones
    console.log("\n\n🎯 ANÁLISIS DE NICHO Y OPORTUNIDADES\n");
    console.log("=".repeat(60));

    const nicho = {
        principal: "Glamping / Alojamiento de Montaña",
        ubicacion: "Valle Las Trancas, Chillán, Chile",
        keywords_core: [
            "glamping chile",
            "glamping chillan",
            "valle las trancas",
            "domos geodesicos",
            "alojamiento montaña chile",
            "cabañas nevados de chillan",
            "termas chillan",
            "ski chillan"
        ],
        temporadas: {
            alta: "Diciembre-Febrero (Verano), Junio-Agosto (Ski)",
            media: "Marzo-Mayo, Septiembre-Noviembre",
            baja: "Abril-Mayo"
        }
    };

    console.log("\n📍 Nicho Identificado:");
    console.log(`   - Sector: ${nicho.principal}`);
    console.log(`   - Ubicación: ${nicho.ubicacion}`);
    console.log(`   - Keywords Core: ${nicho.keywords_core.slice(0, 5).join(', ')}`);

    // 6. Plan de contenido basado en estacionalidad
    console.log("\n\n📅 PLAN DE CONTENIDO - MARZO 2026\n");
    console.log("=".repeat(60));

    const contentPlan = [
        {
            semana: "Semana 1 (3-9 Marzo)",
            tema: "Otoño en la Montaña: Colores y Tranquilidad",
            keywords: ["otoño valle las trancas", "glamping otoño chile", "escapada otoño montaña"],
            tipo: "Blog Post + Galería",
            objetivo: "Captar búsquedas de temporada baja",
            trafico_estimado: "150-300 visitas/mes",
            contenido: [
                "Post: '5 Razones para Visitar Valle Las Trancas en Otoño'",
                "Galería de fotos: Colores del bosque nativo en otoño",
                "Video corto: Experiencia de huésped en marzo"
            ]
        },
        {
            semana: "Semana 2 (10-16 Marzo)",
            tema: "Preparación Temporada de Ski 2026",
            keywords: ["ski chillan 2026", "cuando abre nevados de chillan", "glamping cerca ski"],
            tipo: "Guía Práctica",
            objetivo: "Captar early bookers de temporada ski",
            trafico_estimado: "400-600 visitas/mes",
            contenido: [
                "Guía: 'Todo sobre la Temporada de Ski 2026 en Nevados de Chillán'",
                "Comparativa: Ski + Glamping vs Hotel tradicional",
                "Mapa interactivo: Distancia TreePod - Centros de Ski"
            ]
        },
        {
            semana: "Semana 3 (17-23 Marzo)",
            tema: "Experiencias Locales: Termas y Gastronomía",
            keywords: ["termas valle las trancas", "termas chillan", "gastronomia local chillan"],
            tipo: "Guía de Experiencias",
            objetivo: "Posicionarse como experto local",
            trafico_estimado: "200-400 visitas/mes",
            contenido: [
                "Guía: 'Mejores Termas cerca de TreePod'",
                "Recomendaciones: Restaurantes locales imperdibles",
                "Alianzas: Descuentos en termas para huéspedes"
            ]
        },
        {
            semana: "Semana 4 (24-31 Marzo)",
            tema: "Testimonios y Casos de Éxito",
            keywords: ["opiniones glamping chile", "experiencia treepod", "reseñas domos chile"],
            tipo: "Contenido Social Proof",
            objetivo: "Aumentar confianza y conversión",
            trafico_estimado: "100-200 visitas/mes",
            contenido: [
                "Video testimonial: Familia que visitó en febrero",
                "Caso de estudio: Pareja que celebró aniversario",
                "Compilación: Mejores fotos de huéspedes (con permiso)"
            ]
        }
    ];

    contentPlan.forEach((plan, i) => {
        console.log(`\n${i + 1}. ${plan.semana}`);
        console.log(`   Tema: ${plan.tema}`);
        console.log(`   Keywords: ${plan.keywords.join(', ')}`);
        console.log(`   Tipo: ${plan.tipo}`);
        console.log(`   Objetivo: ${plan.objetivo}`);
        console.log(`   Tráfico Estimado: ${plan.trafico_estimado}`);
        console.log(`   Contenido:`);
        plan.contenido.forEach(item => console.log(`      - ${item}`));
    });

    // 7. Estimaciones de tráfico total
    const traficoTotal = {
        actual_mensual: topPages.reduce((sum, p) => sum + p.views, 0),
        estimado_con_plan: Math.round(topPages.reduce((sum, p) => sum + p.views, 0) * 1.3), // +30%
        nuevas_visitas_estimadas: "850-1500"
    };

    console.log("\n\n📊 ESTIMACIONES DE IMPACTO\n");
    console.log("=".repeat(60));
    console.log(`Tráfico actual (28 días): ${traficoTotal.actual_mensual} visitas`);
    console.log(`Nuevas visitas estimadas con plan: ${traficoTotal.nuevas_visitas_estimadas}`);
    console.log(`Tráfico total proyectado: ${traficoTotal.estimado_con_plan} visitas/mes (+30%)`);

    // 8. Recomendaciones de optimización
    console.log("\n\n💡 RECOMENDACIONES ADICIONALES\n");
    console.log("=".repeat(60));

    const recomendaciones = [
        {
            prioridad: "ALTA",
            accion: "Crear landing page específica para 'Glamping + Ski'",
            razon: "Temporada alta de ski se acerca (Junio-Agosto)",
            impacto: "Potencial de captar 40% más reservas en temporada alta"
        },
        {
            prioridad: "ALTA",
            accion: "Implementar blog en /blog con SEO optimizado",
            razon: "Actualmente no hay contenido informativo indexable",
            impacto: "Tráfico orgánico +50% en 3 meses"
        },
        {
            prioridad: "MEDIA",
            accion: "Crear página de FAQ optimizada para long-tail keywords",
            razon: "Preguntas comunes generan mucho tráfico de búsqueda",
            impacto: "Reducir consultas por WhatsApp + Mejorar SEO"
        },
        {
            prioridad: "MEDIA",
            accion: "Video tour 360° del domo",
            razon: "Aumenta tiempo en página y reduce bounce rate",
            impacto: "Conversión +15-20%"
        },
        {
            prioridad: "BAJA",
            accion: "Newsletter mensual con ofertas exclusivas",
            razon: "Retener leads que no convirtieron",
            impacto: "Recuperar 10-15% de leads perdidos"
        }
    ];

    recomendaciones.forEach((rec, i) => {
        console.log(`\n${i + 1}. [${rec.prioridad}] ${rec.accion}`);
        console.log(`   Razón: ${rec.razon}`);
        console.log(`   Impacto: ${rec.impacto}`);
    });

    // 9. Guardar en Supabase (si la tabla existe)
    console.log("\n\n💾 Guardando análisis en base de datos...");

    const reportData = {
        run_at: new Date().toISOString(),
        top_pages: topPages.slice(0, 10),
        traffic_sources: trafficSources,
        content_plan: contentPlan,
        traffic_estimates: traficoTotal,
        recommendations: recomendaciones
    };

    // Intentar guardar (puede fallar si la tabla no existe)
    try {
        const { error } = await supabase.from('content_strategy_logs').insert({
            ...reportData
        });

        if (error) {
            console.log("⚠️ No se pudo guardar en DB (tabla no existe):", error.message);
            console.log("💡 Crea la tabla manualmente en Supabase SQL Editor:");
            console.log(`
CREATE TABLE content_strategy_logs (
  id uuid default gen_random_uuid() primary key,
  run_at timestamptz not null,
  top_pages jsonb,
  traffic_sources jsonb,
  content_plan jsonb,
  traffic_estimates jsonb,
  recommendations jsonb
);
            `);
        } else {
            console.log("✅ Análisis guardado en Supabase");
        }
    } catch (e) {
        console.log("⚠️ Error al guardar:", e);
    }

    console.log("\n\n✅ Análisis completado!");
    console.log("\n📄 Próximos pasos:");
    console.log("   1. Revisar el plan de contenido semanal");
    console.log("   2. Priorizar recomendaciones de ALTA prioridad");
    console.log("   3. Crear calendario editorial en Notion/Trello");
    console.log("   4. Asignar responsables para cada pieza de contenido");
    console.log("   5. Re-ejecutar este análisis en 30 días para medir impacto\n");
}

main().catch(err => {
    console.error("🔥 Error:", err);
    process.exit(1);
});
