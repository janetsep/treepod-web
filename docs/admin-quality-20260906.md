# Calidad operativa — 6 septiembre 2026 UTC

## Entrega y evidencia

- Nuevo `/admin/calidad`, lectura agregada restringida a admin/superadmin: relaciones, uso de funciones registrado y resultados de tareas. Sin PII, sin cambios al abrirlo, errores visibles y sin ceros ficticios.
- Pagos manuales por RPC transaccional: bloqueo de saldo, identificador de operación, reintento idempotente, caja y auditoría atómicas. Fecha de pago completo persistida en nuevas operaciones, sin rellenar históricos.
- Funciones nuevas y tabla de operaciones accesibles únicamente al servidor; RLS y privilegios cerrados al navegador. Dos migraciones aditivas, sin actualizar reservas existentes.
- Reporte diario: modo manual requiere identidad y permisos; un secreto ausente no abre los cron. El proveedor debe confirmar el envío. Liberación de transferencias compara estado/fecha de actualización y no libera si hay dinero registrado.
- Airbnb manual acepta sesión administrativa, nunca el parámetro manual como autorización; errores parciales ya no se presentan como éxito.
- Cron meteorología rechaza respuestas vacías; las tres tareas guardan éxito/fallo sin cuerpos de respuesta ni huéspedes. No se invocaron durante la auditoría: producen efectos reales.
- Listas de clientes y reservas recuperan todas las páginas con orden estable y fallan si una página no pudo recuperarse. Se mantiene contrato UI; queda optimizar a paginación/filtros en servidor para volúmenes mayores.
- CSV offline pasa a plantilla interna NO-CARGAR: solo pago completo, fecha de pago y GCLID en la propia reserva. Sin cruces por correo/teléfono, sin PII ni envío automático. Fechas filtro UTC explícitas. No equivale a consentimiento ni certifica antigüedad del clic/deduplicación con la compra GA4.

## Datos reales consultados en producción

Antes de migración: reservas 1495, movimientos 1673, extras 99, outbox 9. Las cifras incluyen históricos y no representan ventas del mes.

Estadías no eliminadas con entrada en 2026: 89, de las cuales 19 son bloqueos. Controles que pueden solaparse:

| Control | Casos |
|---|---:|
| Estado pagado sin vínculo a cliente | 18 |
| Monto pagado positivo sin ingreso de reservas vinculado | 26 |
| Diferencia caja vinculada / monto pagado | 21 |
| Cobros originales / total actual diferentes | 12 |
| Pago positivo sin pagado_at | 33 |
| Fechas o importes inválidos en 2026 | 0 |
| Movimientos con reserva inexistente, todos los años | 2 |

`reserva_cobros` se escribe solo al crear, como fotografía original según el código. Su diferencia no justifica sobrescribirlo ni implica un error contable por sí sola. Las relaciones ausentes tampoco prueban dinero perdido.

Últimos 30 días: 12 registros de pago, 9 creaciones manuales registradas, 27 ediciones, 10 cambios de tarifa, 3 de temporada. No son visitas de usuarios ni todas las ventas web. Extras: 99 registros, 33 cortesías; último 2026-09-02 UTC. Meteorología: última escritura 2026-09-05 10:37 UTC. No hay evidencia suficiente en logs disponibles para certificar últimos envíos del reporte o sincronizaciones Airbnb. El nuevo historial empieza al desplegar.

Outbox: 9 registros, última creación 2026-08-16, ninguno marcado enviado. Su conexión con todos los flujos de pago aún no está completada. No se cargó nada a Google.

## Pruebas

- `npm test`: 7 pruebas (permisos, secreto cron, paginación >1000, error de página, elegibilidad offline, CSV seguro).
- TypeScript y `vercel build --prod` completados.
- PostgreSQL 17 aislado, sin red: pagos parciales/completos, reintento idéntico, clave con contenido distinto, sobrepago, viewer, fecha de pago, rollback de saldo ante fallo forzado de caja, RPC no pública, reporte sin evidencia inventada.
- Dos procesos simultáneos intentaron pagar 60 contra saldo 100: uno confirmó y otro rechazó PAYMENT_BALANCE. Sin pruebas financieras en producción.
- Reproducción en DB desechable: fixture.sql, migración fase1, permissions.sql, payments-fixture.sql, migración admin_quality_payments, payments.sql, quality-fixture.sql, migración admin_quality_report, quality.sql. No ejecutar fixtures en producción.

## No declarar el programa cerrado todavía

1. Guardado de reserva y extras aún usa varias operaciones; requiere transacción conjunta y control de edición concurrente. Cortesías, servicios inactivos y precios pactados deben conservarse. No prohibir importaciones/ajustes históricos sin decisión.
2. Webpay: comprobar vinculación token/orden/reserva, importe esperado y recuperación tras aprobación con fallo de persistencia; pruebas del proveedor aisladas, nunca cobros reales de ensayo.
3. Históricos: revisión con comprobantes y propuesta por registro antes de reasignar clientes/caja o completar fechas.
4. Respaldos: falta evidencia de política, retención y restauración aislada; un correo diario no es respaldo de base de datos. No se restauró producción ni se contrató infraestructura.
5. Cobertura móvil completa y recuperación de sesiones, políticas de todas las vistas/storage y pruebas continuas pendientes.
6. Esperar ejecuciones naturales para validar cron, sin disparar envíos/cancelaciones para obtener un indicador verde. El reporte distingue pendiente, vencido, éxito y error.

## Mejoras de negocio propuestas, no activadas

Primero bandeja de excepciones con responsable y resolución respaldada; después agenda operativa de limpieza/extras/cortesías, saldos por cobrar y caja conciliada; luego margen por estadía con costos reales y compras según ocupación. No añadir pasos al huésped.

## Seguridad y reversión

Aplicación anterior compatible con las nuevas tablas/funciones; revertir commit de aplicación si fuera necesario, sin borrar tabla de operaciones ni reabrir permisos públicos. No desplegar la nueva API de pagos sin sus migraciones. Las pestañas antiguas sin operación deben recargarse. No reenviar un pago con una nueva operación sin comprobar el resultado anterior.

Referencias de implementación: [funciones Supabase](https://supabase.com/docs/guides/database/functions), [tareas Vercel](https://vercel.com/docs/cron-jobs/manage-cron-jobs). Guías aplicadas para transacciones cortas, privilegios restringidos y secreto obligatorio.
