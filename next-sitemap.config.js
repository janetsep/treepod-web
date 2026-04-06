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
        '/reserva',
        '/reserva/*',
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/admin/', '/confirmacion', '/landing', '/pago', '/reserva'],
            },
        ],
        additionalSitemaps: [],
    },
}
