-- ============================================================
-- Migración: Proyectos de inversión + gastos por concepto
-- Aplicar en: Supabase Dashboard > SQL Editor
-- Fecha: 12 Junio 2026
-- ============================================================

-- 1. SICRA_PROYECTOS: cada proyecto (quincho, arreglos eléctricos, etc.)
CREATE TABLE IF NOT EXISTS sicra_proyectos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  presupuesto     INTEGER DEFAULT 0,
  estado          TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','pausado','completado')),
  fecha_inicio    DATE DEFAULT CURRENT_DATE,
  fecha_fin       DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SICRA_PROYECTO_GASTOS: cada boleta/pago dentro de un proyecto
CREATE TABLE IF NOT EXISTS sicra_proyecto_gastos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id     UUID NOT NULL REFERENCES sicra_proyectos(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  concepto        TEXT NOT NULL,
  monto           INTEGER NOT NULL CHECK (monto > 0),
  proveedor       TEXT,
  numero_documento TEXT,
  tipo            TEXT NOT NULL DEFAULT 'material' CHECK (tipo IN ('material','mano_obra','transporte','permiso','otro')),
  nota            TEXT,
  registrado_por  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sicra_proy_gastos_proyecto ON sicra_proyecto_gastos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_sicra_proy_gastos_concepto ON sicra_proyecto_gastos(concepto);

-- 3. RLS
ALTER TABLE sicra_proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sicra_proyecto_gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access proyectos" ON sicra_proyectos
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access proyecto_gastos" ON sicra_proyecto_gastos
  FOR ALL USING (true) WITH CHECK (true);
