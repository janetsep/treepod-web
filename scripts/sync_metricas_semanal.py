#!/usr/bin/env python3
"""
TreePod Glamping - Sincronización Semanal de Métricas
Sincroniza datos de GA4, Search Console y Meta Ads con Supabase
Ejecutar semanalmente via cron job
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
from supabase import create_client, Client
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric
)
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/sync_metricas.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class MetricsSyncer:
    def __init__(self):
        """Inicializar conexiones a APIs"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.ga4_property_id = os.getenv('GA4_PROPERTY_ID')
        self.meta_access_token = os.getenv('META_ACCESS_TOKEN')
        self.meta_ad_account_id = os.getenv('META_AD_ACCOUNT_ID')

        # Validar variables de entorno
        required_vars = [
            'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
            'GA4_PROPERTY_ID', 'META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID'
        ]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(f"Variables de entorno faltantes: {missing_vars}")

        # Inicializar clientes
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self.ga4_client = BetaAnalyticsDataClient()

        logger.info("🚀 MetricsSyncer inicializado correctamente")

    def get_date_range(self, days_back: int = 7) -> tuple:
        """Obtener rango de fechas para la sincronización"""
        end_date = datetime.now().date() - timedelta(days=1)  # Ayer
        start_date = end_date - timedelta(days=days_back - 1)
        return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

    def sync_ga4_metrics(self):
        """Sincronizar métricas de GA4"""
        logger.info("📊 Sincronizando métricas GA4...")

        start_date, end_date = self.get_date_range()

        request = RunReportRequest(
            property=f"properties/{self.ga4_property_id}",
            date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
            dimensions=[
                Dimension(name="date"),
                Dimension(name="eventName"),
                Dimension(name="firstUserSource"),
                Dimension(name="firstUserMedium"),
                Dimension(name="firstUserCampaignName"),
                Dimension(name="deviceCategory"),
                Dimension(name="country"),
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers"),
                Metric(name="totalRevenue"),
            ]
        )

        try:
            response = self.ga4_client.run_report(request=request)

            metrics_data = []
            for row in response.rows:
                dimensions = [dim.value for dim in row.dimension_values]
                metrics = [metric.value for metric in row.metric_values]

                # Solo eventos TreePod relevantes
                event_name = dimensions[1]
                if event_name in ['select_dome', 'generate_lead', 'begin_checkout', 'purchase']:
                    metrics_data.append({
                        'fecha': dimensions[0].replace('-', '-'),
                        'event_name': event_name,
                        'event_count': int(metrics[0]),
                        'unique_users': int(metrics[1]),
                        'total_revenue': float(metrics[2]),
                        'utm_source': dimensions[2] if dimensions[2] != '(direct)' else None,
                        'utm_medium': dimensions[3] if dimensions[3] != '(none)' else None,
                        'utm_campaign': dimensions[4] if dimensions[4] != '(not set)' else None,
                        'device_category': dimensions[5],
                        'country': dimensions[6],
                    })

            # Upsert a Supabase
            if metrics_data:
                result = self.supabase.table('metricas_ga4').upsert(
                    metrics_data,
                    on_conflict='fecha,event_name,utm_source,utm_medium,utm_campaign,device_category,country'
                ).execute()
                logger.info(f"✅ GA4: {len(metrics_data)} registros sincronizados")
            else:
                logger.info("ℹ️ GA4: No hay datos nuevos para sincronizar")

        except Exception as e:
            logger.error(f"❌ Error sincronizando GA4: {str(e)}")

    def sync_search_console_metrics(self):
        """Sincronizar métricas de Search Console"""
        logger.info("🔍 Sincronizando Search Console...")

        # Implementación simplificada - requiere configuración adicional de credenciales
        logger.info("⚠️ Search Console: Implementación pendiente de credenciales OAuth")

    def sync_meta_ads_metrics(self):
        """Sincronizar métricas de Meta Ads"""
        logger.info("📱 Sincronizando Meta Ads...")

        start_date, end_date = self.get_date_range()

        fields = [
            'campaign_id', 'campaign_name', 'adset_id', 'adset_name',
            'ad_id', 'ad_name', 'objective', 'impressions', 'clicks',
            'ctr', 'cpc', 'spend', 'reach', 'frequency',
            'actions', 'cost_per_action_type'
        ]

        params = {
            'access_token': self.meta_access_token,
            'fields': ','.join(fields),
            'time_range': json.dumps({
                'since': start_date,
                'until': end_date
            }),
            'level': 'ad',
            'limit': 1000
        }

        try:
            url = f"https://graph.facebook.com/v18.0/act_{self.meta_ad_account_id}/insights"
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if 'data' not in data:
                logger.info("ℹ️ Meta Ads: No hay datos disponibles")
                return

            metrics_data = []
            for ad_data in data['data']:
                # Procesar acciones (conversiones)
                actions = ad_data.get('actions', [])
                link_clicks = 0
                results = 0
                result_type = None

                for action in actions:
                    if action['action_type'] == 'link_click':
                        link_clicks = int(action['value'])
                    elif action['action_type'] in ['lead', 'purchase', 'complete_registration']:
                        results = int(action['value'])
                        result_type = action['action_type']

                metrics_data.append({
                    'fecha': end_date,  # Meta Ads agrupa por período
                    'campaign_id': ad_data['campaign_id'],
                    'campaign_name': ad_data['campaign_name'],
                    'adset_id': ad_data['adset_id'],
                    'adset_name': ad_data['adset_name'],
                    'ad_id': ad_data['ad_id'],
                    'ad_name': ad_data['ad_name'],
                    'objective': ad_data.get('objective'),
                    'impressions': int(ad_data.get('impressions', 0)),
                    'clicks': int(ad_data.get('clicks', 0)),
                    'ctr': float(ad_data.get('ctr', 0)),
                    'cpc': float(ad_data.get('cpc', 0)),
                    'spend': float(ad_data.get('spend', 0)),
                    'reach': int(ad_data.get('reach', 0)),
                    'frequency': float(ad_data.get('frequency', 0)),
                    'link_clicks': link_clicks,
                    'results': results,
                    'result_type': result_type,
                })

            # Upsert a Supabase
            if metrics_data:
                result = self.supabase.table('meta_ads_metrics').upsert(
                    metrics_data,
                    on_conflict='fecha,campaign_id,adset_id,ad_id,attribution_setting'
                ).execute()
                logger.info(f"✅ Meta Ads: {len(metrics_data)} registros sincronizados")
            else:
                logger.info("ℹ️ Meta Ads: No hay datos nuevos para sincronizar")

        except Exception as e:
            logger.error(f"❌ Error sincronizando Meta Ads: {str(e)}")

    def sync_all_metrics(self):
        """Ejecutar sincronización completa"""
        logger.info("🔄 Iniciando sincronización semanal de métricas...")

        try:
            self.sync_ga4_metrics()
            self.sync_search_console_metrics()
            self.sync_meta_ads_metrics()

            logger.info("✅ Sincronización completa exitosa")

            # Registrar ejecución
            self.supabase.table('sync_logs').insert({
                'tipo': 'metricas_semanal',
                'estado': 'exitoso',
                'fecha_ejecucion': datetime.now().isoformat(),
                'detalles': 'Sincronización automática semanal completada'
            }).execute()

        except Exception as e:
            logger.error(f"❌ Error en sincronización: {str(e)}")

            # Registrar error
            self.supabase.table('sync_logs').insert({
                'tipo': 'metricas_semanal',
                'estado': 'error',
                'fecha_ejecucion': datetime.now().isoformat(),
                'detalles': str(e)
            }).execute()

            raise

if __name__ == "__main__":
    try:
        syncer = MetricsSyncer()
        syncer.sync_all_metrics()
    except Exception as e:
        logger.error(f"💥 Error crítico: {str(e)}")
        sys.exit(1)