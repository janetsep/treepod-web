
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { getVerifiedAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
    try {
        if (!await getVerifiedAdmin(request)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!clientEmail || !privateKey) {
            return NextResponse.json({ error: 'Analítica no configurada. No equivale a cero visitas.' }, { status: 503 });
        }

        const auth = new GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
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

        // Reporte 2: embudo real (mes actual). Se excluyen generate_lead,
        // select_dome y begin_checkout porque existen reglas históricas de GA4
        // que los inflan con page_view y no sirven para tomar decisiones.
        const now = new Date();
        const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        const eventsReport = await client.request<any>({
            url,
            method: 'POST',
            data: {
                dateRanges: [{ startDate: startOfMonth, endDate: 'today' }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        inListFilter: {
                            values: [
                                'purchase',
                                'view_disponibilidad',
                                'select_fechas',
                                'availability_checked',
                                'view_pricing_result',
                                'click_reservar',
                                'click_reservar_sticky',
                                'click_whatsapp_reserva',
                                'reservation_created',
                                'click_pagar',
                                'webpay_redirect_started',
                                'availability_check_failed',
                                'pricing_failed',
                                'reservation_create_failed',
                                'webpay_start_failed',
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
        const eventUserCounts: Record<string, number> = {};
        const eventRows = eventsReport.data.rows || [];
        eventRows.forEach((row: any) => {
            const eventName = row.dimensionValues[0].value;
            const count = parseInt(row.metricValues[0].value) || 0;
            eventCounts[eventName] = count;
            eventUserCounts[eventName] = parseInt(row.metricValues[1].value) || 0;
        });

        // Ambos CTA de reserva representan la misma intención. GA4 debe calcular
        // la unión de usuarios, no sumar los dos nombres (una persona puede usar
        // ambos botones). Este reporte sin dimensión entrega ese total deduplicado.
        const reserveClicksReport = await client.request<any>({
            url,
            method: 'POST',
            data: {
                dateRanges: [{ startDate: startOfMonth, endDate: 'today' }],
                metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        inListFilter: { values: ['click_reservar', 'click_reservar_sticky'] }
                    }
                }
            }
        });
        const reserveClicksRow = reserveClicksReport.data.rows?.[0];
        if (reserveClicksRow) {
            eventCounts['click_reservar'] = parseInt(reserveClicksRow.metricValues[0].value) || 0;
            eventUserCounts['click_reservar'] = parseInt(reserveClicksRow.metricValues[1].value) || 0;
        }

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
        const totalViews = eventUserCounts['view_disponibilidad'] || 0;
        const totalPurchases = eventUserCounts['purchase'] || 0;
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
                view_disponibilidad: eventCounts['view_disponibilidad'] || 0,
                select_fechas: eventCounts['select_fechas'] || 0,
                availability_checked: eventCounts['availability_checked'] || 0,
                view_pricing_result: eventCounts['view_pricing_result'] || 0,
                reservation_created: eventCounts['reservation_created'] || 0,
                click_reservar: eventCounts['click_reservar'] || 0,
                click_whatsapp_reserva: eventCounts['click_whatsapp_reserva'] || 0,
                click_pagar: eventCounts['click_pagar'] || 0,
                webpay_redirect_started: eventCounts['webpay_redirect_started'] || 0,
                availability_check_failed: eventCounts['availability_check_failed'] || 0,
                pricing_failed: eventCounts['pricing_failed'] || 0,
                reservation_create_failed: eventCounts['reservation_create_failed'] || 0,
                webpay_start_failed: eventCounts['webpay_start_failed'] || 0,
            },
            eventUsers: {
                purchase: eventUserCounts['purchase'] || 0,
                view_disponibilidad: eventUserCounts['view_disponibilidad'] || 0,
                availability_checked: eventUserCounts['availability_checked'] || 0,
                view_pricing_result: eventUserCounts['view_pricing_result'] || 0,
                click_reservar: eventUserCounts['click_reservar'] || 0,
                click_whatsapp_reserva: eventUserCounts['click_whatsapp_reserva'] || 0,
                reservation_created: eventUserCounts['reservation_created'] || 0,
                click_pagar: eventUserCounts['click_pagar'] || 0,
                webpay_redirect_started: eventUserCounts['webpay_redirect_started'] || 0,
            },
            conversionRate,
            // Fuentes de tráfico
            trafficSources,
        });

    } catch (error: any) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'No se pudo consultar la analítica. Reintenta; esto no significa cero visitas.' }, { status: 503 });
    }
}
