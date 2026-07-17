import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendWhatsAppAlert } from "@/lib/whatsapp-alert";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { vincularClienteAReserva } from "@/lib/crm-cliente";

export async function POST(req: Request) {
  try {
    // Antiabuso: límite por IP para la creación de reservas (primera capa best-effort).
    if (!rateLimit(`crear-reserva:${clientIp(req)}`, 15, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." }, { status: 429 });
    }
    const body = await req.json();
    const {
      entrada,
      salida,
      adultos,
      total,
      servicios,
      precio_original,
      descuento_monto,
      descuento_detalle,
      nombre,
      apellido,
      email,
      telefono,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = body as {
      entrada?: string;
      salida?: string;
      adultos?: number;
      total?: number;
      servicios?: any[];
      precio_original?: number;
      descuento_monto?: number;
      descuento_detalle?: any;
      nombre?: string;
      apellido?: string;
      email?: string;
      telefono?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
    };

    if (!entrada || !salida || !adultos || !total) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Regla de negocio: las reservas para el MISMO DÍA (check-in hoy) solo se aceptan
    // hasta las 14:00 hrs (hora de Chile). Pasada esa hora, la entrada mínima es mañana.
    // Se calcula con la zona horaria de Chile en el servidor (no depende del cliente).
    {
      const partes = new Intl.DateTimeFormat("es-CL", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const val = (t: string) => partes.find((p) => p.type === t)?.value || "";
      const hoyChile = `${val("year")}-${val("month")}-${val("day")}`;
      const horaChile = parseInt(val("hour"), 10) % 24; // "24" (medianoche) -> 0

      if (entrada < hoyChile) {
        return NextResponse.json(
          { error: "La fecha de entrada ya no está disponible. Elige una fecha futura." },
          { status: 400 }
        );
      }
      if (entrada === hoyChile && horaChile >= 14) {
        return NextResponse.json(
          {
            error:
              "Las reservas para el mismo día solo se aceptan hasta las 14:00 hrs. Por favor elige a partir de mañana.",
          },
          { status: 400 }
        );
      }
    }

    // Validate client data (critical for Transbank flow)
    if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !telefono?.trim()) {
      return NextResponse.json({ error: "Datos del cliente incompletos. Nombre, apellido, email y teléfono son obligatorios." }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
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
    const { data: domosComp, error: domosErr } = await supabaseAdmin
      .from("domos")
      .select("id, nombre")
      .eq("activo", true)
      .gte("capacidad", adultos);

    if (domosErr || !domosComp || domosComp.length === 0) {
      return NextResponse.json({ error: "No hay domos con esa capacidad disponible" }, { status: 400 });
    }

    const domosPosibles = domosComp.map((d: any) => d.id);

    // 2. Buscar ocupación (reservas activas)
    // Traemos las reservas que coinciden en fecha y domo, sin filtrar estado aún en DB para poder validar expiración
    const { data: rawConflicts, error: resErr } = await supabaseAdmin
      .from("reservas")
      .select("domo_id, estado, expires_at, email")
      .in("domo_id", domosPosibles)
      .in("estado", ["pagado", "pendiente", "pendiente_pago", "confirmado", "pending_transfer_confirmation", "bloqueado"])
      .is("deleted_at", null)
      .lt("fecha_inicio", salida)
      .gt("fecha_fin", entrada);

    const now = new Date();

    // Filtramos en memoria:
    // - Pagadas/Confirmadas/Pendiente (manual) SIEMPRE ocupan.
    // - Pendientes de pago (Web): SOLO ocupan si el cliente ya ingresó sus datos (email).
    //   Si no hay email, es un carrito vacío/abandonado y NO debe bloquear el calendario.
    const ocupadosRes = (rawConflicts || []).filter((r: any) => {
      // Estados firmes bloquean siempre (incluye transferencia por confirmar y bloqueos técnicos)
      if (['pagado', 'confirmado', 'pendiente', 'pending_transfer_confirmation', 'bloqueado'].includes(r.estado)) return true;

      // Carrito web (pendiente_pago): bloquea solo si hay intención real (email)
      // Y la retención aún no vence. Un carrito abandonado libera el domo al expirar.
      if (r.estado === 'pendiente_pago') {
        const vigente = !r.expires_at || new Date(r.expires_at) > now;
        return !!r.email && vigente;
      }
      return false;
    });

    // 3. Buscar bloqueos
    const { data: ocupadosBloq, error: bloqErr } = await supabaseAdmin
      .from("bloqueos_calendario")
      .select("domo_id")
      .in("domo_id", domosPosibles)
      .lt("fecha_inicio", salida)
      .gt("fecha_fin", entrada);

    const idOcupados = new Set([
      ...ocupadosRes.map((r: any) => r.domo_id),
      ...(ocupadosBloq || []).map((b: any) => b.domo_id)
    ]);

    // Prioridad de asignación para reservas del sitio: Domo 4 → 3 → 1 → 2.
    // Los domos 3 y 4 son elevados y el 1 y 2 a piso: mientras el huésped no pueda
    // elegir el tipo, se entregan primero los elevados (que es lo que muestra el
    // sitio). En el administrador la elección es siempre manual.
    const PRIORIDAD_DOMOS = ["Domo 4", "Domo 3", "Domo 1", "Domo 2"];
    const ordenados = [...domosComp].sort((a: any, b: any) => {
      const ia = PRIORIDAD_DOMOS.indexOf(a.nombre), ib = PRIORIDAD_DOMOS.indexOf(b.nombre);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    const domoDisponible = ordenados.find((d: any) => !idOcupados.has(d.id));

    if (!domoDisponible) {
      return NextResponse.json({ error: "Lo sentimos, ya no quedan domos disponibles para estas fechas" }, { status: 409 });
    }

    // ── Validación de precio en el SERVIDOR (evita que el total venga manipulado) ──
    // Alojamiento: se recalcula con el mismo RPC que la web (incluye descuentos reales).
    // Servicios: se valoran con el precio REAL de la BD (no el que venga en el body).
    {
      const { data: precioData, error: precioErr } = await supabaseAdmin.rpc("calcular_precio", {
        p_fecha_inicio: entrada,
        p_fecha_fin: salida,
        p_adultos: adultos,
      });
      if (precioErr || !precioData || precioData.length === 0) {
        return NextResponse.json({ error: "No pudimos calcular el precio de estas fechas. Recarga la página e intenta de nuevo." }, { status: 400 });
      }
      const alojamientoServidor = Number(precioData[0].total) || 0;

      let serviciosServidor = 0;
      if (Array.isArray(servicios) && servicios.length > 0) {
        const ids = servicios.map((s: any) => s.id).filter(Boolean);
        const { data: servDb } = await supabaseAdmin.from("servicios").select("id, precio").in("id", ids);
        const precioDe = new Map((servDb || []).map((s: any) => [s.id, Number(s.precio) || 0]));
        for (const s of servicios) {
          const precio = precioDe.get(s.id) || 0;
          const cantidad = Math.max(0, Number(s.cantidad) || 0);
          serviciosServidor += precio * cantidad;
        }
      }

      const totalServidor = Math.round(alojamientoServidor + serviciosServidor);
      const totalCliente = Math.round(Number(total) || 0);
      // Tolerancia mínima por redondeos. Si difiere más, se rechaza (precio manipulado o vencido).
      if (totalCliente < alojamientoServidor - 1000 || Math.abs(totalCliente - totalServidor) > 1000) {
        console.warn(`[crear] Precio no coincide. cliente=${totalCliente} servidor=${totalServidor} (aloj=${alojamientoServidor}, serv=${serviciosServidor})`);
        return NextResponse.json({ error: "El precio no coincide o cambió. Por favor recarga la página e intenta de nuevo." }, { status: 400 });
      }
    }

    // Retención del domo mientras el huésped paga: 10 minutos.
    // Al vencer, el carrito deja de bloquear disponibilidad automáticamente.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 4. Insertar la reserva con fallback para columnas de descuento
    const nochesDiff = Math.round(
      (new Date(salida).getTime() - new Date(entrada).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalExtras = (servicios || []).reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0);
    const precioNoche = nochesDiff > 0 ? Math.round((total - totalExtras) / nochesDiff) : 0;

    const insertPayload: any = {
      fecha_inicio: entrada,
      fecha_fin: salida,
      adultos,
      total,
      precio_noche: precioNoche,
      domo_id: domoDisponible.id,
      estado: "pendiente_pago",
      expires_at: expiresAt,
      fuente: "WEB_NEW_PRICING",
      // Client data (critical for Transbank return flow)
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      // UTM Attribution — NUEVO
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
      utm_term: utm_term || null,
    };

    let { data, error } = await supabaseAdmin
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
      const retry = await supabaseAdmin
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

    // CRM: vincular o crear el cliente apenas nace la reserva (no bloqueante).
    await vincularClienteAReserva(data.id, {
      nombre,
      apellido,
      email,
      telefono,
      fuente: "web",
    });

    // 4. Insertar servicios si existen
    if (servicios && servicios.length > 0) {
      const serviciosInsert = servicios.map((s: any) => ({
        reserva_id: data.id,
        servicio_id: s.id,
        cantidad: s.cantidad,
        precio_unitario: s.precio_unitario,
        total: s.total
      }));

      const { error: servErr } = await supabaseAdmin
        .from("reserva_servicios")
        .insert(serviciosInsert);

      if (servErr) {
        console.error("Error insertando servicios:", servErr);
      }
    }

    // 4.b Alerta de capacidad de aseo: si el día de ENTRADA ya tiene 2+ salidas (aseos)
    // programadas, avisar por WhatsApp a la administración. No bloquea la reserva.
    try {
      const { data: salidasDia } = await supabaseAdmin
        .from("reservas")
        .select("id")
        .is("deleted_at", null)
        .eq("fecha_fin", entrada)
        .in("estado", ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation", "completada", "completado"])
        .neq("id", data.id);
      const aseos = salidasDia?.length || 0;
      if (aseos >= 2) {
        await sendWhatsAppAlert(
          `TreePod · Aviso de aseo\n` +
          `Nueva reserva web: ${nombre} ${apellido}\n` +
          `Entrada ${entrada} · Domo ${domoDisponible.nombre || domoDisponible.id}\n` +
          `Ese dia ya hay ${aseos} salidas/aseos. Por capacidad, evalua ingreso desde las 18:00. Revisa en el panel.`
        );
      }
    } catch (e) {
      console.error("Error en alerta de aseo (no bloquea la reserva):", e);
    }

    // 5. Registrar cobros históricos en reserva_cobros (inmutables, fuente de verdad para facturación)
    const cobros: any[] = [];
    if (precioNoche > 0) {
      cobros.push({
        reserva_id: data.id,
        tipo: 'hospedaje',
        concepto: 'Hospedaje',
        cantidad: nochesDiff,
        precio_unitario: precioNoche,
        total: precioNoche * nochesDiff,
        es_cortesia: false,
      });
    }
    for (const s of (servicios || [])) {
      cobros.push({
        reserva_id: data.id,
        tipo: 'extra',
        concepto: s.nombre || 'Extra',
        cantidad: s.cantidad || 1,
        precio_unitario: s.precio_unitario || 0,
        total: s.total || 0,
        es_cortesia: false,
      });
    }
    if (cobros.length > 0) {
      await supabaseAdmin.from("reserva_cobros").insert(cobros);
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
