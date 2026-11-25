import test from "node:test";
import assert from "node:assert/strict";
import { estadoAlConfirmar, tieneAbonoParcial, confirmadaConAbono } from "../../lib/admin-confirmacion.ts";

test("confirmar conserva el abono y distingue pago parcial, total y sin pago", () => {
    for (const [total, recibido, estado, parcial] of [
        ["380000", "190000", "confirmado", true],
        [380000, 380000, "pagado", false],
        [380000, null, "confirmado", false],
        [0, 0, "confirmado", false],
    ]) {
        assert.equal(estadoAlConfirmar(total, recibido), estado);
        assert.equal(tieneAbonoParcial(total, recibido), parcial);
    }
});

test("un abono se muestra en reservas firmes, incluso con el antiguo estado pagado", () => {
    for (const estado of ["confirmado", "Confirmada", "pagado"]) {
        assert.equal(confirmadaConAbono(estado, 380000, 190000), true);
    }
    assert.equal(confirmadaConAbono("cancelada", 380000, 190000), false);
    assert.equal(confirmadaConAbono("confirmado", 380000, 380000), false);
});
