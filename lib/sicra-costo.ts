// Cálculo de precio promedio ponderado para inventario SICRA.
// stock_actual se guarda en unidades de consumo; precio_compra es por unidad de compra.
// Al ingresar una compra, el costo se promedia ponderando por las unidades de compra
// existentes y las nuevas, para que el inventario nunca se infle ni pierda el costo real.

export function precioPromedioPonderado(opts: {
  stockActualConsumo: number; // stock actual en unidades de consumo
  factor: number; // contenido_por_unidad (unidades de consumo por unidad de compra)
  precioViejo: number; // precio_compra actual (por unidad de compra)
  qtyCompra: number; // cantidad comprada (en unidades de compra)
  precioNuevo: number; // precio unitario de la compra (por unidad de compra)
}): number {
  const factor = opts.factor || 1;
  const existentesCompra = Math.max(0, Number(opts.stockActualConsumo) / factor);
  const total = existentesCompra + opts.qtyCompra;
  if (total <= 0) return Math.round(opts.precioNuevo);
  return Math.round(
    (existentesCompra * opts.precioViejo + opts.qtyCompra * opts.precioNuevo) / total
  );
}
