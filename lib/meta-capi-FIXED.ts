/**
 * TreePod Meta Conversions API (CAPI) Tracking - FIXED VERSION
 * 
 * ✅ IMPLEMENTA HASH SHA256 CORRECTO para PII (Personally Identifiable Information)
 * Meta REQUIERE que email, teléfono, nombre estén hasheados con SHA256
 * 
 * Envía eventos de conversión directamente a Meta desde el servidor (Node.js).
 */

import crypto from 'crypto';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONVERSIONS_API_TOKEN;

interface MetaConversionEvent {
    event_name: 'Purchase' | 'InitiateCheckout' | 'ViewContent' | 'Lead' | 'AddToCart';
    event_time: number;
    event_id: string;
    user_data?: {
        em?: string;      // Email hasheado
        ph?: string;      // Teléfono hasheado
        fn?: string;      // First name hasheado
        ln?: string;      // Last name hasheado
        ct?: string;      // City hasheado
        st?: string;      // State hasheado
        zp?: string;      // Zip code hasheado
        country?: string;
        fbc?: string;
        fbp?: string;
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
 * ✅ Hash SHA256 CORRECTO para email
 * Meta requirements: normalize lowercase, trim, then SHA256
 */
function hashEmail(email: string): string {
    if (!email) return '';
    const normalized = email.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * ✅ Hash SHA256 CORRECTO para teléfono
 * Meta requirements: remove non-digit characters except +, then SHA256
 */
function hashPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/[^\d+]/g, '');
    return crypto.createHash('sha256').update(cleaned).digest('hex');
}

/**
 * ✅ Hash SHA256 CORRECTO para strings (nombres, ciudades, etc)
 * Meta requirements: lowercase, trim, then SHA256
 */
function hashString(str: string): string {
    if (!str) return '';
    const normalized = str.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Envía un evento de conversión a Meta CAPI
 * ✅ Con PII correctamente hasheada en SHA256
 */
export async function trackMetaConversion(
    data: PurchaseConversionData
): Promise<{ success: boolean; response?: any; error?: string }> {
    
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
        console.warn('⚠️ Meta CAPI: Faltan credenciales');
        console.warn(`   - NEXT_PUBLIC_PIXEL_ID: ${META_PIXEL_ID ? '✅ Configured' : '❌ Missing'}`);
        console.warn(`   - NEXT_PUBLIC_CONVERSIONS_API_TOKEN: ${META_ACCESS_TOKEN ? '✅ Configured' : '❌ Missing'}`);
        return {
            success: false,
            error: 'Missing Meta API credentials (PIXEL_ID or ACCESS_TOKEN)'
        };
    }

    const now = Math.floor(Date.now() / 1000);

    const event: MetaConversionEvent = {
        event_name: 'Purchase',
        event_time: now,
        event_id: `${data.transaction_id}_${now}`,
        custom_data: {
            value: data.value,
            currency: data.currency,
            content_name: data.content_name || 'Reserva TreePod',
            content_ids: data.content_ids || ['reserva_treepod'],
            num_items: data.num_items || 1,
        },
        event_source_url: data.event_source_url || 'https://www.domostreepod.cl/confirmacion',
    };

    // ✅ Agregar user_data CON HASH SHA256
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
        
        console.log('🔐 PII Hashing:', {
            email_hashed: data.email ? '✅' : '❌',
            phone_hashed: data.phone ? '✅' : '❌',
            name_hashed: data.first_name && data.last_name ? '✅' : '❌'
        });
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
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Meta CAPI Error:', JSON.stringify(errorData, null, 2));
            return {
                success: false,
                error: `Meta API Error: ${response.statusText}`,
                response: errorData
            };
        }

        const result = await response.json();
        console.log(`✅ Meta CAPI: Conversión registrada`);
        console.log(`   - Transaction: ${data.transaction_id}`);
        console.log(`   - Amount: $${data.value} ${data.currency}`);
        console.log(`   - Response: ${JSON.stringify(result)}`);

        return { success: true, response: result };
    } catch (error) {
        console.error('🔥 Meta CAPI Critical Error:', error);
        return {
            success: false,
            error: `Critical error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
