# Medición GA4 y Clarity: corrección del 17 de noviembre de 2026

## Configuración vigente y responsables

- Contenedor publicado: `GTM-KFDWNCT`, versión pública 43, inspeccionada directamente en `gtm.js`.
- GA4: `G-B4F27BE1X6`; propiedad `357898604`, `domostreepod.cl - GA4`, verificada en su panel.
- Clarity: proyecto `vbv05w93w9`, `Domos Treepod`, verificado en el panel abierto de Janet y en el código publicado del contenedor.
- GTM etiqueta 42 configura GA4 y genera las vistas de página; etiqueta 63 instala Clarity. La aplicación no vuelve a inicializarlos.

## Problemas corregidos

1. Las variables públicas de GA4 y Clarity tenían un salto de línea al final. Se limpiaron en Vercel para producción. La variable de Clarity se alineó con el proyecto vigente de GTM; la segunda instalación de la aplicación apuntaba al proyecto antiguo `p8c7w8v5x4`.
2. Se retiraron los dos inicializadores redundantes de la aplicación. Interpolar el valor multilínea dentro de una cadena JavaScript producía `Invalid or unexpected token`. No basta con limpiar ese literal: otro `config` con `send_page_view:false` puede suprimir las visitas inicializadas por GTM, como se comprobó en la prueba previa a la publicación.
3. La cola directa de Google usa ahora objetos `Arguments`, el formato del snippet oficial. Los eventos directos especifican el destino GA4 con `send_to`, incluso cuando el contenedor todavía se está cargando.
4. Cada evento tiene un solo responsable de envío a GA4. La aplicación conserva los eventos del `dataLayer` para las integraciones existentes; evita el segundo envío directo cuando ya existe una etiqueta GA4 de GTM.
5. El ID se limpia y valida al recuperar la sesión; el servidor también limpia y valida el identificador antes de un envío. Las compras mantienen sus condiciones actuales de pago confirmado y exclusión de pruebas.

## Reparto de eventos

| Responsable | Eventos |
| --- | --- |
| GTM 77, 83, 84, 85, 86 | `select_fechas`, `view_pricing_result`, `view_disponibilidad`, `click_reservar` y variante sticky, `reservation_created` |
| GTM 87 | Variantes `click_whatsapp*` y `whatsapp_click*` |
| GTM 65 | `availability_checked`, `availability_check_failed`, `pricing_failed`, `reservation_create_failed`, `view_reserva`, `select_payment_method`, `click_pagar`, `payment_started`, `webpay_redirect_started`, `webpay_start_failed`, `cotizacion_ofrecida`, `cotizacion_enviada` |
| GTM 54, 55, 56, 24 | Eventos existentes `select_dome`, `generate_lead`, `begin_checkout`, `purchase`, si se producen; no se dispararon compras durante esta verificación |
| Aplicación → Google tag, una vez | Eventos sin etiqueta GA4 propia en el contenedor, por ejemplo `view_home` |

Si cambia el contenedor, revisar también `GA4_EVENTS_VIA_GTM` en `app/lib/analytics.ts`. No publicar cambios ajenos del workspace: durante la inspección ya había un cambio pendiente que no pertenece a esta corrección. No se modificó ni publicó el contenedor.

`trackEventAndWait` usa el callback de GTM o de Google tag, según el responsable. Conserva además su propio tiempo máximo: un bloqueador o un error de analítica no debe impedir el pago.

## Validación y límites

- `npm test`: 40 pruebas aprobadas, incluyendo formato de cola, un solo responsable, callback y timeout, ID con salto de línea y exclusión de compras de prueba. Los envíos de compra de las pruebas están simulados en memoria; no se envían a Google.
- Revisión de código y compilación Next.js aprobadas.
- Prueba de navegador local con los scripts públicos reales de GTM y Clarity, interceptando los recolectores: sin errores de JavaScript, cuatro vistas para cuatro visitas (incluida navegación interna), `view_home` y `view_disponibilidad` una vez y una sola instalación de Clarity por documento.
- La verificación pública debe comprobar también navegación interna y respuestas reales de los recolectores, además del panel en tiempo real. Una respuesta HTTP acredita recepción del transporte; no demuestra por sí sola la aparición de una compra en informes ni su atribución.
- No se simularon reservas, pagos, leads, clics de WhatsApp ni conversiones. No se modificaron campañas, presupuestos, estados de reservas, datos de clientes ni la sincronización offline. La prueba externa se limita a visitas de comprobación y sus eventos de navegación.
- Queda por contrastar el próximo pago auténtico de Webpay con su reserva confirmada, `transaction_id` e informe de GA4. No se presenta esta corrección como una auditoría de todas las etiquetas o parámetros históricos.

## Documentación de los proveedores

- [Configurar Google tag una sola vez](https://developers.google.com/tag-platform/gtagjs/configure).
- [Medición de vistas y prevención de duplicados](https://developers.google.com/analytics/devguides/collection/ga4/views).
- [Verificar Clarity mediante el panel y las solicitudes collect](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup#verify-your-installation).
