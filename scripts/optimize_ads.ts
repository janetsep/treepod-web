
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually since we are running via npx tsx
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            console.log("📄 Loading .env.local...");
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.warn("⚠️ Failed to load .env.local", e);
    }
}
loadEnv();

// Initialize Supabase manually to ensure we have the env vars loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
    console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL not found in environment.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// CONFIGURATION
// ==========================================
// You must set this in your environment or .env.local
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;

// Taken from your mcp_config.json
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || 'QCO80kC64IsPA0TNTdDssQ';

// Thresholds
const LOW_ROI_THRESHOLD = 1.0; // If ROAS < 1.0 (Spent more than earned)
const HIGH_ROI_THRESHOLD = 4.0; // If ROAS > 4.0 (Earned 4x spend)
const BUDGET_INCREASE_FACTOR = 1.2; // 20% increase

// Safety fallback
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--apply');

async function main() {
    console.log(`🚀 Starting Ads Optimization... [Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}]`);

    if (!CUSTOMER_ID) {
        console.error("❌ ERROR: GOOGLE_ADS_CUSTOMER_ID is missing. Please set it in .env.local or environment.");
        process.exit(1);
    }

    // 1. Authenticate
    const keyFile = path.join(process.cwd(), 'google_credentials.json');
    if (!fs.existsSync(keyFile)) {
        console.error("❌ ERROR: google_credentials.json not found.");
        process.exit(1);
    }

    const auth = new GoogleAuth({
        keyFile: keyFile,
        scopes: ['https://www.googleapis.com/auth/adwords'], // Scope for Google Ads
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
        throw new Error("Failed to get access token");
    }

    // 2. Fetch Campaign Performance (Last 7 Days)
    console.log("📊 Fetching campaign performance...");

    const query = `SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros, metrics.cost_micros, metrics.conversions_value, metrics.conversions FROM campaign WHERE campaign.status = 'ENABLED' AND segments.date DURING LAST_7_DAYS`;

    const searchUrl = `https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/googleAds:searchStream`;

    const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'developer-token': DEVELOPER_TOKEN,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Google Ads API Error (${response.status}):`, errorText);
        process.exit(1);
    }

    const data = await response.json();
    const rows = data[0]?.results || []; // searchStream returns array of batches

    if (rows.length === 0) {
        console.log("⚠️ No active campaigns found with data.");
        return;
    }

    const report = [];
    const operations = [];

    // 3. Analyze and Plan
    for (const row of rows) {
        const campaign = row.campaign;
        const metrics = row.metrics;
        const budget = row.campaignBudget;

        const cost = parseInt(metrics.costMicros || '0') / 1_000_000;
        const value = parseInt(metrics.conversionsValue || '0');
        const conversions = parseFloat(metrics.conversions || '0');

        // Avoid division by zero
        const roas = cost > 0 ? value / cost : 0;

        console.log(`Campaign: ${campaign.name} (ID: ${campaign.id}) | Cost: $${cost.toFixed(0)} | Value: $${value} | ROAS: ${roas.toFixed(2)}`);

        // Check Performance
        let action = 'MAINTAIN';

        if (cost > 10000 && roas < LOW_ROI_THRESHOLD) { // Minimum spend to judge
            action = 'PAUSE';
        } else if (roas > HIGH_ROI_THRESHOLD) {
            action = 'INCREASE_BUDGET';
        }

        report.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            cost,
            value,
            roas,
            status: campaign.status,
            proposed_action: action
        });

        // Prepare Operations (Mutations)
        if (action === 'PAUSE') {
            operations.push({
                type: 'PAUSE',
                resourceName: campaign.resourceName,
                campaignId: campaign.id
            });
        } else if (action === 'INCREASE_BUDGET') {
            // Note: Updating budget is more complex, requires CampaignBudget resource update
            // For now, we just log it. Budget ID is needed.
            operations.push({
                type: 'INCREASE_BUDGET',
                resourceName: campaign.resourceName, // Incorrect, we need budget resource name
                campaignId: campaign.id,
                currentBudget: budget.amountMicros
            });
        }
    }

    // 4. Save to Supabase
    console.log("💾 Saving report to Supabase...");
    const { error: dbError } = await supabase.from('ads_optimization_logs').insert({
        run_at: new Date().toISOString(),
        report: report,
        applied: !DRY_RUN
    });

    if (dbError) {
        console.warn("⚠️ Could not write to Supabase (Table 'ads_optimization_logs' might be missing):", dbError.message);
    } else {
        console.log("✅ Report saved to DB.");
    }

    // 5. Execute Actions (if Apply)
    if (DRY_RUN) {
        console.log("\n👀 DRY RUN SUMMARY (Active changes NOT applied):");
        console.log(JSON.stringify(operations, null, 2));
        console.log("\n👉 To apply these changes, run with --apply");
    } else {
        console.log("\n⚡ EXECUTING CHANGES...");

        // This part needs to implement the mutate call
        // For 'PAUSE', we construct the mutate operation
        const pauseOps = operations.filter(op => op.type === 'PAUSE').map(op => ({
            update: {
                resourceName: op.resourceName,
                status: 'PAUSED'
            },
            updateMask: { paths: ['status'] }
        }));

        if (pauseOps.length > 0) {
            const mutateUrl = `https://googleads.googleapis.com/v23/customers/${CUSTOMER_ID}/campaigns:mutate`;
            const mutateRes = await fetch(mutateUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'developer-token': DEVELOPER_TOKEN,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operations: pauseOps
                })
            });

            const mutateData = await mutateRes.json();
            if (!mutateRes.ok) {
                console.error("❌ Failed to pause campaigns:", JSON.stringify(mutateData, null, 2));
            } else {
                console.log(`✅ Paused ${pauseOps.length} campaigns.`);
            }
        } else {
            console.log("No campaigns to pause.");
        }

        // Budget increases require Budget Service, skipping for safety/complexity in this iteration
        const budgetOps = operations.filter(op => op.type === 'INCREASE_BUDGET');
        if (budgetOps.length > 0) {
            console.log(`⚠️ identified ${budgetOps.length} campaigns for budget increase, but auto-budget-increase is disabled in this script version for safety.`);
        }
    }
}

main().catch(err => {
    console.error("🔥 Fatal Error:", err);
    process.exit(1);
});
