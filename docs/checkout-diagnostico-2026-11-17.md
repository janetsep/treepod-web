# Checkout: diagnóstico y corrección del 17 de noviembre de 2026

## Qué se pudo comprobar

El informe de GA4 del 18 de octubre al 16 de noviembre registra 14 usuarios únicos entre los dos botones de reserva y 9 eventos `reservation_create_failed` en 3 usuarios. La base no registra nuevas reservas web ni intentos Webpay en ese intervalo. Esos datos no revelan la causa individual de los 14 casos: el evento histórico también incluye validaciones de correo y fechas; los logs de servidor de ese período ya no están disponibles con la retención actual. No se atribuye el abandono completo a Transbank ni al precio.

Se reprodujeron dos problemas con los endpoints y el banco sustituidos por respuestas simuladas:

1. **Precio y formulario que desaparecen al cambiar las fechas.** La selección actualiza la URL con `history.replaceState`. Next.js vuelve a notificar los parámetros y el efecto de sincronización invalidaba la petición que acababa de solicitar el precio. Con la respuesta pendiente, el formulario desaparecía y podía no volver a mostrarse. Ahora el efecto ignora la sincronización si la URL ya refleja la selección actual; los cambios externos de parámetros siguen actualizando el calendario e invalidando precios viejos.
2. **Botón fijo que no guiaba hasta el correo.** Sin correo, no se crea una reserva ni se inicia Webpay, pero el campo no recibía el foco. Ahora la barra indica `Ingresar correo`, enfoca el campo y muestra su error accesible. Con correo válido indica `Ir a Webpay`. Se permite enviar con Enter y con cualquiera de los botones mediante el mismo formulario.

El flujo válido, con correo y precio, sí alcanzó el POST de Webpay en la simulación. No se abrió una transacción bancaria real para esta prueba.

## Protecciones y medición

- Bloqueo síncrono de envíos simultáneos: dos acciones no crean dos retenciones mientras la primera está en curso.
- Un error al consultar ocupación o bloqueos detiene la creación con 503, antes de insertar; no se interpreta como fechas libres.
- Los errores de respuesta HTML se presentan como un mensaje recuperable, conservando fechas, precio y correo.
- El respaldo para un fallo de pago conserva el ID de reserva existente. Los pagos que requieren revisión mantienen su pantalla de revisión.
- Se separa `webpay_token_created` de `webpay_redirect_started`, que antes se emitía dos veces en el recorrido normal.
- Diagnósticos nuevos sin correo, nombre ni teléfono: `checkout_email_missing`, `checkout_email_invalid`, `checkout_dates_unavailable`, `checkout_reservation_failed` y `checkout_webpay_failed`. Se conserva la medición histórica y no deben sumarse ambos juegos como personas diferentes. Los nombres permiten distinguir las causas en GA4 sin depender de parámetros personalizados no registrados; los fallos de API incorporan etapa y estado HTTP.

## Verificación

- 44 pruebas de unidad/seguridad aprobadas; las cuatro nuevas ejecutan el handler real con sustitutos en memoria. Cubren correo como único dato personal, compatibilidad con las columnas actuales, total validado en servidor, protección de reservas pagadas y retenciones, y consultas de disponibilidad fallidas sin inserciones.
- Compilación de producción aprobada.
- Siete escenarios de navegador aprobados: correo vacío e inválido con foco; Enter hacia Webpay interceptado; cambio de fechas sin perder precio/correo; doble envío en escritorio con analítica bloqueada; errores JSON y HTML con reintento; error de pago con respaldo al mismo ID; y revisión de pago sin nuevo cobro.
- La prueba de navegador intercepta todas las API y el POST a Transbank. No puede crear reservas, leads, pagos o conversiones externos. La verificación posterior a publicar debe utilizar esas mismas intercepciones.
- La revisión estática de los archivos de cliente no presenta errores. El endpoint de creación conserva 15 errores de lint preexistentes por el tipo `any`; no se introducen nuevos. Su compilación y pruebas de comportamiento sí pasan.

No se modifica el esquema ni datos de producción, tarifas, importes, credenciales bancarias, campañas o sincronización offline. La confirmación de un pago real continúa dependiendo de la validación del servidor y del registro de la reserva.
