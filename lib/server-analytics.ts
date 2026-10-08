
/**
 * TreePod Server-Side Analytics (GA4 Measurement Protocol)
 * 
 * Permite enviar eventos directamente desde el servidor (Node.js) a Google Analytics.
 * Intenta enviar la compra confirmada aunque el cliente cierre el navegador.
 * La aceptación HTTP no acredita su procesamiento en los informes de GA4.
 */


interface PurchaseData {
    transaction_id: string;
    value: number;
    currency: string;
    client_id?: string;
    session_id?: number;
    check_in?: string;
    check_out?: string;
    guests?: number;
    dome_id?: string;
    dome_name?: string;
    items?: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
    }>;
}

export type PurchaseDelivery = {
    status: 'http_accepted' | 'validated' | 'missing_configuration' | 'failed' | 'excluded';
    reason?: string;
};

export async function trackServerPurchase(data: PurchaseData): Promise<PurchaseDelivery> {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const GA_API_SECRET = process.env.GA4_MP_API_SECRET;
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
        return {status: 'excluded', reason: 'non_production_deployment'};
    }
    if (!data.transaction_id || !Number.isFinite(data.value) || data.value <= 500 || data.currency !== 'CLP') {
        return {status: 'excluded', reason: 'test_or_invalid_purchase'};
    }
    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
        console.warn('⚠️ Server Analytics: Faltan credenciales (GA_MEASUREMENT_ID o GA_API_SECRET)');
        return {status: 'missing_configuration', reason: 'measurement_id_or_api_secret_missing'};
    }

    // Never invent a GA4 user: a synthetic id cannot be reconciled with the
    // browser's purchase and can defeat transaction deduplication/attribution.
    if (!data.client_id?.trim()) {
        return {status: 'excluded', reason: 'original_client_id_missing'};
    }
    const clientId = data.client_id;

    // Seleccionar URL de validación o real según el ambiente
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
        ? 'https://www.google-analytics.com/debug/mp/collect'
        : 'https://www.google-analytics.com/mp/collect';

    const url = `${baseUrl}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

    const payload = {
        client_id: clientId,
        events: [{
            name: 'purchase',
            params: {
                transaction_id: data.transaction_id,
                session_id: Number.isSafeInteger(data.session_id) && Number(data.session_id) > 0 ? data.session_id : undefined,
                engagement_time_msec: 1,
                value: data.value,
                currency: data.currency,
                items: data.items || [{
                    item_id: 'reserva_treepod',
                    item_name: 'Reserva TreePod',
                    price: data.value,
                    quantity: 1
                }],
                source_type: 'server_side',
                site_version: 'web_nueva_2026',
                check_in: data.check_in,
                check_out: data.check_out,
                guests: data.guests,
                dome_id: data.dome_id,
                dome_name: data.dome_name,
                // Indicar a Google que es un evento de prueba para que aparezca en el DebugView de GA4
                debug_mode: isDev ? 1 : undefined
            }
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {'Content-Type': 'application/json'},
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            return {status: 'failed', reason: `http_${response.status}`};
        }
        if (isDev) {
            const result = await response.json();
            if (result.validationMessages?.length) {
                return {status: 'failed', reason: 'payload_validation_failed'};
            }
            return {status: 'validated'};
        }
        // A 2xx means transport accepted, not that GA4 processed the purchase.
        console.log('GA4_PURCHASE_HTTP_ACCEPTED', {transactionId: data.transaction_id});
        return {status: 'http_accepted'};
    } catch {
        // Never log the fetch URL: it contains the Measurement Protocol secret.
        console.error('GA4_PURCHASE_TRANSPORT_FAILED', {transactionId: data.transaction_id});
        return {status: 'failed', reason: 'transport_error_or_timeout'};
    }
}
