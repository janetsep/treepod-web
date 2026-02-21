
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

async function main() {
    const GA4_PROPERTY_ID = "357898604";
    const keyFile = path.join(process.cwd(), 'google_credentials.json');

    const auth = new GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const authClient = await auth.getClient();
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient });

    console.log("📊 Fetching GA4 Events for Yesterday by Date...");

    try {
        const response = await analyticsData.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'date' }, { name: 'eventName' }],
                metrics: [{ name: 'eventCount' }]
            }
        });

        const rows = response.data.rows || [];
        console.log(`📈 Results (Last 7 days):`);
        rows.forEach(row => {
            const date = row.dimensionValues?.[0].value;
            const eventName = row.dimensionValues?.[1].value;
            const count = row.metricValues?.[0].value;
            if (eventName.includes('whatsapp') || eventName.includes('chat') || eventName === 'click') {
                console.log(`   - ${date} | ${eventName}: ${count}`);
            }
        });

    } catch (e: any) {
        console.error("❌ GA4 API Error:", e.message);
    }
}

main();
