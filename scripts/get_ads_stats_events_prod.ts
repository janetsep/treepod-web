import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const GA4_PROPERTY_ID = "357898604"; 

async function main() {
    console.log("🚀 Fetching Google Analytics stats for Meta and Google Ads by Event (From March 7th, 2026)...");

    const keyFile = path.join(process.cwd(), 'google_credentials.json');
    const auth = new GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const authClient = await auth.getClient();
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient });

    try {
        const response = await analyticsData.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '2026-03-07', endDate: '2026-03-14' }],
                dimensions: [
                    { name: 'sessionSourceMedium' },
                    { name: 'eventName' }
                ],
                metrics: [
                    { name: 'eventCount' },
                    { name: 'sessions' },
                    { name: 'activeUsers' },
                    { name: 'conversions'}
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        inListFilter: {
                            values: ['purchase', 'begin_checkout', 'generate_lead', 'whatsapp_click', 'session_start']
                        }
                    }
                }
            }
        });

        const rows = response.data.rows || [];
        console.log(`\n📊 Key Events Data (March 7th to March 14th):`);
        console.log(`--------------------------------------------------`);
        
        let report: any = {};

        rows.forEach(row => {
            const sourceMedium = row.dimensionValues?.[0]?.value || 'unknown';
            const eventName = row.dimensionValues?.[1]?.value || 'unknown';
            const count = parseInt(row.metricValues?.[0]?.value || '0');
            
            if (!report[sourceMedium]) report[sourceMedium] = {};
            report[sourceMedium][eventName] = count;
        });

        for (const [source, events] of Object.entries(report)) {
            console.log(`\n📌 Fuente: ${source}`);
            if ((events as any) !== null && typeof events === 'object') {
                for(const [evt, val] of Object.entries(events as any)) {
                    console.log(`    - ${evt.padEnd(16)}: ${val}`);
                }
            }
        }

    } catch (e: any) {
        console.error("❌ GA4 API Error:", e.message);
    }
}

main();
