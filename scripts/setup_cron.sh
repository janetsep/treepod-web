#!/bin/bash
# TreePod Metrics Sync - Setup Cron Job
# Configurar ejecución semanal automática

echo "🔧 Configurando cron job para sync de métricas TreePod..."

# Directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/sync_metricas_semanal.py"

# Verificar que el script existe
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "❌ Error: No se encontró $PYTHON_SCRIPT"
    exit 1
fi

# Hacer el script ejecutable
chmod +x "$PYTHON_SCRIPT"

# Crear entrada de cron
# Ejecutar todos los lunes a las 6:00 AM
CRON_ENTRY="0 6 * * 1 cd $SCRIPT_DIR && python3 sync_metricas_semanal.py >> /tmp/treepod_metrics_sync.log 2>&1"

# Verificar si el cron job ya existe
if crontab -l 2>/dev/null | grep -q "sync_metricas_semanal.py"; then
    echo "ℹ️ Cron job ya existe, actualizando..."
    # Remover entrada existente y agregar nueva
    (crontab -l 2>/dev/null | grep -v "sync_metricas_semanal.py"; echo "$CRON_ENTRY") | crontab -
else
    echo "➕ Agregando nuevo cron job..."
    # Agregar nueva entrada
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

echo "✅ Cron job configurado exitosamente"
echo "📅 Programación: Lunes 6:00 AM (semanal)"
echo "📁 Log: /tmp/treepod_metrics_sync.log"

# Mostrar cron jobs actuales
echo ""
echo "📋 Cron jobs actuales:"
crontab -l 2>/dev/null | grep -E "(sync_metricas|TreePod)" || echo "Ninguno relacionado con TreePod"

echo ""
echo "🔧 Para ejecutar manualmente:"
echo "cd $SCRIPT_DIR && python3 sync_metricas_semanal.py"

echo ""
echo "🗑️ Para remover el cron job:"
echo "crontab -l | grep -v 'sync_metricas_semanal.py' | crontab -"