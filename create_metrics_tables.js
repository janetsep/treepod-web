#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iwcejrbiaflbebggvlrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y2VqcmJpYWZsYmViZ2d2bHJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU1Njg3NCwiZXhwIjoyMDgxMTMyODc0fQ.iWQ9BYOpIXJMzSZwxtewfuyuQHlAST1idVh9w-mWa0U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeQuery(queryName, query) {
  try {
    console.log(`⏳ Ejecutando: ${queryName}...`);

    // Using fetch to execute raw SQL through PostgREST
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ query })
    });

    if (response.ok) {
      console.log(`✅ ${queryName}`);
      return { success: true };
    } else {
      const error = await response.text();
      console.log(`❌ ${queryName}: ${error}`);
      return { success: false, error };
    }
  } catch (error) {
    console.log(`❌ ${queryName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function createMetricsTables() {
  console.log('🚀 Creando tablas de métricas en Supabase...\n');

  // 1. Create metricas_ga4 table
  await executeQuery('metricas_ga4', `
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
  `);

  // 2. Create metricas_search_console table
  await executeQuery('metricas_search_console', `
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
  `);

  // 3. Create metricas_meta table
  await executeQuery('metricas_meta', `
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
  `);

  // 4. Add UTM columns to leads_checkout
  await executeQuery('UTM columns to leads_checkout', `
    ALTER TABLE leads_checkout
      ADD COLUMN IF NOT EXISTS utm_source TEXT,
      ADD COLUMN IF NOT EXISTS utm_medium TEXT,
      ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
  `);

  // 5. Add source_system to reservas
  await executeQuery('source_system to reservas', `
    ALTER TABLE reservas
      ADD COLUMN IF NOT EXISTS source_system TEXT DEFAULT 'web';
  `);

  // Alternative approach: Try direct table creation using Supabase client
  console.log('\n🔄 Intentando método alternativo...');

  const queries = [
    {
      name: 'metricas_ga4',
      sql: 'CREATE TABLE IF NOT EXISTS metricas_ga4 (id SERIAL PRIMARY KEY, fecha_inicio DATE NOT NULL, fecha_fin DATE NOT NULL, canal TEXT, sesiones INTEGER, usuarios INTEGER, nuevos_usuarios INTEGER, tasa_rebote DECIMAL, duracion_promedio DECIMAL, conversiones INTEGER, created_at TIMESTAMP DEFAULT NOW());'
    },
    {
      name: 'metricas_search_console',
      sql: 'CREATE TABLE IF NOT EXISTS metricas_search_console (id SERIAL PRIMARY KEY, fecha_inicio DATE NOT NULL, fecha_fin DATE NOT NULL, keyword TEXT, clics INTEGER, impresiones INTEGER, ctr DECIMAL, posicion_promedio DECIMAL, created_at TIMESTAMP DEFAULT NOW());'
    },
    {
      name: 'metricas_meta',
      sql: 'CREATE TABLE IF NOT EXISTS metricas_meta (id SERIAL PRIMARY KEY, fecha_inicio DATE NOT NULL, fecha_fin DATE NOT NULL, campaign_name TEXT, alcance INTEGER, impresiones INTEGER, clics INTEGER, ctr DECIMAL, gasto DECIMAL, acciones INTEGER, cpc DECIMAL, created_at TIMESTAMP DEFAULT NOW());'
    }
  ];

  for (const query of queries) {
    try {
      // Try to insert a dummy record to force table creation
      const { data, error } = await supabase
        .from(query.name)
        .select('id')
        .limit(1);

      if (!error) {
        console.log(`✅ ${query.name} (ya existe)`);
      } else {
        console.log(`❌ ${query.name}: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${query.name}: ${err.message}`);
    }
  }

  // 6. Verify final state
  console.log('\n🔍 Verificación final...');

  const tablesToCheck = ['metricas_ga4', 'metricas_search_console', 'metricas_meta'];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!error) {
        console.log(`✅ ${tableName}`);
      } else {
        console.log(`❌ ${tableName}`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}`);
    }
  }
}

createMetricsTables()
  .then(() => {
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  });