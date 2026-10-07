export type PaidReservation = {
    id: string;
    estado: string;
    total: number | string;
    monto_pagado: number | string;
    numero_transaccion?: string | null;
    deleted_at?: string | null;
    metadata?: { is_test?: boolean; analytics_test?: boolean } | null;
};

/** Read confirmed amounts only. URL parameters are never payment evidence. */
export function confirmedPurchase(reservation: PaidReservation) {
    const value = Number(reservation.total);
    const paymentAmount = Number(reservation.monto_pagado);
    if (reservation.deleted_at || reservation.estado !== 'pagado'
        || reservation.metadata?.is_test || reservation.metadata?.analytics_test
        // Historical $1/$500 checkout tests must not become commercial sales.
        || !Number.isFinite(value) || value <= 500
        || !Number.isFinite(paymentAmount) || paymentAmount <= 0
        || paymentAmount > value) return null;
    return {
        transactionId: reservation.numero_transaccion || reservation.id,
        value,
        paymentAmount,
    };
}
