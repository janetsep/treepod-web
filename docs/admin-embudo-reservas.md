# Embudo de reservas en el administrador

Acceso: `/admin/embudo`, botón “Embudo de reservas” en el administrador y panel en Estadísticas. Requiere la sesión autorizada existente. API de lectura: `/api/admin/embudo?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`.

## Datos y definiciones

- Periodo predeterminado: mes actual hasta hoy. Fechas inclusivas, máximo 93 días, zona America/Santiago. El rango interno de pagos usa límites UTC calculados desde los días de Chile, incluidos cambios de horario.
- Personas: `totalUsers` por evento en GA4, aproximación de usuarios medidos; no identificación de personas físicas. Consultas de fechas: `availability_checked`; precio: `view_pricing_result`; salida hacia Webpay: `webpay_redirect_started`. Este último prueba un intento de envío desde el sitio, no la carga del sitio externo de Transbank. No existe señal de carga externa verificable desde TreePod.
- Reservar: GA4 calcula la unión de usuarios de `click_reservar` y `click_reservar_sticky`, sin sumar personas que usan ambos. Las acciones se muestran aparte de los usuarios.
- Abandono: `runFunnelReport` cerrado, precio → cualquiera de los botones Reservar → salida Webpay → purchase de GA4. Solo se restan usuarios dentro de esta secuencia, nunca entre conteos independientes. Disponibilidad y precio se consultan en paralelo; forzar un orden entre sus respuestas crea abandonos artificiales. La secuencia no se limita a una sesión ni se vincula individualmente con pagos internos. Que una persona no avance en GA4 no prueba que perdimos una venta ni que ocurrió un fallo técnico.
- Pagos: registros de `webpay_intentos` con estado `registrado`, reserva `pagado`, monto positivo respaldado por `monto_pagado`. Excluye eliminadas, pruebas explícitas y operaciones de hasta $500. Cuenta reservas únicas y distingue abono cobrado del valor de la reserva. No cuenta manuales o Airbnb como Webpay.
- Fecha de pago en este reporte: `updated_at` del intento confirmado; es la evidencia interna disponible y no una nueva consulta bancaria. Estado de la reserva actual. “De los iniciados, pagados” es la cohorte de intentos creados en el rango, aunque su confirmación sea posterior; “pagaron en el periodo” usa fecha interna de confirmación, aunque iniciaron antes. Las categorías de intentos sin pago pueden coincidir si hubo reintentos.
- Una lectura fallida de GA4 o de pagos se muestra como “sin datos”; la otra fuente sigue visible. No se convierte una falla de lectura en cero. Si falla el informe secuencial, se conservan las etapas independientes sin calcular abandono. API privada `no-store`, consultas paralelas y paginación de pagos para no truncar a 1000 filas.

## Bloqueos

Desde el ajuste del 17-11-2026: correo faltante/inválido, fechas no disponibles al reservar, error de creación y error de Webpay. Disponibilidad/precio tienen eventos de fallo anteriores. El evento histórico `reservation_create_failed` mezcla validaciones y errores; se muestra aparte sin sumarlo a los nuevos. Los bloqueos no pueden asignarse retrospectivamente a los clics históricos. GA4 tiene demora de procesamiento; hoy y los nuevos diagnósticos son provisionales. No se importan ni fabrican datos históricos.

Clarity “clics erróneos” significa clics inmediatamente anteriores a errores JavaScript. No equivale a correo inválido ni a pago rechazado. Este panel no descarga grabaciones de Clarity ni inventa sus resultados.

## Configuración y seguridad

Reutiliza GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY de producción y la propiedad 357898604, únicamente con alcance analytics.readonly. Reutiliza cliente servidor y autorización de administración existentes para pagos. No necesita Supermetrics, nuevas credenciales, tablas ni migraciones. Ningún dato de huésped, token de pago o credencial se devuelve al cliente. No modifica reservas, intenta pagos, inicia sesiones bancarias, envía conversiones ni activa sincronizadores.

## Verificación

Pruebas de periodos/DST, validaciones, unión de usuarios, secuencia y pasos vacíos, pagos repetidos/pruebas/eliminadas/cohortes, autorización, fallos parciales y paginación. Consultas de GA4 y pagos reales exclusivamente de lectura. Navegador en móvil/escritorio con autenticación y respuestas interceptadas para no crear registros ni visitas analíticas de prueba; comprobación independiente de bloqueo sin sesión.

Fuentes técnicas: https://developers.google.com/analytics/devguides/reporting/data/v1/funnels y https://learn.microsoft.com/en-us/clarity/heatmaps/click-maps . La API de embudos de Google es v1alpha; sus fallos se aíslan del resto del reporte.
