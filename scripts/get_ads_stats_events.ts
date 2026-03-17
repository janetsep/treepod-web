import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const GA4_PROPERTY_ID = "357898604"; 

async function main() {
    console.log("🚀 Fetching Google Analytics stats for Meta and Google Ads by Event...");

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
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                dimensions: [
                    { name: 'sessionSourceMedium' },
                    { name: 'eventName' }
                ],
                metrics: [
                    { name: 'eventCount' }
                ],
                dimensionFilter: {
                    filter: {
                        fieldName: 'eventName',
                        inListFilter: {
                            values: ['purchase', 'begin_checkout', 'generate_lead', 'whatsapp_click']
                        }
                    }
                }
            }
        });

        const rows = response.data.rows || [];
        console.log(`\n📊 Key Conversion Events Data (Last 28 Days):`);
        console.log(`--------------------------------------------------`);
        
        rows.forEach(row => {
            const sourceMedium = row.dimensionValues?.[0]?.value;
            const eventName = row.dimensionValues?.[1]?.value;
            const count = row.metricValues?.[0]?.value;
            
            // Only care about Google CPC or Meta/FB/IG
            if (sourceMedium?.includes('cpc') || sourceMedium?.includes('paid') || sourceMedium?.includes('fb') || sourceMedium?.includes('ig') || sourceMedium?.includes('facebook')) {
                console.log(`${sourceMedium?.padEnd(25)} | Event: ${eventName?.padEnd(20)} | Count: ${count?.padStart(4)}`);
            }
        });

    } catch (e: any) {
        console.error("❌ GA4 API Error:", e.message);
    }
}

main();
