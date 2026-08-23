import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

/**
 * Reservas que se armaron completas y no llegaron a pagarse.
 *
 * Cuando alguien llena el formulario y no completa el pago, la reserva queda
 * en cancelada/expirada/rechazado y ademas se marca como borrada. El panel
 * filtra las borradas, asi que esos contactos quedaban invisibles: en la
 * revision de agosto de 2026 habia 11 personas con correo y telefono que
 * nadie habia visto nunca.
 *
 * Esta vista los saca a la superficie sin restaurarlos, para que no se mezclen
 * con las reservas activas ni ocupen el calendario.
 */
const ESTADOS_CAIDOS = ["cancelada", "expirada", "rechazado", "pendiente_pago"];

// Correos y datos que son claramente pruebas internas, no clientes.
function esPrueba(r: any): boolean {
  const email = String(r.email || "").toLowerCase();
  const nombre = `${r.nombre || ""} ${r.apellido || ""}`.toLowerCase();
  if (!email) return true;
  if (email.includes("test") || email.includes("prueba") || email.includes("example.com")) return true;
  if (email.endsWith("@treepod.cl") || email.includes("domostreepod.cl")) return true;
  if (email === "janetsep@gmail.com" || email.startsWith("janetse@")) return true;
  if (/^[a-z]{0,4}$/.test(nombre.replace(/\s/g, "")) && nombre.trim().length > 0) return true;
  // Montos simbolicos de prueba de Webpay.
  if (Number(r.total) > 0 && Number(r.total) < 1000) return true;
  return false;
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde") || "2026-01-01";
  const incluirPruebas = searchParams.get("pruebas") === "1";

  const { data, error } = await supabaseAdmin
    .from("reservas")
    .select("id, created_at, nombre, apellido, email, telefono, fecha_inicio, fecha_fin, adultos, total, estado, fuente, utm_source, gclid, domos(nombre)")
    .in("estado", ESTADOS_CAIDOS)
    .gte("created_at", desde)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hoy = new Date().toISOString().split("T")[0];
  const filas = (data || [])
    .filter((r: any) => incluirPruebas || !esPrueba(r))
    .map((r: any) => {
      const noches = Math.round(
        (new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000
      );
      return {
        id: r.id,
        creada: r.created_at,
        cliente: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "(sin nombre)",
        email: r.email,
        telefono: r.telefono,
        entrada: r.fecha_inicio,
        salida: r.fecha_fin,
        noches,
        huespedes: Number(r.adultos) || 2,
        domo: (r.domos as any)?.nombre || "",
        total: Number(r.total) || 0,
        estado: r.estado,
        origen: r.utm_source || (r.gclid ? "google ads" : null),
        // Si la fecha todavia no pasa, esta reserva aun se puede rescatar.
        rescatable: r.fecha_inicio >= hoy,
      };
    });

  const rescatables = filas.filter((f) => f.rescatable);

  return NextResponse.json({
    filas,
    resumen: {
      total: filas.length,
      monto: filas.reduce((s, f) => s + f.total, 0),
      rescatables: rescatables.length,
      monto_rescatable: rescatables.reduce((s, f) => s + f.total, 0),
      con_telefono: filas.filter((f) => f.telefono).length,
    },
  });
}
