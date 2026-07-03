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

    if (Object.keys(incoming).length === 0) return;
    const existing = getStoredUTMs();
    if (Object.keys(existing).length > 0) return;

    try {
      setWithExpiry(STORAGE_KEY, JSON.stringify(incoming));
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'utm_captured', ...incoming, source: 'glamping_ecosystem' });
      }
    } catch {}
  }, [searchParams]);

  return null;
}