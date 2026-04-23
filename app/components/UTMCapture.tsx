'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const STORAGE_KEY = 'treepod_utms';

export function getStoredUTMs(): UTMParams {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export default function UTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    const incoming: UTMParams = {};
    utmKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) incoming[key as keyof UTMParams] = value;
    });

    const existing = getStoredUTMs();

    if (Object.keys(incoming).length > 0) {
      // Solo guardar si no hay UTMs previos (primer touch wins)
      if (Object.keys(existing).length === 0) {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
        } catch {}
      }
      // Siempre enviar a dataLayer cuando hay UTMs en la URL
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'utm_captured', ...incoming });
      }
      return;
    }

    // Sin UTMs: inferir canal desde referrer para reducir tráfico Unassigned
    try {
      const referrer = document.referrer;
      let inferred_source = 'direct';
      let inferred_medium = 'none';

      if (referrer) {
        const ref = new URL(referrer);
        const host = ref.hostname;
        if (/google\.|bing\.|yahoo\.|duckduckgo\./.test(host)) {
          inferred_source = host.split('.')[0];
          inferred_medium = 'organic';
        } else if (/facebook\.|instagram\.|fb\./.test(host)) {
          inferred_source = 'facebook';
          inferred_medium = 'social';
        } else if (/airbnb\./.test(host)) {
          inferred_source = 'airbnb';
          inferred_medium = 'referral';
        } else if (host && host !== window.location.hostname) {
          inferred_source = host;
          inferred_medium = 'referral';
        }
      }

      if (window.dataLayer && inferred_source !== 'direct') {
        window.dataLayer.push({
          event: 'traffic_source_inferred',
          inferred_source,
          inferred_medium,
          referrer: referrer || '(none)',
        });
      }
    } catch {}
  }, [searchParams]);

  return null;
}