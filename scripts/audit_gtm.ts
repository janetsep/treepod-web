
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// 1. Env Loading
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    process.env[match[1]] = (match[2] || '').replace(/^['"](.*)['"]$/, '$1');
                }
            });
        }
    } catch (e) {
        console.warn("⚠️ Env load failed", e);
    }
}
loadEnv();

const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID; // GTM-XXXXX
const GA4_PROPERTY_ID = "357898604"; // Hardcoded in mcp_config, using here

// Supabase Init
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("🚀 Starting GTM vs GA4 Audit...");

    if (!GTM_CONTAINER_ID) {
        throw new Error("Missing NEXT_PUBLIC_GTM_ID");
    }

    // 1. Auth
    const keyFile = path.join(process.cwd(), 'google_credentials.json');
    const auth = new GoogleAuth({
        keyFile,
        scopes: [
            'https://www.googleapis.com/auth/tagmanager.readonly',
            'https://www.googleapis.com/auth/analytics.readonly'
        ]
    });

    const authClient = await auth.getClient();

    // 2. Fetch GTM Tags (Simulated or Real)
    // We try to list accounts first to find the path for the container GTM-XXXX
    // Note: GTM API uses filtered listings or Account/Container IDs.
    // Given we only have the Public ID (GTM-XXXX), we'd need to find the internal API ID.
    // For now, we will SKIP the COMPLEX API lookup and assume we fail gracefully if we can't find it,
    // or just list Account 1.

    const tagmanager = google.tagmanager({ version: 'v2', auth: authClient });

    let gtmTags: any[] = [];
    try {
        console.log("🔍 Listing GTM Accounts...");
        const accountsRes = await tagmanager.accounts.list();
        const accounts = accountsRes.data.account || [];

        if (accounts.length > 0) {
            // Traverse to find container
            const account = accounts[0]; // Simplification for MVP
            const containersRes = await tagmanager.accounts.containers.list({ parent: account.path });
            const container = containersRes.data.container?.find(c => c.publicId === GTM_CONTAINER_ID)
                || containersRes.data.container?.[0];

            if (container && container.path) {
                console.log(`✅ Found Container: ${container.name} (${container.publicId})`);
                const tagsRes = await tagmanager.accounts.containers.workspaces.tags.list({
                    parent: `${container.path}/workspaces/latest` // Pseudo-path, usually requires specific workspace ID
                }).catch(async () => {
                    // Fallback: list workspaces first
                    const wsRes = await tagmanager.accounts.containers.workspaces.list({ parent: container.path });
                    const ws = wsRes.data.workspace?.[0];
                    if (ws) {
                        return await tagmanager.accounts.containers.workspaces.tags.list({ parent: ws.path });
                    }
                    return { data: { tag: [] } };
                });

                gtmTags = tagsRes.data.tag || [];
                console.log(`📦 Found ${gtmTags.length} GTM Tags.`);
            } else {
                console.warn("⚠️ Could not match GTM-ID to a container in the first account.");
            }
        }
    } catch (e: any) {
        console.error("❌ GTM API Error (Requires permissions):", e.message);
        // Continue to GA4 part regardless
    }

    // 3. Fetch GA4 Events (Last 28 days)
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient });
    let ga4Events: any[] = [];

    try {
        console.log("📊 Fetching GA4 Events...");
        const response = await analyticsData.properties.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            requestBody: {
                dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }]
            }
        });

        ga4Events = response.data.rows?.map(row => ({
            eventName: row.dimensionValues?.[0].value,
            count: row.metricValues?.[0].value
        })) || [];

        console.log(`📈 Found ${ga4Events.length} distinct GA4 events.`);
        ga4Events.forEach(e => console.log(`   - ${e.eventName}: ${e.count}`));

    } catch (e: any) {
        console.error("❌ GA4 API Error:", e.message);
    }

    // 4. Compare & "Fix" (Logic)
    // We check if "purchase", "begin_checkout" exist in GA4.
    const criticalEvents = ['purchase', 'begin_checkout', 'view_item', 'view_item_list'];
    const discrepancies: string[] = [];

    criticalEvents.forEach(evt => {
        const found = ga4Events.find(e => e.eventName === evt);
        if (!found) {
            discrepancies.push(`MISSING_IN_GA4: ${evt}`);
        }
    });

    // 5. Log to Supabase
    const { error } = await supabase.from('gtm_audit_logs').insert({
        tags_found: gtmTags.map(t => t.name),
        active_events: ga4Events,
        discrepancies: discrepancies,
        corrections: { note: "Automated fixes not fully implemented in script, requires code changes." }
    });

    if (error) console.error("Database Error:", error);
    else console.log("💾 Audit saved to DB.");
}

main();
