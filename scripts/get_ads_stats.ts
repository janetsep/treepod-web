import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const GA4_PROPERTY_ID = "357898604"; 

async function main() {
    console.log("🚀 Fetching Google Analytics stats for Meta and Google Ads...");

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
                    { name: 'sessionSourceMedium' }
                ],
                metrics: [
                    { name: 'sessions' },
                    { name: 'activeUsers' },
                    { name: 'conversions' }
                ]
            }
        });

        const rows = response.data.rows || [];
        console.log(`\n📊 Acquisition Data (Last 28 Days):`);
        console.log(`--------------------------------------------------`);
        
        rows.forEach(row => {
            const sourceMedium = row.dimensionValues?.[0]?.value;
            const sessions = row.metricValues?.[0]?.value;
            const users = row.metricValues?.[1]?.value;
            const conversions = row.metricValues?.[2]?.value;
            
            console.log(`${sourceMedium?.padEnd(30)} | Sessions: ${sessions?.padStart(4)} | Users: ${users?.padStart(4)} | Conversions: ${conversions?.padStart(4)}`);
        });

    } catch (e: any) {
        console.error("❌ GA4 API Error:", e.message);
    }
}

main();
