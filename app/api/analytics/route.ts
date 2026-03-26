
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

export async function GET() {
    try {
        const keyFile = path.join(process.cwd(), 'google_credentials.json');

        const auth = new GoogleAuth({
            keyFile: keyFile,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        });

        const client = await auth.getClient();
        const propertyId = '357898604';
        const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

        // Reporte 1: Métricas generales (28 días)
        const generalReport = await client.request<any>({
            url,
            method: 'POST',
            data: {
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'sessions' },
                    { name: 'engagementRate' },
                    { name: 'bounceRate' },
                    { name: 'averageSessionDuration' },
                ]
            }
        });

        // Reporte 2: Eventos de conversión clave (mes actual)
        const now = new Date();
        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const eventsReport = await client.request<any>({
            url,
            method: 'POST',
            data: {
                dateRanges: [{ startDate: startOfMonth, endDate: 'today' }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        inListFilter: {
                            values: [
                                'purchase',
                                'begin_checkout',
                                'view_disponibilidad',
                                'select_fechas',
                                'generate_lead',
                                'click_reservar',
                                'view_home',
                                'begin_checkout_mundial',
                                'begin_checkout_semana_santa',
                            ]
                        }
                    }
                }
            }
        });

        // Reporte 3: Fuente de tráfico (28 días)
        const sourceReport = await client.request<any>({
            url,
            method: 'POST',
            data: {
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                limit: 6
            }
        });

        // Parsear métricas generales
        const generalRows = generalReport.data.rows || [];
        let activeUsers = 0, sessions = 0, engagementRate = 0, bounceRate = 0, avgSessionDuration = 0;
        if (generalRows.length > 0) {
            const row = generalRows[0];
            activeUsers = parseInt(row.metricValues[0].value) || 0;
            sessions = parseInt(row.metricValues[1].value) || 0;
            engagementRate = parseFloat(row.metricValues[2].value) || 0;
            bounceRate = parseFloat(row.metricValues[3].value) || 0;
            avgSessionDuration = parseFloat(row.metricValues[4].value) || 0;
        }

        // Parsear eventos de conversión
        const eventCounts: Record<string, number> = {};
        const eventRows = eventsReport.data.rows || [];
        eventRows.forEach((row: any) => {
            const eventName = row.dimensionValues[0].value;
            const count = parseInt(row.metricValues[0].value) || 0;
            eventCounts[eventName] = count;
        });

        // Parsear fuentes de tráfico
        const trafficSources: Array<{ channel: string; sessions: number; users: number }> = [];
        const sourceRows = sourceReport.data.rows || [];
        sourceRows.forEach((row: any) => {
            trafficSources.push({
                channel: row.dimensionValues[0].value,
                sessions: parseInt(row.metricValues[0].value) || 0,
                users: parseInt(row.metricValues[1].value) || 0,
            });
        });

        // Calcular tasa de conversión: purchase / view_disponibilidad
        const totalViews = eventCounts['view_disponibilidad'] || 0;
        const totalPurchases = eventCounts['purchase'] || 0;
        const conversionRate = totalViews > 0 ? ((totalPurchases / totalViews) * 100).toFixed(1) : '0.0';

        return NextResponse.json({
            // Métricas generales
            activeUsers,
            sessions,
            engagementRate,
            bounceRate,
            avgSessionDuration: Math.round(avgSessionDuration),
            period: '28d',
            // Eventos de conversión (mes actual)
            events: {
                purchase: eventCounts['purchase'] || 0,
                begin_checkout: (eventCounts['begin_checkout'] || 0) + (eventCounts['begin_checkout_mundial'] || 0) + (eventCounts['begin_checkout_semana_santa'] || 0),
                view_disponibilidad: eventCounts['view_disponibilidad'] || 0,
                select_fechas: eventCounts['select_fechas'] || 0,
                generate_lead: eventCounts['generate_lead'] || 0,
                click_reservar: eventCounts['click_reservar'] || 0,
                view_home: eventCounts['view_home'] || 0,
            },
            conversionRate,
            // Fuentes de tráfico
            trafficSources,
        });

    } catch (error: any) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
