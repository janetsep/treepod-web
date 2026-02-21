/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.treepod.cl',
    generateRobotsTxt: true,
    exclude: ['/pago/*', '/admin/*'], // Exclude payment return routes and admin
}
