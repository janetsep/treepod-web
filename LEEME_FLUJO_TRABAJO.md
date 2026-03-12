# 🚀 FLUJO DE TRABAJO - TREEPOD WEB (V1)

Este documento es la guía definitiva para mantener y actualizar el sitio domostreepod.cl sin errores.

## 1. La Fuente de la Verdad
La única versión válida para trabajar es la carpeta local:
`/Users/janetsepulvedacorrea/OpenClaw/treepod-web`

**¡NUNCA trabajar sobre archivos sueltos en el Administrador de Archivos de Hostinger!**

## 2. Pasos para realizar un cambio:

### A) Desarrollo (Local)
1. Abrir este proyecto.
2. Realizar cambios en el código.
3. Probar con `npm run dev` en `http://localhost:3000`.

### B) Preparación (Packaging)
1. Generar un archivo `.zip` que incluya:
   - Carpetas: `app`, `public`, `components`, `lib`, `services`.
   - Archivos: `package.json`, `next.config.ts`, `tsconfig.json`.
   - **NO incluir**: `node_modules` ni `.next` (para ahorrar peso).

### C) Despliegue (Hostinger)
1. Entrar al panel de Hostinger de domostreepod.cl.
2. Ir a **Ajustes y reimplementación**.
3. Subir el nuevo archivo `.zip`.
4. Verificar que las **Variables de Entorno** (Transbank, GA4, Supabase) sigan ahí.
5. Clic en **Guardar y reimplementar**.

---

## 🔒 Respaldos Críticos
- Cada versión exitosa debe respaldarse localmente como: `TreePod_V1.x_FECHA.zip`.

*Autor: Antigravity AI (Lead Dev TreePod)*
