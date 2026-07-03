-- ============================================================
-- Migración: SICRA gastos reales + checklist operativo
-- Aplicar en: Supabase Dashboard > SQL Editor
-- Fecha: 12 Junio 2026
-- ============================================================

-- 1. SICRA_GASTOS: registro de gastos reales (boletas, compras)
CREATE TABLE IF NOT EXISTS sicra_gastos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria       TEXT NOT NULL CHECK (categoria IN ('supermercado','insumos','combustible','aseo','tinaja','otros')),
  monto           INTEGER NOT NULL CHECK (monto > 0),
  descripcion     TEXT,
  reserva_id      UUID REFERENCES reservas(id) ON DELETE SET NULL,
  periodo_inicio  DATE,
  periodo_fin     DATE,
  registrado_por  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sicra_gastos_fecha ON sicra_gastos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_sicra_gastos_periodo ON sicra_gastos(periodo_inicio, periodo_fin);

-- 2. SICRA_CHECKLIST: tareas operativas del día
CREATE TABLE IF NOT EXISTS sicra_checklist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo            TEXT NOT NULL CHECK (tipo IN ('limpieza','cobro','preparacion','compra','otro')),
  descripcion     TEXT NOT NULL,
  reserva_id      UUID REFERENCES reservas(id) ON DELETE SET NULL,
  domo_id         UUID REFERENCES domos(id) ON DELETE SET NULL,
  completado      BOOLEAN DEFAULT FALSE,
  completado_por  TEXT,
  completado_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sicra_checklist_fecha ON sicra_checklist(fecha);

-- 3. RLS (service_role ya tiene acceso; habilitar RLS por seguridad)
ALTER TABLE sicra_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sicra_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access gastos" ON sicra_gastos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access checklist" ON sicra_checklist
  FOR ALL USING (true) WITH CHECK (true);
