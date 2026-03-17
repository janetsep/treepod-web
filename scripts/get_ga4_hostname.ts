import { BetaAnalyticsDataClient } from '@google-analytics/data';

async function main() {
  const propertyId = '444158431'; 

  const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: '.treepod-ads-report-0af36e1c9441.json'
  });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '2026-03-07',
          endDate: '2026-03-14',
        },
      ],
      dimensions: [
        { name: 'eventName' },
        { name: 'hostName' }
      ],
      metrics: [
        { name: 'eventCount' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: { // FIXED
            values: ['begin_checkout', 'generate_lead', 'purchase', 'page_view']
          }
        }
      }
    });

    console.log("GA4 Events Breakdown by Hostname (March 7 - March 14):");
    console.log("---------------------------------------------------------");
    response.rows?.forEach(row => {
      const event = row.dimensionValues?.[0]?.value || '';
      const host = row.dimensionValues?.[1]?.value || '';
      const count = row.metricValues?.[0]?.value || '';
      console.log(`Event: ${event.padEnd(20)} | Host: ${host.padEnd(25)} | Count: ${count}`);
    });
    console.log("---------------------------------------------------------");

  } catch (error) {
    console.error("Error fetching GA4 data:", error);
  }
}

main();
