
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

async function main() {
    const keyFile = path.join(process.cwd(), 'google_credentials.json');
    const auth = new GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const authClient = await auth.getClient();
    const analyticsAdmin = google.analyticsadmin({ version: 'v1alpha', auth: authClient });

    console.log("🔍 Checking accessible GA4 Account Summaries...");
    try {
        const response = await analyticsAdmin.accountSummaries.list();
        const summaries = response.data.accountSummaries || [];

        summaries.forEach(acc => {
            console.log(`Account: ${acc.displayName} (${acc.account})`);
            acc.propertySummaries?.forEach(prop => {
                console.log(`   - Property: ${prop.displayName} (${prop.property})`);
            });
        });

    } catch (e: any) {
        console.error("❌ API Error:", e.message);
    }
}

main();
