import type { PaidReservation } from './purchase-policy';

type Candidate = PaidReservation & {pagado_at:string|null;gclid:string|null};
export function isOfflineReviewCandidate(r: Candidate): boolean {
    const total = Number(r.total);
    return !r.deleted_at && r.estado === 'pagado'
        && !r.metadata?.is_test && !r.metadata?.analytics_test
        && Number.isFinite(total) && total>500 && Number(r.monto_pagado)===total
        && !!r.pagado_at && Number.isFinite(Date.parse(r.pagado_at))
        && !!r.gclid && /^[A-Za-z0-9_-]{10,256}$/.test(r.gclid);
}
export function csvCell(value: unknown): string {
    const text = String(value ?? '');
    return '"' + (/^[=+@\-\t\r]/.test(text) ? "'" : '') + text.replaceAll('"','""') + '"';
}
