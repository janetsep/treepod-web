
/**
 * TreePod Server-Side Analytics (GA4 Measurement Protocol)
 * 
 * Permite enviar eventos directamente desde el servidor (Node.js) a Google Analytics.
 * Esto asegura que las conversiones (reservas pagadas) se midan siempre,
 * incluso si el cliente cierra el navegador después de pagar en Webpay.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA4_MP_API_SECRET;

interface PurchaseData {
    transaction_id: string;
    value: number;
    currency: string;
    items?: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
    }>;
}

export async function trackServerPurchase(data: PurchaseData) {
    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
        console.warn('⚠️ Server Analytics: Faltan credenciales (GA_MEASUREMENT_ID o GA_API_SECRET)');
        return;
    }

    // El client_id es requerido por Google. Usamos un ID de sistema o el ID de la transacción
    // para identificar este evento "fuera de línea".
    const clientId = `server.${data.transaction_id}`;

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
                // Indicar a Google que es un evento de prueba para que aparezca en el DebugView de GA4
                debug_mode: isDev ? 1 : undefined
            }
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const responseData = isDev ? await response.json() : null;

        if (!response.ok) {
            console.error('❌ Server Analytics Error:', response.statusText);
        } else {
            console.log(`✅ Server Analytics: ${isDev ? 'Validando estructura de' : 'Compra registrada'} (${data.transaction_id}) por $${data.value}`);
            if (isDev && responseData) {
                // Si hay errores de validación, Google los reporta en el JSON en modo debug
                if (responseData.validationMessages && responseData.validationMessages.length > 0) {
                    console.warn('⚠️ Errores de validación GA4:', JSON.stringify(responseData.validationMessages, null, 2));
                } else {
                    console.log('🟢 Estructura Correcta (Sandbox)');
                }
            }
        }
    } catch (error) {
        console.error('🔥 Server Analytics Critical Error:', error);
    }
}
