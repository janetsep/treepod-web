# ALMA y cartolas: controles iniciales, 6 de septiembre de 2026

## Alcance

- Las rutas que usan `getVerifiedAdmin` rechazan escrituras de `viewer`, incluidas las acciones GET heredadas identificadas (precios, alertas, reporte diario y sincronizaciones). Los demás perfiles mantienen sus controles específicos.
- Las sugerencias de compras, ofertas, selección de productos para refresco y sugerencias de vínculos bancarios leen páginas completas, con orden estable y error explícito si alguna falla. No se cambia el algoritmo de demanda ni el de coincidencia bancaria.
- ALMA distingue error de consulta de ausencia de compras. El refresco de precios diferencia resultado parcial de éxito completo.
- Cartolas cuenta únicamente respuestas de guardado confirmadas. Conserva ediciones/sugerencias no confirmadas y no reintenta automáticamente. Una respuesta de red incierta debe revisarse antes de repetirla. Vincular una reserva no certifica una conciliación bancaria.

## Validación

- `npm test`: 24 pruebas aprobadas, incluyendo permisos, lotes parcialmente fallidos y ejecución del manejador real de compras con datos sintéticos de 1.435 consumos / 1.610 precios y fallo de segunda página.
- `npx tsc --noEmit`: aprobado.
- `vercel build --prod`: aprobado, Next.js 16.2.4.
- Las pruebas de escrituras son simuladas; no se guardaron conciliaciones, consumos, compras ni precios reales para probar.

## Límites y siguiente fase

No requiere migración ni modifica registros históricos. No activa respaldos, sincronización con Google ni tareas nuevas. Los procesos programados preexistentes no se ejecutan manualmente en esta entrega.

Pendiente: movimientos de stock transaccionales e idempotentes; reversión segura de boletas; conciliación por pago, importe y fecha (no solo vínculo); demanda basada en servicios asignados; unidades comparables y vigencia de precios; cobertura de errores en otras operaciones de ALMA. La paginación no constituye una instantánea transaccional si los datos cambian durante la consulta, y el límite de seguridad de lectura es de 50.000 filas.

Antes de reparar stock o reclasificar datos históricos se debe presentar el detalle para revisión. La usuaria pidió mantener los respaldos sin configurar por ahora.
