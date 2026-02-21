# ✅ Checklist de Permisos Google Cloud - TreePod

**Service Account:** `treepod-dashboard-readonly@balmy-chain-455318-u3.iam.gserviceaccount.com`  
**Project ID:** `balmy-chain-455318-u3`

---

## 🔐 Permisos Requeridos

### 1. Google Analytics Data API

**¿Qué verificar?**
- [ ] API habilitada en Google Cloud Console
- [ ] Service Account tiene acceso a la propiedad GA4 (Property ID: 357898604)

**Cómo verificar:**
1. Ve a [Google Cloud Console - APIs](https://console.cloud.google.com/apis/dashboard?project=balmy-chain-455318-u3)
2. Busca "Google Analytics Data API"
3. Debe estar "Enabled" (habilitada)

**Cómo dar acceso en GA4:**
1. Ve a [Google Analytics](https://analytics.google.com)
2. Admin → Property Access Management
3. Agregar usuario: `treepod-dashboard-readonly@balmy-chain-455318-u3.iam.gserviceaccount.com`
4. Rol: **Viewer** (solo lectura)

---

### 2. Google Ads API

**¿Qué verificar?**
- [ ] API habilitada en Google Cloud Console
- [ ] Developer Token aprobado: `QCO80kC64IsPA0TNTdDssQ`
- [ ] Service Account vinculado a la cuenta de Google Ads

**Cómo verificar:**
1. Ve a [Google Cloud Console - APIs](https://console.cloud.google.com/apis/dashboard?project=balmy-chain-455318-u3)
2. Busca "Google Ads API"
3. Debe estar "Enabled"

**Cómo vincular Service Account a Google Ads:**
1. Ve a [Google Ads](https://ads.google.com)
2. Tools & Settings → Setup → Access and Security
3. Agregar usuario: `treepod-dashboard-readonly@balmy-chain-455318-u3.iam.gserviceaccount.com`
4. Nivel de acceso: **Read only** (solo lectura)

**Developer Token:**
- Estado actual: Verificar en [Google Ads API Center](https://ads.google.com/aw/apicenter)
- Debe estar "Approved" (aprobado)
- Si está en "Test mode", solo funcionará con cuentas de prueba

---

### 3. Google Tag Manager API

**¿Qué verificar?**
- [ ] Acceso configurado (usa servidor remoto: https://gtm-mcp.stape.ai/mcp)

**Nota:** Este MCP usa un servidor remoto, no requiere configuración adicional de permisos en Google Cloud.

---

### 4. Supabase

**¿Qué verificar?**
- [ ] Access Token válido: `sbp_6575921feb886b5a569f29790c186c5c5353816e`

**Cómo verificar:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → API
3. Verifica que el token sea válido y tenga permisos de lectura

---

## 🧪 Pruebas Post-Configuración

Después de reiniciar Claude Desktop, ejecuta estas pruebas:

### Test 1: Google Analytics
```
Pregunta: "Muéstrame las sesiones de los últimos 7 días desde Google Analytics"
```

**Resultado esperado:** Datos de sesiones, usuarios, etc.

**Si falla:**
- Verifica que GA4 API esté habilitada
- Confirma que el Service Account tenga acceso como Viewer en GA4

---

### Test 2: Google Ads
```
Pregunta: "¿Cuáles son las campañas activas en Google Ads?"
```

**Resultado esperado:** Lista de campañas con métricas

**Si falla:**
- Verifica que Google Ads API esté habilitada
- Confirma que el Service Account esté vinculado a la cuenta de Ads
- Verifica que el Developer Token esté aprobado (no en test mode)

---

### Test 3: Supabase
```
Pregunta: "Lista las tablas disponibles en Supabase"
```

**Resultado esperado:** Lista de tablas de la base de datos

**Si falla:**
- Verifica que el access token sea válido
- Confirma que el token tenga permisos de lectura

---

### Test 4: Google Tag Manager
```
Pregunta: "Muéstrame los contenedores de GTM"
```

**Resultado esperado:** Lista de contenedores GTM

**Si falla:**
- Verifica conexión a internet
- El servidor remoto puede estar temporalmente no disponible

---

## ⚠️ Errores Comunes

### Error: "Permission denied"
**Causa:** Service Account no tiene permisos  
**Solución:** Revisar secciones 1 y 2 arriba

### Error: "API not enabled"
**Causa:** API no habilitada en Google Cloud  
**Solución:** Habilitar en [API Dashboard](https://console.cloud.google.com/apis/dashboard?project=balmy-chain-455318-u3)

### Error: "Invalid credentials"
**Causa:** Archivo google_credentials.json corrupto o inválido  
**Solución:** Descargar nuevamente desde Google Cloud Console → IAM → Service Accounts

### Error: "Developer token not approved"
**Causa:** Token de Google Ads en modo test  
**Solución:** Solicitar aprobación en Google Ads API Center (puede tomar 24-48h)

---

## 📋 Checklist Final

Antes de reiniciar Claude Desktop, verifica:

- [x] ✅ Google Ads MCP instalado (`pipx list` muestra google-ads-mcp)
- [x] ✅ Archivo mcp_config.json actualizado
- [x] ✅ Credenciales google_credentials.json existen
- [ ] ⚠️ Google Analytics Data API habilitada
- [ ] ⚠️ Service Account tiene acceso a GA4
- [ ] ⚠️ Google Ads API habilitada
- [ ] ⚠️ Service Account vinculado a Google Ads
- [ ] ⚠️ Developer Token aprobado

**Items con ⚠️ requieren verificación manual en Google Cloud Console**

---

## 🚀 Próximo Paso

**REINICIAR CLAUDE DESKTOP**

1. Cierra completamente la aplicación
2. Vuelve a abrir
3. Ejecuta los tests arriba
4. Si todo funciona, pregunta: **"¿Cuáles son las campañas que están funcionando?"**

---

**Última actualización:** 2026-02-02
