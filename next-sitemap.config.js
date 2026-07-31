/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://domostreepod.cl',
    generateRobotsTxt: true,
    exclude: [
        '/pago/*',
        '/admin',
        '/admin/*',
        '/confirmacion',
        '/landing',
        '/guia', // página de "gracias" (thank-you del lead magnet), noindex
        '/reserva',
        '/reserva/*',
        '/semana-santa-2026', // tiene noindex: no debe ir en el sitemap
        // Landing de evento / temporada que redirigen a /disponibilidad (fechas pasadas).
        // Reactivar el proximo ano eliminando su redirect en next.config.ts y quitandola de aqui.
        '/otono-valle-las-trancas',
        '/glorias-navales-las-trancas',
        '/glamping-dia-de-la-madre',
        '/finde-largo-dia-trabajo-las-trancas',
        '/mundial-mtb-nevados-chillan-2026',
        '/guia-las-trancas/contenido', // entrega del lead magnet, noindex
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/admin/', '/confirmacion', '/landing', '/pago', '/reserva'],
            },
            // Crawlers de asistentes de IA: acceso explícito. Cuando alguien le pregunta
            // a ChatGPT, Perplexity, Claude o Gemini "dónde alojar en Las Trancas", estos
            // bots deben poder leer el sitio y citar datos correctos (ver /llms.txt).
            ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User',
                'ClaudeBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended', 'CCBot'].map((userAgent) => ({
                    userAgent,
                    allow: '/',
                    disallow: ['/admin', '/admin/', '/confirmacion', '/landing', '/pago', '/reserva'],
                })),
        ],
        additionalSitemaps: [],
    },
}
