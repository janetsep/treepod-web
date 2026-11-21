type Importe = number | string | null | undefined;

export function estadoAlConfirmar(total: Importe, abonado: Importe) {
    return Number(total) > 0 && Number(abonado) === Number(total) ? "pagado" : "confirmado";
}

export function tieneAbonoParcial(total: Importe, abonado: Importe) {
    return Number(abonado) > 0 && Number(abonado) < Number(total);
}

export function confirmadaConAbono(estado: string, total: Importe, abonado: Importe) {
    return ["pagado", "confirmado", "confirmada"].includes(estado?.toLowerCase()) && tieneAbonoParcial(total, abonado);
}
