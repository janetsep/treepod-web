# Integridad de reservas y extras — 6 septiembre 2026 UTC

Primera entrega de la etapa 1 solicitada por Janet. No es el cierre del programa completo.

## Cambios

El endpoint de guardado usa una sola función de base de datos para reserva, extras, fotografía inicial de cobros y auditoría. Si cualquiera falla, se revierte toda la solicitud. Las notificaciones y vínculo CRM siguen después del guardado; no forman parte de la transacción monetaria. Un fallo de CRM se informa sin decir que falló la reserva ya persistida.

Se conservan servicios inactivos en la web, cortesías, cantidades por personas/noches y precios especiales. Se valida que los extras no excedan el total y que las cantidades/precios sean válidos. El precio total pactado no se recalcula desde la tarifa comercial actual. La fotografía original de cobros no se reescribe al editar; al crear conserva el total exacto, incluso cuando dividir por noches requiere redondeo.

Cada apertura del formulario tiene una operación identificable. Una respuesta perdida puede reintentarse sin crear otra reserva ni repetir notificaciones. La misma operación con contenido diferente se rechaza. La edición verifica la fecha de modificación y saldo/estado/total originales bajo bloqueo de fila; una edición antigua no sobrescribe un pago reciente. Las escrituras de otros módulos que no actualicen fecha ni estos campos todavía necesitan revisión individual.

La RPC y tabla de operaciones son exclusivamente de servidor, con RLS y privilegios denegados a anon/authenticated. No se duplican datos de huéspedes en la tabla de operaciones: guarda ID y huella de solicitud. Migración productiva `20260906015535_atomic_booking_save`, aditiva, sin backfill.

## Verificación

- TypeScript y compilación productiva correctos.
- 9 pruebas de aplicación: permisos, cron, paginación, CSV y cálculo de extras.
- PostgreSQL 17 aislado sin red, con esquema productivo sin datos: cortesía de servicio inactivo, precio especial, total exacto de cobros, repetición idempotente, modificación de solicitud repetida, fallo de FK de servicio que revierte reserva/extras/auditoría, conservación de metadata, fotografía inmutable, edición antigua, viewer denegado y solapamiento de domos rechazado.
- Dos procesos simultáneos: creación única con un reintento reconocido; dos ediciones de la misma versión aceptan solo una.
- Producción antes/después de migración: 1495 reservas, 99 extras, 1210 cobros, 1673 movimientos; cero guardados nuevos. No se creó ni se pagó una reserva real de prueba.
- Advisor: nuevas funciones sin aviso de search_path. `reserva_guardados` muestra aviso informativo de RLS sin políticas intencional: solo servidor, sin concesiones de navegador. [Interpretación del aviso](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Reproducir solo en Docker aislado: `booking-schema.sql` (metadatos sin registros), migración atomic_booking_save, `booking-atomic.sql`; luego `node tests/security/booking-concurrency.mjs`. El script de concurrencia solo llama al contenedor y DB de prueba explícitos, sin credenciales productivas.

## Webpay: revisado, todavía no modificado

Confirmados en código: confirmación al proveedor antes de resolver vínculo fiable token/reserva, guardado y caja separados, comparación de importe que solo alerta, continuación tras fallo de persistencia y logs que incluyen identificadores innecesarios. La próxima entrega debe registrar cada intento con importe/orden/sesión, validar la respuesta, recuperar mediante consulta de estado y persistir reserva/caja de manera idempotente. Un estado incierto nunca debe invitar a pagar otra vez sin verificar.

Referencia consultada: [documentación oficial Webpay Plus](https://www.transbankdevelopers.cl/documentacion/webpay-plus). No se llamó a Transbank, ni se cambió su integración, GA4 o Meta. No se enviaron conversiones offline.

## Límites operativos

- La corrección no concilia históricos ni convierte un ajuste manual de monto en un nuevo movimiento financiero. Esa decisión requiere distinguir corrección contable de cobro nuevo; usar Registrar pago para dinero nuevo.
- Reintentos reconocidos no reejecutan CRM/correos fallidos: falta bandeja de recuperación de efectos secundarios.
- Pestañas antiguas requieren recarga por el nuevo identificador/versión de guardado.
- Puede revertirse el código al commit anterior sin borrar tabla/migración ni datos; no reabrir permisos públicos.
