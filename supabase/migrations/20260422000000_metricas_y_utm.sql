-- ============================================================
-- Migración: Completar columnas UTM en leads_checkout
--            y definir estructura de tablas de métricas
-- Aplicar en: Supabase Dashboard → SQL Editor
-- Fecha: 22 Abril 2026
-- ============================================================

-- 1. LEADS_CHECKOUT: agregar columnas UTM faltantes
ALTER TABLE leads_checkout
  ADD COLUMN IF NOT EXISTS utm_source    TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium    TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign  TEXT,
  ADD COLUMN IF NOT EXISTS utm_content   TEXT,
  ADD COLUMN IF NOT EXISTS utm_term      TEXT,
  ADD COLUMN IF NOT EXISTS landing_page  TEXT,
  ADD COLUMN IF NOT EXISTS session_id    TEXT,
  ADD COLUMN IF NOT EXISTS is_test       BOOLEAN DEFAULT false;

-- 2. METRICAS_GA4: definir estructura si está vacía
CREATE TABLE IF NOT EXISTS metricas_ga4 (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha           DATE NOT NULL,
  sesiones        INTEGER DEFAULT 0,
  usuarios        INTEGER DEFAULT 0,
  nuevos_usuarios INTEGER DEFAULT 0,
  pageviews       INTEGER DEFAULT 0,
  bounce_rate     NUMERIC(5,2),
  duracion_media  NUMERIC(10,2),
  conversiones    INTEGER DEFAULT 0,
  revenue         NUMERIC(12,0) DEFAULT 0,
  canal           TEXT,
  fuente          TEXT,
  medio           TEXT,
  campana         TEXT,
  creado_en       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. METRICAS_SEARCH_CONSOLE: definir estructura si está vacía
CREATE TABLE IF NOT EXISTS metricas_search_console (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha       DATE NOT NULL,
  url         TEXT,
  keyword     TEXT,
  clics       INTEGER DEFAULT 0,
  impresiones INTEGER DEFAULT 0,
  ctr         NUMERIC(5,4),
  posicion    NUMERIC(6,2),
  pais        TEXT DEFAULT 'cl',
  device      TEXT DEFAULT 'DESKTOP',
  creado_en   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. METRICAS_META: definir estructura si está vacía
CREATE TABLE IF NOT EXISTS metricas_meta (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha           DATE NOT NULL,
  campana_id      TEXT,
  campana_nombre  TEXT,
  conjunto_id     TEXT,
  conjunto_nombre TEXT,
  impresiones     INTEGER DEFAULT 0,
  clics           INTEGER DEFAULT 0,
  ctr             NUMERIC(6,4),
  gasto           NUMERIC(12,0) DEFAULT 0,
  alcance         INTEGER DEFAULT 0,
  frecuencia      NUMERIC(6,2),
  cpc             NUMERIC(10,0),
  cpm             NUMERIC(10,0),
  conversiones    INTEGER DEFAULT 0,
  creado_en       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Índices para búsquedas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_metricas_ga4_fecha           ON metricas_ga4(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_metricas_search_console_fecha ON metricas_search_console(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_metricas_meta_fecha           ON metricas_meta(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_leads_checkout_utm_source     ON leads_checkout(utm_source);
