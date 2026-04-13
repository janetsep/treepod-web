-- TreePod Metrics Tables Migration
-- Fecha: 12 abril 2026
-- Propósito: Crear tablas para almacenar métricas de GA4, Search Console y Meta Ads

-- 1. Tabla para métricas de Google Analytics 4
CREATE TABLE IF NOT EXISTS metricas_ga4 (
  id SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  canal TEXT,
  sesiones INTEGER,
  usuarios INTEGER,
  nuevos_usuarios INTEGER,
  tasa_rebote DECIMAL,
  duracion_promedio DECIMAL,
  conversiones INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla para métricas de Search Console
CREATE TABLE IF NOT EXISTS metricas_search_console (
  id SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  keyword TEXT,
  clics INTEGER,
  impresiones INTEGER,
  ctr DECIMAL,
  posicion_promedio DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla para métricas de Meta Ads
CREATE TABLE IF NOT EXISTS metricas_meta (
  id SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  campaign_name TEXT,
  alcance INTEGER,
  impresiones INTEGER,
  clics INTEGER,
  ctr DECIMAL,
  gasto DECIMAL,
  acciones INTEGER,
  cpc DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Agregar columnas UTM a leads_checkout (si no existen)
ALTER TABLE leads_checkout
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- 5. Agregar source_system a reservas (si no existe)
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS source_system TEXT DEFAULT 'web';

-- 6. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_metricas_ga4_fecha ON metricas_ga4(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_metricas_sc_fecha ON metricas_search_console(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_metricas_meta_fecha ON metricas_meta(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_leads_checkout_utm ON leads_checkout(utm_source, utm_medium, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_reservas_source ON reservas(source_system);