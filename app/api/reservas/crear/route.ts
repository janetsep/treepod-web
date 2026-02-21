import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      entrada,
      salida,
      adultos,
      total,
      servicios,
      precio_original,
      descuento_monto,
      descuento_detalle
    } = body as {
      entrada?: string;
      salida?: string;
      adultos?: number;
      total?: number;
      servicios?: any[];
      precio_original?: number;
      descuento_monto?: number;
      descuento_detalle?: any;
    };

    if (!entrada || !salida || !adultos || !total) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (Number.isNaN(Number(adultos)) || Number(adultos) <= 0) {
      return NextResponse.json({ error: "Adultos inválido" }, { status: 400 });
    }

    if (Number.isNaN(Number(total)) || Number(total) <= 0) {
      return NextResponse.json({ error: "Total inválido" }, { status: 400 });
    }

    // ... (rest of the logic remains same until insert) ...

    // 1. Buscar domos con capacidad suficiente ... (Skipping to keep diff clean if possible, but I need to reach line 90)
    // Actually I'll use ReplacementContent for the insertion part too.

    // 1. Buscar domos con capacidad suficiente
    const { data: domosComp, error: domosErr } = await supabase
      .from("domos")
      .select("id, nombre")
      .eq("activo", true)
      .gte("capacidad", adultos);

    if (domosErr || !domosComp || domosComp.length === 0) {
      return NextResponse.json({ error: "No hay domos con esa capacidad disponible" }, { status: 400 });
    }

    const domosPosibles = domosComp.map(d => d.id);

    // 2. Buscar ocupación (reservas activas)
    // Traemos las reservas que coinciden en fecha y domo, sin filtrar estado aún en DB para poder validar expiración
    const { data: rawConflicts, error: resErr } = await supabase
      .from("reservas")
      .select("domo_id, estado, expires_at, email")
      .in("domo_id", domosPosibles)
      .in("estado", ["pagado", "pendiente", "pendiente_pago", "confirmado"])
      .lt("fecha_inicio", salida)
      .gt("fecha_fin", entrada);

    const now = new Date();

    // Filtramos en memoria:
    // - Pagadas/Confirmadas/Pendiente (manual) SIEMPRE ocupan.
    // - Pendientes de pago (Web): SOLO ocupan si el cliente ya ingresó sus datos (email).
    //   Si no hay email, es un carrito vacío/abandonado y NO debe bloquear el calendario.
    const ocupadosRes = (rawConflicts || []).filter(r => {
      // Estados firmes bloquean siempre
      if (['pagado', 'confirmado', 'pendiente'].includes(r.estado)) return true;

      // Estado temporal web: Solo bloquea si hay "intención real" (datos ingresados)
      if (r.estado === 'pendiente_pago') {
        // Nota: r.email debe venir en el select. Asegurarse de haberlo pedido en la query anterior.
        return !!r.email;
      }
      return false;
    });

    // 3. Buscar bloqueos
    const { data: ocupadosBloq, error: bloqErr } = await supabase
      .from("bloqueos_calendario")
      .select("domo_id")
      .in("domo_id", domosPosibles)
      .lt("fecha_inicio", salida)
      .gt("fecha_fin", entrada);

    const idOcupados = new Set([
      ...ocupadosRes.map(r => r.domo_id),
      ...(ocupadosBloq || []).map(b => b.domo_id)
    ]);

    const domoDisponible = domosComp.find(d => !idOcupados.has(d.id));

    if (!domoDisponible) {
      return NextResponse.json({ error: "Lo sentimos, ya no quedan domos disponibles para estas fechas" }, { status: 409 });
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // 4. Insertar la reserva con fallback para columnas de descuento
    const insertPayload: any = {
      fecha_inicio: entrada,
      fecha_fin: salida,
      adultos,
      total,
      domo_id: domoDisponible.id,
      estado: "pendiente_pago",
      expires_at: expiresAt,
      fuente: "WEB_NEW_PRICING"
    };

    let { data, error } = await supabase
      .from("reservas")
      .insert({
        ...insertPayload,
        precio_original: precio_original || total,
        descuento_monto: descuento_monto || 0,
        descuento_detalle: descuento_detalle || [],
      })
      .select("id")
      .single();

    // Fallback en caso de que las columnas de descuento aún no existan en la DB
    if (error && (error.message.includes("column") || error.code === '42703')) {
      console.warn("⚠️ Las columnas de descuento no existen en la tabla 'reservas'. Reintentando inserción básica.");
      const retry = await supabase
        .from("reservas")
        .insert(insertPayload)
        .select("id")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error("❌ Error final en insert de reserva:", error);
      return NextResponse.json(
        {
          error: "Error creando reserva",
          details: error?.message || "Error desconocido en la base de datos",
          code: error?.code
        },
        { status: 500 }
      );
    }

    // 4. Insertar servicios si existen
    if (servicios && servicios.length > 0) {
      const serviciosInsert = servicios.map((s: any) => ({
        reserva_id: data.id,
        servicio_id: s.id,
        cantidad: s.cantidad,
        precio_unitario: s.precio_unitario,
        total: s.total
      }));

      const { error: servErr } = await supabase
        .from("reserva_servicios")
        .insert(serviciosInsert);

      if (servErr) {
        console.error("Error insertando servicios:", servErr);
      }
    }

    return NextResponse.json({ id: data.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      {
        error: "Error creando reserva",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
