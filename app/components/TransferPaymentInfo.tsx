"use client";

import { useState } from "react";
import { trackEvent } from "../lib/analytics";
import { Check, Copy, Info, Send } from "lucide-react";

interface TransferPaymentInfoProps {
    reservaId: string;
    total: number;
    onConfirm: () => void;
}

export default function TransferPaymentInfo({
    reservaId,
    total,
    onConfirm,
}: TransferPaymentInfoProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Calculate 50% deposit
    const depositAmount = Math.round(total * 0.5);

    // Bank Details - TO BE UPDATED
    const bankDetails = {
        bank: process.env.NEXT_PUBLIC_BANK_NAME || "Banco Estado",
        accountType: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TYPE || "Cuenta Corriente",
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "123456789",
        holder: process.env.NEXT_PUBLIC_BANK_HOLDER_NAME || "TreePod SpA",
        rut: process.env.NEXT_PUBLIC_BANK_HOLDER_RUT || "76.xxx.xxx-x",
        email: process.env.NEXT_PUBLIC_BANK_EMAIL || "reservas@domostreepod.cl",
    };

    const copyToClipboard = () => {
        const text = `
Banco: ${bankDetails.bank}
Tipo: ${bankDetails.accountType}
N° Cuenta: ${bankDetails.accountNumber}
Titular: ${bankDetails.holder}
RUT: ${bankDetails.rut}
Email: ${bankDetails.email}
    `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmTransfer = async () => {
        setIsLoading(true);
        trackEvent("click_pagar", { metodo: "transferencia" });

        try {
            const response = await fetch("/api/pagos/transfer/confirmar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reservaId }),
            });

            if (!response.ok) {
                throw new Error("Error al confirmar la transferencia");
            }

            trackEvent("payment_started", { metodo: "transferencia" });

            // FIRE PURCHASE EVENT FOR ADS OPTIMIZATION
            // Although verified manually later, we track this as a conversion signal.
            trackEvent("purchase", {
                transaction_id: `TRANSF-${reservaId}`,
                value: total,
                currency: "CLP",
                payment_type: "transferencia", // Custom parameter for segmentation
                items: [{
                    item_name: "Domo Glamping (Transferencia)",
                    item_id: reservaId,
                    price: total,
                    quantity: 1
                }]
            });

            onConfirm();
        } catch (error) {
            console.error("Error confirmando transferencia:", error);
            alert("Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-surface-light dark:bg-surface-dark border p-8 rounded-3xl border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-display font-bold text-text-main-light dark:text-text-main-dark">
                        Datos de Transferencia
                    </h3>
                    <button
                        onClick={copyToClipboard}
                        className="text-primary hover:text-primary-dark text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-primary" />
                        ) : (
                            <Copy className="w-5 h-5 text-primary" />
                        )}
                        {copied ? "Copiado" : "Copiar Datos"}
                    </button>
                </div>

                <div className="space-y-4 text-sm font-light text-text-sub-light dark:text-text-sub-dark">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-main-light/50 dark:text-text-main-dark/50 mb-1">Banco</p>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark">{bankDetails.bank}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-main-light/50 dark:text-text-main-dark/50 mb-1">Tipo de Cuenta</p>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark">{bankDetails.accountType}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-main-light/50 dark:text-text-main-dark/50 mb-1">N° Cuenta</p>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark font-mono">{bankDetails.accountNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-main-light/50 dark:text-text-main-dark/50 mb-1">RUT</p>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark">{bankDetails.rut}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-main-light/50 dark:text-text-main-dark/50 mb-1">Titular</p>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark">{bankDetails.holder}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-text-main-light/50 dark:text-text-main-dark/50 mb-1">Correo de Confirmación</p>
                            <p className="font-medium text-text-main-light dark:text-text-main-dark">{bankDetails.email}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-text-sub-light">Monto a Transferir (50%)</span>
                        <span className="text-2xl font-display font-bold text-primary">${depositAmount.toLocaleString("es-CL")}</span>
                    </div>
                    <p className="text-xs text-right text-text-sub-light/60 italic">
                        El saldo restante se paga al momento del Check-in.
                    </p>
                </div>
            </div>

            <div className="bg-gold/10 p-6 rounded-2xl flex gap-4 items-start">
                <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div className="text-sm text-text-sub-light dark:text-text-sub-dark space-y-2">
                    <p>
                        <strong>Importante:</strong> Tu reserva quedará en espera de confirmación hasta que recibamos el comprobante de transferencia.
                    </p>
                    <p className="font-light">
                        Envía el comprobante al correo indicado usando el código de reserva como asunto.
                    </p>
                </div>
            </div>

            <button
                onClick={handleConfirmTransfer}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-6 rounded-full text-base uppercase tracking-[0.3em] shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                    <>
                        <span>Confirmar Transferencia Realizada</span>
                        <Send className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    );
}
