import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // 'ga4', 'search_console', 'meta_ads'
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const limite = parseInt(searchParams.get('limite') || '100');

    // Validaciones
    if (!tipo || !['ga4', 'search_console', 'meta_ads'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de métrica inválido. Use: ga4, search_console, meta_ads' },
        { status: 400 }
      );
    }

    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date();

    let query;
    let tableName;

    // Configurar consulta según tipo de métrica
    switch (tipo) {
      case 'ga4':
        tableName = 'metricas_ga4';
        query = supabaseAdmin
          .from(tableName)
          .select(`
            fecha,
            event_name,
            event_count,
            unique_users,
            total_revenue,
            utm_source,
            utm_medium,
            utm_campaign,
            device_category,
            country
          `)
          .gte('fecha', fechaInicioDate.toISOString().split('T')[0])
          .lte('fecha', fechaFinDate.toISOString().split('T')[0])
          .order('fecha', { ascending: false })
          .limit(limite);
        break;

      case 'search_console':
        tableName = 'search_console_metrics';
        query = supabaseAdmin
          .from(tableName)
          .select(`
            fecha,
            query_text,
            page_url,
            country,
            device,
            clicks,
            impressions,
            ctr,
            position
          `)
          .gte('fecha', fechaInicioDate.toISOString().split('T')[0])
          .lte('fecha', fechaFinDate.toISOString().split('T')[0])
          .order('clicks', { ascending: false })
          .limit(limite);
        break;

      case 'meta_ads':
        tableName = 'meta_ads_metrics';
        query = supabaseAdmin
          .from(tableName)
          .select(`
            fecha,
            campaign_name,
            adset_name,
            ad_name,
            objective,
            impressions,
            clicks,
            ctr,
            spend,
            results,
            result_type,
            cost_per_result
          `)
          .gte('fecha', fechaInicioDate.toISOString().split('T')[0])
          .lte('fecha', fechaFinDate.toISOString().split('T')[0])
          .order('spend', { ascending: false })
          .limit(limite);
        break;
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Tipo de consulta no válido' },
        { status: 400 }
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error consultando ${tipo}:`, error);
      return NextResponse.json(
        { error: `Error consultando métricas ${tipo}` },
        { status: 500 }
      );
    }

    // Agregar estadísticas de resumen
    let resumen = {};
    if (tipo === 'ga4' && data?.length > 0) {
      const gaData = data as any[];
      resumen = {
        total_eventos: gaData.reduce((sum, row) => sum + (row.event_count || 0), 0),
        total_usuarios: gaData.reduce((sum, row) => sum + (row.unique_users || 0), 0),
        total_revenue: gaData.reduce((sum, row) => sum + (parseFloat(row.total_revenue) || 0), 0),
        eventos_unicos: [...new Set(gaData.map(row => row.event_name))].length
      };
    } else if (tipo === 'search_console' && data?.length > 0) {
      const scData = data as any[];
      resumen = {
        total_clicks: scData.reduce((sum, row) => sum + (row.clicks || 0), 0),
        total_impressions: scData.reduce((sum, row) => sum + (row.impressions || 0), 0),
        ctr_promedio: scData.reduce((sum, row) => sum + (row.ctr || 0), 0) / scData.length,
        posicion_promedio: scData.reduce((sum, row) => sum + (row.position || 0), 0) / scData.length
      };
    } else if (tipo === 'meta_ads' && data?.length > 0) {
      const metaData = data as any[];
      resumen = {
        total_spend: metaData.reduce((sum, row) => sum + (parseFloat(row.spend) || 0), 0),
        total_impressions: metaData.reduce((sum, row) => sum + (row.impressions || 0), 0),
        total_clicks: metaData.reduce((sum, row) => sum + (row.clicks || 0), 0),
        total_results: metaData.reduce((sum, row) => sum + (row.results || 0), 0)
      };
    }

    return NextResponse.json({
      tipo,
      fecha_inicio: fechaInicioDate.toISOString().split('T')[0],
      fecha_fin: fechaFinDate.toISOString().split('T')[0],
      total_registros: data?.length || 0,
      resumen,
      datos: data || []
    });

  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    console.error('Error en API métricas:', message);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}