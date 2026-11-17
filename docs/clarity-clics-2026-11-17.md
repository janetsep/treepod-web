# Revisión de clics fallidos de Clarity — 17 noviembre 2026

Proyecto vbv05w93w9, filtro últimos 5 días + clics fallidos. Se restableció la sesión expirada usando el acceso Google ya autorizado. El listado actualizado mostró 13 sesiones: las 12 originales y una nueva del 17/11 19:36. La revisión cubre las 12 originales por su cronología completa de eventos, con reproducción y captura de la primera; no se vio minuto a minuto cada segundo de vídeo. No se copiaron correos, nombres, click-ids ni conversaciones. Las horas son las mostradas por Clarity.

| Sesión | Evidencia de clic sin respuesta en la cronología | Diagnóstico / acción |
|---|---|---|
| 17/11 10:22, 11 s | 00:01 encabezado parcialmente oculto; 00:07 texto de huéspedes | Etiqueta sin asociación al selector; corregida. Parte del texto está enmascarada: no se afirma conocer el objetivo de todos los toques. |
| 17/11 08:22, 1:11 | 00:29 teléfono; antes 00:16 Reservar abrió disponibilidad | El enlace telefónico es una salida a otra aplicación que Clarity puede marcar sin cambio en la página. No se demostró un fallo de Reservar. |
| 15/11 22:38, 21:55 | 00:23 “Ingreso—”; luego selección de fechas y visita con fechas en URL | Se intentó editar una fila de resumen de solo lectura. Ingreso y salida ahora son controles de fecha. |
| 15/11 21:28, 6:33 | 01:56/57 desayuno, 02:28 leyenda de desayuno, 02:57 texto del pie | Foto/leyenda y prestaciones no tenían enlace. Se enlazan a la consulta ya existente; el pie sigue siendo texto informativo. |
| 15/11 14:46, 51 s | 00:24 texto de Internet/Starlink en Domos | Ficha informativa, sin acción prometida. No se inventa un fallo técnico ni se agrega una acción sin contenido útil. |
| 15/11 09:14, 9 s | 00:03 “Selecciona tus fechas”; varios toques posteriores en títulos/control de huéspedes | El título de fechas ahora enfoca el calendario; etiqueta de huéspedes asociada al control. |
| 15/11 08:14, 15:14 | 00:04 indicador “Paso … Reserva directa” | Indicador de avance informativo; no es un botón ni un fallo bancario. |
| 15/11 08:06, 40 s | 00:13 texto de huéspedes; 00:26 vuelve a tocarlo | Corregida la asociación de etiqueta y selector. |
| 14/11 21:15, 3:37 | 01:10 “Salida”, 01:11 fecha, 01:13 resumen; 02:24/25 desayuno y 02:32 productos | Se habilita edición real de fechas en resumen y enlaces de consulta de servicios. |
| 14/11 00:07, 33 s | 00:23 huéspedes; 00:31 indicador de paso | Etiqueta corregida. El indicador sigue siendo informativo. |
| 13/11 08:28, 1:58 | 00:02 encabezado parcialmente enmascarado | No se pudo identificar con certeza el texto completo. No se transforma una sospecha en un defecto confirmado. |
| 13/11 00:55, 17 s | 00:04 texto de huéspedes | Etiqueta corregida. |

## Correcciones

- Relacionar la etiqueta “¿Cuántos huéspedes?” con su selector. El número de huéspedes en el resumen permite volver al control.
- Convertir Ingreso y Salida del resumen en campos de fecha reales, conservando las mismas variables, calendario, precios y verificaciones del servidor. Al mover ingreso después de salida se borra la salida incompatible; no queda un precio viejo disponible para pagar.
- “Selecciona tus fechas” enfoca el calendario. Mensaje breve y accesible distingue elegir ingreso y elegir salida.
- Unificar mínimo de ingreso de los controles usando la regla existente: desde las 14:00 de Chile se acepta entrada desde mañana. No se cambia la regla del negocio.
- Enlazar fotos, leyendas y prestaciones de servicios a su consulta existente. “Ver opciones de comida”, que dirigía a contacto sin mostrar un menú, pasa a “Consultar desayuno y parrilla”.
- Los clics de servicios dejan de disparar `click_reservar`: usan `click_service_details`. El embudo filtra el clic de reservar por pagePath=/disponibilidad, también en la secuencia de los mismos usuarios, para excluir esos clics de consulta históricos sin reescribir datos de GA4.

No se demostró un fallo de Transbank en estas 12 cronologías. “Clic inactivo” incluye toques en textos y salidas hacia teléfono; no equivale a intento de pago rechazado. La reproducción presentó estilos incompletos en la captura; no se atribuye esa apariencia al sitio que vio el huésped. La identificación se basa en eventos visibles y en el código actual, respetando el enmascaramiento.

## Protección y validación

Sin migraciones ni cambios en reservas, tarifas, pagos o credenciales. Formularios de prueba, APIs de creación y pago, correo, Transbank y analítica externa se interceptan; no se crean reservas ni conversiones de prueba. Validar además todo el flujo de checkout previamente corregido y que los controles de fecha y los enlaces respondan en móvil/escritorio.

## Resultado de la comprobación

GA4 de 1–17 noviembre, consultado en vivo: 8 usuarios / 15 acciones en la unión general de nombres; 2 usuarios / 6 acciones al restringirla al formulario. La secuencia filtrada confirma precio 61 → reservar 2 → Webpay 0 → compra GA4 0. Los conteos generales antiguos mezclaban consultas de servicios y no deben describirse como personas que intentaron pagar. Se preservan los datos originales; cambia la lectura del reporte.

Validación completada: 53 pruebas automatizadas, compilación de producción y TypeScript correctos; lint sin errores (7 advertencias preexistentes del checkout). Diez escenarios de navegador con servicios y pagos interceptados: los siete recorridos de pago anteriores más controles de huéspedes/fechas en móvil y escritorio y enlaces/medición de servicios. Consulta real de lectura GA4 + pagos con la ruta nueva: HTTP 200, secuencia filtrada disponible. Ninguna petición real a Transbank, ninguna reserva ni conversión de prueba.
