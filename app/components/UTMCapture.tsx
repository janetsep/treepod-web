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
const LANDING_KEY = 'treepod_landing_page';

export function getStoredUTMs(): UTMParams {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export function getStoredLandingPage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(LANDING_KEY);
  } catch { return null; }
}

export default function UTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Captura landing_page en el primer touch (cualquier página, con o sin UTMs)
    try {
      if (!sessionStorage.getItem(LANDING_KEY)) {
        sessionStorage.setItem(LANDING_KEY, window.location.pathname + window.location.search);
      }
    } catch {}

    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    const incoming: UTMParams = {};
    utmKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) incoming[key as keyof UTMParams] = value;
    });

    if (Object.keys(incoming).length === 0) return;
    const existing = getStoredUTMs();
    if (Object.keys(existing).length > 0) return; // primer touch wins

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'utm_captured', ...incoming, source: 'glamping_ecosystem' });
      }
    } catch {}
  }, [searchParams]);

  return null;
}