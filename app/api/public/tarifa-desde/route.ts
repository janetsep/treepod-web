import { NextResponse } from "next/server";
import { precioDesde } from "@/lib/precio-desde";

// Envoltura HTTP de lib/precio-desde: la regla comercial vive allí y es la
// misma que usa ValueBand al renderizar en el servidor. Este endpoint existe
// para los componentes de cliente (barra fija, widget de reserva, /domos,
// /disponibilidad), que no pueden consultar Supabase directamente.
//
// Se consulta en vivo, sin caché, para que una temporada superpuesta cambie y
// se revierta el precio público al mismo tiempo que la configuración de tarifas.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { precio, unaNoche, temporada, nochesMin } = await precioDesde();
  return NextResponse.json(
    { desde: precio, unaNoche, temporada, nochesMin },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
