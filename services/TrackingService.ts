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

        // Los eventos para Meta (Facebook) y Ads se gestionan ahora centralizadamente desde GTM
        // cuando detecta el evento en el dataLayer. No duplicar tracking manual aquí.

        console.log(`[Tracking] Evento ${eventName} enviado con éxito.`, data);
    }
};
