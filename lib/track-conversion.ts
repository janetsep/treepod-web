/**
 * TreePod Conversion Tracking - Unified Handler
 *
 * Registra conversiones en Supabase para:
 * 1. Atribución correcta de campañas (Meta Ads → Reserva)
 * 2. Análisis histórico y ROI
 * 3. Feedback para optimización de anuncios
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface ConversionRecord {
    transaction_id: string;
    reserva_id: string;
    value: number; // Monto en CLP
    currency: string;
    conversion_type: 'purchase' | 'reservation' | 'lead';
    source?: string; // Meta, Google, Direct, etc.
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    user_agent?: string;
    ip_address?: string;
    conversion_timestamp?: string;
}

/**
 * Registra una conversión en la tabla "conversiones" de Supabase
 * Se llama DESPUÉS de confirmar el pago en Transbank
 */
export async function recordConversion(data: ConversionRecord) {
    try {
        const { data: result, error } = await supabaseAdmin
            .from('conversiones')
            .insert({
                transaction_id: data.transaction_id,
                reserva_id: data.reserva_id,
                value: data.value,
                currency: data.currency,
                conversion_type: data.conversion_type,
                source: data.source || 'unknown',
                utm_source: data.utm_source,
                utm_medium: data.utm_medium,
                utm_campaign: data.utm_campaign,
                utm_content: data.utm_content,
                utm_term: data.utm_term,
                user_agent: data.user_agent,
                ip_address: data.ip_address,
                conversion_timestamp: data.conversion_timestamp || new Date().toISOString(),
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error registrando conversión en Supabase:', error.message);
            throw error;
        }

        console.log(`✅ Conversión registrada: ${data.transaction_id} (${data.value} ${data.currency})`);
        return result;
    } catch (error) {
        console.error('🔥 Critical error in recordConversion:', error);
        throw error;
    }
}

/**
 * Obtiene UTM params desde headers o localStorage (si disponible en cliente)
 */
export function extractUTMParams(headers?: Record<string, any>): {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
} {
    // En server-side, podemos extraer del referer header
    const referer = headers?.referer || headers?.['referer'];

    const utmParams: any = {};

    if (referer) {
        try {
            const url = new URL(referer);
            if (url.searchParams.has('utm_source')) {
                utmParams.utm_source = url.searchParams.get('utm_source');
            }
            if (url.searchParams.has('utm_medium')) {
                utmParams.utm_medium = url.searchParams.get('utm_medium');
            }
            if (url.searchParams.has('utm_campaign')) {
                utmParams.utm_campaign = url.searchParams.get('utm_campaign');
            }
            if (url.searchParams.has('utm_content')) {
                utmParams.utm_content = url.searchParams.get('utm_content');
            }
            if (url.searchParams.has('utm_term')) {
                utmParams.utm_term = url.searchParams.get('utm_term');
            }
        } catch (e) {
            // Referer no es una URL válida
        }
    }

    return utmParams;
}

/**
 * Extrae info del cliente para mejor matching en Meta CAPI
 */
export function extractClientInfo(headers?: Record<string, any>): {
    user_agent?: string;
    ip_address?: string;
} {
    return {
        user_agent: headers?.['user-agent'],
        ip_address: headers?.['x-forwarded-for']?.split(',')[0] || headers?.['x-real-ip'],
    };
}
