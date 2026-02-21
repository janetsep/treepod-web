import { supabase } from "@/lib/supabase";

export type FinanceMovementInput = {
    tipo: 'ingreso' | 'egreso';
    categoria: string;
    monto: number;
    reserva_id?: string;
    domo_id?: string;
    metodo_pago: 'webpay' | 'transferencia' | 'efectivo' | 'otro';
    transaccion_id?: string;
    descripcion: string;
    tributario?: boolean;
    dte_emitido?: boolean;
    revisado_contabilidad?: boolean;
    clasificacion_tributaria?: string;
};

export class FinanceService {
    /**
     * Registra un movimiento financiero validado en la base de datos.
     */
    static async registrarMovimiento(input: FinanceMovementInput) {
        const { data, error } = await supabase
            .from("finanzas_movimientos")
            .insert({
                ...input,
                fecha_movimiento: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("🔥 Error FinanceService:", error.message);
            throw error;
        }

        return data;
    }
}
