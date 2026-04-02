"use client";

import { useEffect, useState } from 'react';

interface GTMDebugProps {
  enabled?: boolean;
}

export default function DebugGTM({ enabled }: GTMDebugProps) {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Verificar si estamos en desarrollo solo del lado del cliente
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  useEffect(() => {
    if (!enabled || !isDev) return;

    const debugGTMConnection = () => {
      console.log('🎯 TREEPOD - Debug GTM → GA4');

      // Verificar GTM
      const hasGTM = typeof (window as any).dataLayer !== 'undefined';
      const hasGoogleTagManager = typeof (window as any).google_tag_manager !== 'undefined';
      const hasFBQ = typeof (window as any).fbq !== 'undefined';

      console.log('📊 Estado de tracking:', {
        GTM_DataLayer: hasGTM ? '✅' : '❌',
        GTM_Manager: hasGoogleTagManager ? '✅' : '❌',
        Meta_Pixel: hasFBQ ? '✅' : '❌',
        DataLayer_Events: hasGTM ? (window as any).dataLayer?.length || 0 : 0,
        URL: window.location.href,
        Timestamp: new Date().toISOString()
      });

      // Enviar evento de debug cada 30 segundos (solo en desarrollo)
      if (hasGTM) {
        (window as any).dataLayer.push({
          event: 'debug_page_active',
          debug_url: window.location.pathname,
          debug_timestamp: Date.now()
        });
      }
    };

    // Debug inicial
    debugGTMConnection();

    // Debug cada 30 segundos en desarrollo
    const interval = setInterval(debugGTMConnection, 30000);

    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isDev) return;

    // Detectar eventos de GTM en tiempo real
    const originalPush = (window as any).dataLayer?.push;
    if (originalPush) {
      (window as any).dataLayer.push = function(...args: any[]) {
        console.log('📤 Evento enviado a dataLayer:', args[0]);
        return originalPush.apply(this, args);
      };
    }

    // Detectar eventos de Meta Pixel
    const originalFBQ = (window as any).fbq;
    if (originalFBQ) {
      (window as any).fbq = function(...args: any[]) {
        console.log('📘 Evento enviado a Meta Pixel:', args);
        return originalFBQ.apply(this, args);
      };
    }
  }, [enabled]);

  // Solo mostrar en desarrollo y después de hidratación
  if (!enabled || !isDev) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      userSelect: 'none'
    }}>
      🎯 GTM Debug Active
    </div>
  );
}