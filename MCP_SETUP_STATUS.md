# 🔧 Estado de Configuración MCP - TreePod

**Fecha:** 2026-02-02  
**Estado:** ✅ Configuración completada - Requiere reinicio

---

## ✅ Completado

### 1. Instalación de Paquetes
- ✅ **Google Ads MCP** instalado vía pipx (v0.0.1)
- ✅ **Supabase MCP** configurado
- ✅ **Google Analytics MCP** configurado
- ✅ **Google Tag Manager MCP** configurado

### 2. Archivo de Configuración
- ✅ Ubicación: `/Users/janetsepulvedacorrea/.gemini/antigravity/mcp_config.json`
- ✅ Actualizado para usar `google-ads-mcp` instalado (no git clone)
- ✅ Credenciales configuradas: `/Users/janetsepulvedacorrea/treepod-web/google_credentials.json`

### 3. Credenciales Google Cloud
- ✅ Service Account: `treepod-dashboard-readonly@balmy-chain-455318-u3.iam.gserviceaccount.com`
- ✅ Project ID: `balmy-chain-455318-u3`
- ✅ Google Ads Developer Token: `QCO80kC64IsPA0TNTdDssQ`
- ✅ Google Analytics Property ID: `357898604`

---

## 🔄 ACCIÓN REQUERIDA: Reiniciar Antigravity

Para que los MCPs se carguen, **DEBES hacer UNO de estos pasos**:

### Opción 1: Reiniciar Claude Desktop (RECOMENDADO)
1. Cerrar completamente Claude Desktop
2. Volver a abrir Claude Desktop
3. Los MCPs se cargarán automáticamente

### Opción 2: Reiniciar solo Antigravity
1. Si hay un comando de reinicio en Antigravity, úsalo
2. Esto recargará la configuración MCP

---

## 🧪 Verificación Post-Reinicio

Después de reiniciar, prueba estos comandos para verificar que los MCPs funcionan:

### Test 1: Listar recursos disponibles
```
Pregunta: "Lista los recursos disponibles de google-ads-oficial"
```

### Test 2: Consultar campañas
```
Pregunta: "¿Cuáles son las campañas activas en Google Ads?"
```

### Test 3: Verificar Google Analytics
```
Pregunta: "Muéstrame las métricas de tráfico de los últimos 7 días"
```

---

## 📋 Configuración de MCPs

### Supabase MCP
```json
{
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "sbp_..."],
  "env": {}
}
```

### Google Analytics MCP
```json
{
  "command": "npx",
  "args": ["-y", "@toolsdk.ai/google-analytics-mcp"],
  "env": {
    "GOOGLE_ANALYTICS_PROPERTY_ID": "357898604",
    "GOOGLE_APPLICATION_CREDENTIALS": "/Users/janetsepulvedacorrea/treepod-web/google_credentials.json"
  }
}
```

### Google Ads MCP
```json
{
  "command": "google-ads-mcp",
  "args": [],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "/Users/janetsepulvedacorrea/treepod-web/google_credentials.json",
    "GOOGLE_PROJECT_ID": "balmy-chain-455318-u3",
    "GOOGLE_ADS_DEVELOPER_TOKEN": "QCO80kC64IsPA0TNTdDssQ"
  }
}
```

### Google Tag Manager MCP
```json
{
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://gtm-mcp.stape.ai/mcp"]
}
```

---

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: "Server not found" después de reiniciar
**Causa:** Las APIs de Google Cloud no están habilitadas  
**Solución:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona proyecto: `balmy-chain-455318-u3`
3. Habilita estas APIs:
   - Google Analytics Data API
   - Google Ads API
   - Google Tag Manager API

### Problema 2: "Permission denied"
**Causa:** El Service Account no tiene permisos  
**Solución:**
1. En Google Analytics: Agregar `treepod-dashboard-readonly@...` como Viewer
2. En Google Ads: Vincular la cuenta de servicio con acceso de lectura
3. En GTM: Dar permisos de lectura al Service Account

### Problema 3: MCPs lentos o timeout
**Causa:** Conexión a internet o APIs sobrecargadas  
**Solución:**
- Verificar conexión a internet
- Reintentar después de unos minutos
- Verificar límites de cuota en Google Cloud Console

---

## 🎯 Próximos Pasos (después de reiniciar)

1. **Verificar que los MCPs funcionen** con los tests arriba
2. **Consultar campañas de Google Ads** para responder la pregunta original
3. **Analizar rendimiento** según criterios TreePod:
   - Conversiones = `purchase` (pago verificado)
   - ROAS > 1
   - Keywords con intención correcta
   - Sin palabras prohibidas

---

## 📞 Soporte

Si después de reiniciar los MCPs siguen sin funcionar:
1. Revisa los logs de Antigravity/Claude Desktop
2. Verifica que las APIs estén habilitadas en Google Cloud
3. Confirma que el Service Account tenga los permisos correctos
4. Prueba ejecutar manualmente: `google-ads-mcp` en terminal

---

**Estado actual:** ✅ Todo configurado - Solo falta reiniciar
