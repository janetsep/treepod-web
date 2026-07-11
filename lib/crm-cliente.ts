import { supabaseAdmin } from "@/lib/supabase-admin";

type DatosHuesped = {
  nombre?: string | null;
  apellido?: string | null;
  email?: string | null;
  telefono?: string | null;
  rut?: string | null;
  fuente?: string | null;
};

// Garantiza que toda reserva quede vinculada a un cliente del CRM.
// - Con email: busca por email; si existe, completa SOLO los campos vacíos de la
//   ficha (nunca pisa datos buenos con datos peores); si no existe, la crea.
// - Sin email: intenta coincidencia única por nombre completo; si es ambigua o no
//   hay, crea una ficha nueva marcada con su fuente (p. ej. airbnb) para poder
//   fusionarla después.
// Nunca lanza: ante cualquier error registra en consola y devuelve null, para que
// un problema del CRM jamás bloquee la creación de la reserva.
export async function vincularClienteAReserva(
  reservaId: string,
  datos: DatosHuesped
): Promise<string | null> {
  try {
    const email = datos.email?.trim().toLowerCase() || null;
    const nombre = datos.nombre?.trim() || null;
    const apellido = datos.apellido?.trim() || null;
    if (!email && !nombre) return null;

    let clienteId: string | null = null;

    if (email) {
      const { data: existente } = await supabaseAdmin
        .from("clientes")
        .select("id, nombre, apellido, telefono, rut")
        .ilike("email", email)
        .maybeSingle();

      if (existente) {
        clienteId = existente.id;
        const faltantes: Record<string, string> = {};
        if (!existente.nombre && nombre) faltantes.nombre = nombre;
        if (!existente.apellido && apellido) faltantes.apellido = apellido;
        if (!existente.telefono && datos.telefono) faltantes.telefono = datos.telefono.trim();
        if (!existente.rut && datos.rut) faltantes.rut = datos.rut.trim();
        if (Object.keys(faltantes).length > 0) {
          await supabaseAdmin
            .from("clientes")
            .update({ ...faltantes, updated_at: new Date().toISOString() })
            .eq("id", existente.id);
        }
      }
    } else if (nombre) {
      // Sin email: solo vincular si el nombre completo coincide con UN único cliente.
      const { data: candidatos } = await supabaseAdmin
        .from("clientes")
        .select("id")
        .ilike("nombre", nombre)
        .ilike("apellido", apellido || "%")
        .limit(2);
      if (candidatos && candidatos.length === 1) clienteId = candidatos[0].id;
    }

    if (!clienteId) {
      const { data: creado, error } = await supabaseAdmin
        .from("clientes")
        .insert({
          nombre: nombre || "Sin Nombre",
          apellido,
          email,
          telefono: datos.telefono?.trim() || null,
          rut: datos.rut?.trim() || null,
          fuente_primaria: datos.fuente?.toLowerCase() || "desconocida",
          metadata: { creado_desde_reserva: true, reserva_origen: reservaId },
        })
        .select("id")
        .single();
      if (error) {
        console.error("[crm-cliente] Error creando cliente:", error.message);
        return null;
      }
      clienteId = creado.id;
    }

    await supabaseAdmin
      .from("reservas")
      .update({ cliente_id: clienteId })
      .eq("id", reservaId);

    return clienteId;
  } catch (e: any) {
    console.error("[crm-cliente] Error vinculando cliente:", e?.message || e);
    return null;
  }
}
