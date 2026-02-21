
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

    console.log("📊 Fetching GA4 Events for Yesterday (2026-02-03)...");

    try {
        const response = await analyticsData.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '2026-02-03', endDate: '2026-02-03' }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }]
            }
        });

        const rows = response.data.rows || [];
        console.log(`📈 Results for 2026-02-03:`);
        rows.forEach(row => {
            const eventName = row.dimensionValues?.[0].value;
            const count = row.metricValues?.[0].value;
            console.log(`   - ${eventName}: ${count}`);
        });

        if (rows.length === 0) {
            console.log("   (No events found for this day)");
        }

    } catch (e: any) {
        console.error("❌ GA4 API Error:", e.message);
    }
}

main();
