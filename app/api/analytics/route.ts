
import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

export async function GET() {
    try {
        // Determine the correct path for credentials
        // In production (Vercel/etc), this might need Env Var strategy.
        // For local/VPS, we use the verified file.

        // Fallback: If GOOGLE_APPLICATION_CREDENTIALS env is set (even if it's the raw JSON string), 
        // GoogleAuth handles it automatically if we don't pass keyFile, OR we check manually.

        // For this specific environment where we verified 'google_credentials.json' works:
        const keyFile = path.join(process.cwd(), 'google_credentials.json');

        const auth = new GoogleAuth({
            keyFile: keyFile,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        });

        const client = await auth.getClient();
        const propertyId = '357898604';
        const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

        // Report Request: Last 28 days stats
        const requestBody = {
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'engagementRate' }
            ]
        };

        const res = await client.request<any>({
            url,
            method: 'POST',
            data: requestBody,
        });

        const rows = res.data.rows;
        let activeUsers = 0;
        let sessions = 0;
        let weightedEngagement = 0;

        if (rows && rows.length > 0) {
            // GA4 API returns one row if we don't specify dimensions (aggregate)
            // But verify just in case
            rows.forEach((row: any) => {
                const users = parseInt(row.metricValues[0].value);
                const sess = parseInt(row.metricValues[1].value);
                const rate = parseFloat(row.metricValues[2].value);

                activeUsers += users;
                sessions += sess;
                // Basic weighted average logic if multiple rows (though without dims it should be 1 row)
                // If 1 row, this works.
            });

            // If aggregate row
            if (rows.length === 1) {
                weightedEngagement = parseFloat(rows[0].metricValues[2].value);
            }
        }

        return NextResponse.json({
            activeUsers,
            sessions,
            engagementRate: weightedEngagement,
            period: '28d'
        });

    } catch (error: any) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
