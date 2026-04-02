// LÍNEA CRÍTICA QUE DEBE ESTAR EN EL WEBPAY HANDLER
// En la sección donde se hace el UPDATE a la tabla reservas:

const { error: dbUpdateError } = await supabaseAdmin
  .from("reservas")
  .update({
    estado: isApproved ? "pagado" : "rechazado",
    pagado: isApproved ? 1 : 0,
    monto_pagado: isApproved ? commit.amount ?? null : 0,
    numero_transaccion: isApproved ? token : null,  // ✅ ESTA LÍNEA ES CRÍTICA
    updated_at: new Date().toISOString(),
  })
  .eq("id", reserva.id);
