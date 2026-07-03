/**
 * TreePod Meta Conversions API (CAPI) Tracking
 *
 * Envía eventos de conversión directamente a Meta desde el servidor (Node.js).
 * Esto asegura que Meta Ads reciba retroalimentación de conversiones real,
 * permitiendo optimización de campañas incluso si el cliente cierra el navegador.
 *
 * Meta CAPI es más confiable que el pixel del lado del cliente para conversiones.
 */

import crypto from "crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID;
// Token de servidor (Conversions API). SIN prefijo NEXT_PUBLIC_ para que nunca se
// exponga al cliente. Se usa solo en el servidor (app/api/pagos/webpay/retorno).
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;

interface MetaConversionEvent {
    event_name: 'Purchase' | 'InitiateCheckout' | 'ViewContent' | 'Lead' | 'AddToCart';
    event_time: number; // Unix timestamp
    event_id: string; // Unique event ID for deduplication
    user_data?: {
        em?: string; // Email hashed
        ph?: string; // Phone hashed
        fn?: string; // First name hashed
        ln?: string; // Last name hashed
        ct?: string; // City hashed
        st?: string; // State hashed
        zp?: string; // Zip code hashed
        country?: string; // Country code
        fbc?: string; // Facebook click ID
        fbp?: string; // Facebook browser ID
    };
    custom_data?: {
        value: number;
        currency: string;
        content_name?: string;
        content_type?: string;
        content_ids?: string[];
        num_items?: number;
    };
    event_source_url?: string;
}

export interface PurchaseConversionData {
    transaction_id: string;
    value: number;
    currency: string;
    content_name?: string;
    content_ids?: string[];
    num_items?: number;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    event_source_url?: string;
}

/**
 * Envía un evento de conversión a Meta CAPI
 */
export async function trackMetaConversion(
    data: PurchaseConversionData
): Promise<{ success: boolean; response?: any; error?: string }> {
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
        console.warn('⚠️ Meta CAPI: Faltan credenciales (PIXEL_ID o ACCESS_TOKEN)');
        return {
            success: false,
            error: 'Missing Meta API credentials (PIXEL_ID or ACCESS_TOKEN)'
        };
    }

    // Crear evento en formato Meta CAPI
    const now = Math.floor(Date.now() / 1000); // Unix timestamp

    const event: MetaConversionEvent = {
        event_name: 'Purchase',
        event_time: now,
        event_id: `${data.transaction_id}_${now}`, // Unique ID for deduplication
        custom_data: {
            value: data.value,
            currency: data.currency,
            content_name: data.content_name || 'Reserva TreePod',
            content_ids: data.content_ids || ['reserva_treepod'],
            num_items: data.num_items || 1,
        },
        event_source_url: data.event_source_url || 'https://www.domostreepod.cl/confirmacion',
    };

    // Agregar user_data si está disponible (para matching mejorado con Meta)
    if (data.email || data.phone || data.first_name || data.last_name) {
        event.user_data = {
            ...(data.email && { em: hashEmail(data.email) }),
            ...(data.phone && { ph: hashPhone(data.phone) }),
            ...(data.first_name && { fn: hashString(data.first_name) }),
            ...(data.last_name && { ln: hashString(data.last_name) }),
            ...(data.city && { ct: hashString(data.city) }),
            ...(data.state && { st: hashString(data.state) }),
            ...(data.zip && { zp: hashString(data.zip) }),
            ...(data.country && { country: data.country }),
        };
    }

    const url = `https://graph.facebook.com/v20.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [event],
                test_event_code: undefined, // Solo descomentar si estás testeando
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Meta CAPI Error:', errorData);
            return {
                success: false,
                error: `Meta API Error: ${response.statusText}`,
                response: errorData
            };
        }

        const result = await response.json();
        console.log(`✅ Meta CAPI: Conversión registrada (${data.transaction_id}) por $${data.value}`);
        console.log('📊 Meta CAPI Response:', result);

        return { success: true, response: result };
    } catch (error) {
        console.error('🔥 Meta CAPI Critical Error:', error);
        return {
            success: false,
            error: `Critical error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}

/**
 * Hash SHA256 para email (requerido por Meta)
 */
function hashEmail(email: string): string {
    return hashString(email.toLowerCase().trim());
}

/**
 * Hash SHA256 para teléfono (requerido por Meta)
 */
function hashPhone(phone: string): string {
    // Remover espacios, guiones y caracteres especiales
    const cleaned = phone.replace(/[^\d+]/g, '');
    return hashString(cleaned);
}

/**
 * Hash SHA256 general para strings
 */
function hashString(str: string): string {
    // Meta EXIGE los datos personales hasheados con SHA256 (email, teléfono, nombre, etc.).
    // Normalizamos (trim + minúsculas) y devolvemos el hash hexadecimal.
    return crypto.createHash("sha256").update(str.trim().toLowerCase()).digest("hex");
}
