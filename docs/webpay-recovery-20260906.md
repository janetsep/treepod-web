# Recuperación segura Webpay — 6 de septiembre de 2026 (UTC)

## Alcance

- Intentos vinculados internamente a una reserva, orden, sesión y monto. La URL de retorno ya no decide qué reserva se acredita.
- Creación compare-and-set: dos solicitudes simultáneas no entregan dos tokens vinculados. Un intento todavía inicializado se reutiliza; una respuesta incierta no permite iniciar otro cobro.
- Confirmación exige `AUTHORIZED`, código cero, orden/sesión/monto coincidentes. Una diferencia queda en revisión.
- Reserva, ingreso y marca de confirmación se guardan en una transacción. Si falla el ingreso o la ocupación se superpone, se revierte el cambio parcial y se conserva la respuesta mínima para revisión.
- La recuperación consulta el estado antes de confirmar. Ante error del PUT se consulta GET, sin repetir el PUT en esa ejecución.
- `/pago-en-revision` evita el mensaje engañoso de éxito y no ofrece volver a pagar.
- `/admin/calidad`: lista de hasta 100 intentos pendientes o en revisión. Consultar Transbank requiere administrador verificado y es GET en el proveedor; solo un resultado aprobado y coherente registra el pago. No crea cobros, devoluciones, correos, eventos de calendario ni conversiones externas.
- Tabla y funciones nuevas restringidas a `service_role`. Sin tarjetas, conversaciones ni datos personales en el recibo persistido. Se retiró la respuesta de depuración que mostraba otras reservas y los logs de tokens/credenciales del inicio y retorno de pago.

## Compatibilidad y límites

- No se reclasifican ni concilian datos históricos. Migración aditiva, sin actualizar reservas existentes.
- Transacciones anteriores pueden recuperarse en el retorno solo si su token sigue guardado y la orden/sesión corresponde. Un token antiguo sobrescrito no se adivina ni se acredita por ID de URL.
- La bandeja comienza con esta entrega; no inventaría todos los intentos anteriores.
- Transbank documenta consulta de estado hasta siete días desde la creación. Casos más antiguos, reversas, conflictos de disponibilidad, diferencias y fallos persistentes requieren comprobación en el portal del comercio. No pedir otro pago sin confirmar el anterior.
- El retorno normal conserva las notificaciones/medición existentes, solo tras el primer guardado duradero. La recuperación administrativa no las envía: el administrador debe revisar si falta avisar al huésped. No hay garantía de entrega de notificaciones si el proceso termina después de registrar el pago; una cola de notificaciones es trabajo posterior.
- No se implementa sincronizador de conversiones offline, importación histórica a GA4 ni nuevos envíos publicitarios.
- La prevención cubre reintentos de la misma reserva. Reservas independientes del mismo huésped, creadas en dispositivos distintos, requieren una política adicional de detección y revisión; no se cancelan automáticamente.

## Validación

- 18 pruebas Node: permisos/regresiones previas, condiciones de aprobación, sanitización, timeout/GET sin segundo PUT, retorno duplicado sin notificaciones, error de persistencia sin éxito y token no vinculado sin exposición.
- PostgreSQL 17 aislado, sin red ni datos productivos: pago único, duplicados, orden/monto/estado ausentes o erróneos, fecha de pago en Chile, fallo de libro con rollback y recibo conservado, recuperación posterior, superposición, token desconocido, legado, reversa sin alterar dinero y permisos.
- Dos procesos concurrentes: una sola confirmación/ingreso y una sola creación vinculada por reserva.
- TypeScript y compilación Vercel de producción correctos.
- No se ejecutó un pago real ni una transacción de integración contra Transbank. Las respuestas del proveedor fueron simuladas; la aceptación contractual se contrastó con documentación oficial. Verificación de producción prevista: migración/permisos/conteos, rutas sin operaciones y pantalla autenticada.

## Publicación y reversión

1. Migración aditiva `20260906021843_webpay_recovery` aplicada. Lectura anon/authenticated y ejecución authenticated denegadas; service_role habilitado. Conteos conservados: 1495 reservas, 1673 movimientos, 99 extras y 1210 cobros. Cero intentos creados por la migración.
2. Publicar solo archivos de esta entrega sobre `282cb7d`, sin incluir cambios locales ajenos.
3. Comprobar dominio productivo, bandeja autenticada y ausencia de errores nuevos.
4. Si el flujo presenta regresión, revertir código a despliegue anterior; conservar `webpay_intentos` y sus recibos. No borrar ni revertir datos de pagos. La migración no impide ejecutar el código anterior.

## Referencias

- [Transbank: Webpay Plus, confirmación y consulta de estado](https://www.transbankdevelopers.cl/documentacion/webpay-plus).
- [Supabase: funciones de base de datos y permisos](https://supabase.com/docs/guides/database/functions).
