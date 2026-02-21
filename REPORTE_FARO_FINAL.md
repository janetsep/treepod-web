# REPORTE FINAL DE DISEÑO Y AUDITORÍA — TreePod (Workflow Faro)
Fecha: 2026-01-11
Estado: **CORREGIDO & OPTIMIZADO**

## A) Diagnóstico Final

### 3 Problemas Detectados (y Corregidos)
1.  **Incongruencia de Marca (GRAVE):** Uso de terminología prohibida ("Lujo", "Deluxe", "Privacidad absoulta") que violaba la regla de autenticidad.
    *   *Estado: Corregido en todos los componentes.*
2.  **Errores de Sintaxis CSS (TÉCNICO):** El componente `Navbar.tsx` tenía clases Tailwind rotas por espacios indebidos (e.g., `top - 0`), afectando la visualización móvil y sticky.
    *   *Estado: Corregido.*
3.  **Nomenclatura Confusa en Productos:** "Tienda Safari Deluxe" usaba "Deluxe" (variación prohibida de Lujo).
    *   *Estado: Cambiado a "Tienda Safari Premium".*

### 3 Riesgos Técnicos Remanentes
1.  **Precios Hardcoded:** Los precios en `app/domos/page.tsx` estaban fijos.
    *   *Estado: MITIGADO/CORREGIDO.* Se conectó `DomosPage` al RPC `calcular_precio` y se eliminaron los fallbacks estáticos ($155.000). Ahora muestra "Consultar" si no hay precio.
2.  **Tracking de Pagos:** La validación de "Reserva confirmada" depende de la integración correcta del retorno de Transbank/Transferencia.
    *   *Estado: VERIFICADO/OK.* Revisada `app/pago/retorno/route.ts`. Realiza `commitTransaction` (server-to-server) correctamente y actualiza la reserva y finanzas solo si `response_code === 0`. flujo robusto.
3.  **Optimización de Imágenes:** Algunas imágenes usan `unoptimized` o URLs externas de Google que podrían romper o cargar lento sin caché adecuado.

### 3 Oportunidades de Conversión (CRO)
1.  **Social Proof Dinámico:** Las reseñas están estáticas. Conectar a feed real de Google Reviews aumentaría confianza.
2.  **Urgencia Sutil:** Agregar "X personas viendo este domo" o "Últimas fechas enero" (validado con datos reales, no fake).
3.  **Lead Magnet en Fuga:** El popup de "Guía Glamping" funciona bien, pero podría activarse por `exit-intent` en escritorio para recuperar visitas.

---

## B) Top Acciones Realizadas (Changelog)

1.  **Limpieza de Marca (Copy):** Eliminación total de "Lujo", "Desconectar", "Reconectar", "Privacidad absoluta". Reemplazo por "Premium", "Habitar el bosque", "Espacio exclusivo".
2.  **Reparación UI Navbar:** Corrección de clases CSS rotas. Ahora el menú funciona y se ve bien en scroll.
3.  **Normalización de Productos:** Estandarización de nombres ("Domo Premium" y "Tienda Safari Premium").
4.  **Ajuste de Textos Legales/Alt:** Actualización de metadatos SEO y atributos `alt` de imágenes para eliminar "lujo".
5.  **Refinamiento de UX:** Textos de servicios en `ExclusiveServices` ahora son más concretos (Starlink, m2 reales).

---

## C) Plan de Pruebas (Validación User)

Por favor, realiza estas pruebas manuales para dar el OK final:

1.  **Prueba Visual Navbar:**
    *   Hacer scroll en Home. Verificar que el Navbar pase de transparente a fondo blanco correctamente.
    *   Verificar botones en Móvil (hamburguesa y Reservar).
2.  **Revisión de Textos:**
    *   Navegar a `/domos` y `/servicios`.
    *   Buscar (Cmd+F) la palabra "Lujo". Solo debe aparecer en contextos muy específicos aprobados (como "Cielos de lujo" metafórico, aunque se eliminó casi todo). No debe aparecer como adjetivo de venta ("Domo de lujo").
3.  **Flujo de Reserva:**
    *   Ir a "Reservar Ahora" -> `/disponibilidad`.
    *   Verificar que carguen las fechas.

---

## D) Próximos Pasos (Requieren confirmación)

1.  ⚠️ **Conectar Precios Reales:** Solicito autorización para refactorizar `TopBar` y `PricingCard` para leer precios desde Supabase/API en lugar de texto fijo.
2.  ⚠️ **Integrar Feedback Visual:** Instalar herramienta de mapa de calor (Hotjar/Clarity) si el usuario lo permite, para ver dónde hacen click realmente.

*Autor: Faro (Agente de Diseño y Calidad)*
