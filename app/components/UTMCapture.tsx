'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  // Identificadores de clic del anuncio. Sin ellos no se pueden subir
  // conversiones offline a Google Ads / Meta: las reservas que cierran por
  // WhatsApp quedan invisibles para el algoritmo.
  gclid?: string;
  fbclid?: string;
}

const STORAGE_KEY = 'treepod_utms';
const LANDING_KEY = 'treepod_landing_page';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function setWithExpiry(key: string, value: string) {
  localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + TTL_MS }));
}

function getWithExpiry(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(key); return null; }
    return value;
  } catch { return null; }
}

export function getStoredUTMs(): UTMParams {
  if (typeof window === 'undefined') return {};
  try {
    const stored = getWithExpiry(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export function getStoredLandingPage(): string | null {
  if (typeof window === 'undefined') return null;
  return getWithExpiry(LANDING_KEY);
}

export default function UTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      if (!getWithExpiry(LANDING_KEY)) {
        setWithExpiry(LANDING_KEY, window.location.pathname + window.location.search);
      }
    } catch {}

    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    const incoming: UTMParams = {};
    utmKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) incoming[key as keyof UTMParams] = value;
    });

    // El etiquetado automático de Google Ads agrega SOLO gclid, sin utm_*: por eso
    // hasta ahora el 95% de las reservas llegaba sin ninguna atribución.
    const gclid = searchParams.get('gclid') || undefined;
    const fbclid = searchParams.get('fbclid') || undefined;

    if (Object.keys(incoming).length === 0 && !gclid && !fbclid) return;

    const existing = getStoredUTMs();
    // Los utm mantienen el primer contacto (no se pisan). El id de clic, en cambio,
    // se actualiza siempre: la conversión se atribuye al último clic del anuncio.
    const merged: UTMParams = Object.keys(existing).length > 0 ? { ...existing } : { ...existing, ...incoming };
    if (gclid) merged.gclid = gclid;
    if (fbclid) merged.fbclid = fbclid;

    try {
      setWithExpiry(STORAGE_KEY, JSON.stringify(merged));
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'utm_captured', ...merged, source: 'glamping_ecosystem' });
      }
    } catch {}
  }, [searchParams]);

  return null;
}