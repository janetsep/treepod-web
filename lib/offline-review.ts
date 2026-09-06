type Candidate = {id:string;estado:string;total:number;monto_pagado:number;pagado_at:string|null;gclid:string|null;deleted_at:string|null};
export function isOfflineReviewCandidate(r: Candidate): boolean {
    return !r.deleted_at && r.estado === 'pagado' && Number(r.total)>0 && Number(r.monto_pagado)>=Number(r.total)
        && !!r.pagado_at && Number.isFinite(Date.parse(r.pagado_at))
        && !!r.gclid && /^[A-Za-z0-9_-]{10,256}$/.test(r.gclid);
}
export function csvCell(value: unknown): string {
    const text = String(value ?? '');
    return '"' + (/^[=+@\-\t\r]/.test(text) ? "'" : '') + text.replaceAll('"','""') + '"';
}
