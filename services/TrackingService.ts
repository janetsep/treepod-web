export const TrackingService = {
    /**
     * Dispara un evento de conversión unificado
     * @param eventName - Nombre del evento (Purchase, Lead, etc)
     * @param data - Datos de la reserva (monto, glamping_id, etc)
     */
    sendEvent(eventName: string, data: Record<string, any> = {}) {
        // 1. Google Tag Manager / GA4
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: eventName,
                ...data,
                source: 'glamping_ecosystem'
            });
        }

        // 2. Meta Pixel (Eventos estándar)
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', eventName, {
                value: data.value || 0,
                currency: 'CLP', // Adjusted to CLP as it is likely Chile
                content_name: data.item_name
            });
        }

        console.log(`[Tracking] Evento ${eventName} enviado con éxito.`, data);
    }
};
