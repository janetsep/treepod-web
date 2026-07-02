import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";

// ─── Parser iCal mínimo (sin dependencias externas) ───────────────────────────

interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string; // YYYY-MM-DD (check-in)
  dtend: string;   // YYYY-MM-DD (día de checkout = DTEND del iCal, igual que las reservas web)
  description: string;
}

function parseICalDate(value: string): string {
  // Formatos posibles: "20260521" o "20260521T160000Z"
  const digits = value.replace(/T.*$/, "").trim();
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return digits;
}

function parseICalText(text: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = text
    .replace(/\r\n /g, "") // unfold continuation lines
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  let inEvent = false;
  let current: Partial<ICalEvent> = {};

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      inEvent = false;
      if (current.uid && current.dtstart && current.dtend) {
        // DTEND en iCal all-day es el día de checkout (exclusivo). Lo guardamos tal cual
        // para que fecha_fin signifique SIEMPRE el día de salida, consistente con las reservas web.
        events.push({
          uid: current.uid,
          summary: current.summary || "Reservado",
          dtstart: current.dtstart,
          dtend: current.dtend,
          description: current.description || "",
        });
      }
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).split(";")[0].toUpperCase();
    const value = line.slice(colonIdx + 1);

    switch (key) {
      case "UID":
        current.uid = value;
        break;
      case "SUMMARY":
        current.summary = value;
        break;
      case "DTSTART":
        current.dtstart = parseICalDate(value);
        break;
      case "DTEND":
        current.dtend = parseICalDate(value);
        break;
      case "DESCRIPTION":
        current.description = value.replace(/\\n/g, " ").replace(/\\,/g, ",");
        break;
    }
  }

  return events;
}

// ─── Extrae datos del huésped desde DESCRIPTION de Airbnb ────────────────────

function extractGuestInfo(summary: string, description: string): {
  nombre: string;
  apellido: string;
  notas: string;
} {
  // Airbnb summary suele ser: "RESERVADO - Nombre Apellido" o solo "Reserved"
  let nombre = "";
  let apellido = "";

  const summaryClean = summary.replace(/^(Reserved|Reservado|RESERVADO)\s*[-–]?\s*/i, "").trim();
  if (summaryClean && summaryClean.toLowerCase() !== "reserved") {
    const parts = summaryClean.split(" ");
    nombre = parts[0] || "";
    apellido = parts.slice(1).join(" ") || "";
  }

  // Intentar extraer nombre del DESCRIPTION si está disponible
  const nombreMatch = description.match(/(?:Guest|Huésped|Name):\s*([^\n\\]+)/i);
  if (nombreMatch) {
    const parts = nombreMatch[1].trim().split(" ");
    nombre = parts[0] || nombre;
    apellido = parts.slice(1).join(" ") || apellido;
  }

  // Airbnb no entrega el nombre por iCal: usar código de reserva (HM...) y teléfono parcial
  const codeMatch = description.match(/reservations\/details\/([A-Z0-9]+)/i);
  const phoneMatch = description.match(/Last 4 Digits\)?:\s*(\d{3,4})/i);
  const code = codeMatch ? codeMatch[1] : null;
  const phone = phoneMatch ? phoneMatch[1] : null;

  if (!nombre && !apellido) {
    nombre = "Reserva Airbnb";
    apellido = code || "sin código";
  }

  const notasParts: string[] = [];
  if (code) notasParts.push(`Código Airbnb: ${code}`);
  if (phone) notasParts.push(`Tel (últimos 4): ${phone}`);
  if (description) notasParts.push(description.slice(0, 400));

  return { nombre, apellido, notas: notasParts.join(" · ") };
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Proteger con CRON_SECRET (Vercel lo envía automáticamente en cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // También puede ser invocado manualmente desde el admin
  const isManual = request.nextUrl.searchParams.get("manual") === "1";

  try {
    // 1. Obtener domos con URL iCal de Airbnb configurada
    const { data: domos, error: domosError } = await supabaseAdmin
      .from("domos")
      .select("id, nombre, airbnb_ical_url")
      .not("airbnb_ical_url", "is", null);

    if (domosError) throw domosError;

    if (!domos || domos.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No hay domos con airbnb_ical_url configurada",
        synced: 0,
      });
    }

    const results: Record<string, unknown>[] = [];

    for (const domo of domos) {
      const domoResult: Record<string, unknown> = {
        domo: domo.nombre,
        creadas: 0,
        actualizadas: 0,
        canceladas: 0,
        errores: [] as string[],
      };

      try {
        // 2. Fetch iCal de Airbnb
        const response = await fetch(domo.airbnb_ical_url, {
          headers: { "User-Agent": "TreePod-Sync/1.0" },
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} al obtener iCal de ${domo.nombre}`);
        }

        const icalText = await response.text();
        const events = parseICalText(icalText);

        // 3. Filtrar solo reservas reales de huéspedes
        const reservas = events.filter((e) => {
          // Ignorar eventos que nosotros exportamos (uid contiene nuestro dominio)
          if (e.uid.includes("domostreepod.cl")) return false;
          // Ignorar TODOS los bloqueos de calendario (reflejos de nuestro propio iCal)
          // Airbnb los devuelve con summary "Airbnb (Not available)" o "Not available"
          const summaryLower = e.summary.toLowerCase();
          if (summaryLower.includes("not available")) return false;
          if (summaryLower.includes("no disponible")) return false;
          if (summaryLower.includes("bloqueado")) return false;
          // Solo importar reservas reales ("Reserved")
          if (!summaryLower.includes("reserved") && !summaryLower.includes("reservado")) return false;
          return true;
        });

        // 4. Upsert cada reserva
        for (const event of reservas) {
          const { nombre, apellido, notas } = extractGuestInfo(event.summary, event.description);

          // Verificar si ya existe por airbnb_uid
          const { data: existing } = await supabaseAdmin
            .from("reservas")
            .select("id, fecha_inicio, fecha_fin")
            .eq("airbnb_uid", event.uid)
            .single();

          if (existing) {
            // Actualizar si cambiaron las fechas (modificación de reserva en Airbnb)
            if (
              existing.fecha_inicio !== event.dtstart ||
              existing.fecha_fin !== event.dtend
            ) {
              await supabaseAdmin
                .from("reservas")
                .update({
                  fecha_inicio: event.dtstart,
                  fecha_fin: event.dtend,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);

              (domoResult.actualizadas as number)++;
            }
          } else {
            // Antes de crear, verificar si ya existe una reserva manual con las mismas fechas
            // (ingresada antes de tener sync automático)
            const { data: existingManual } = await supabaseAdmin
              .from("reservas")
              .select("id")
              .eq("domo_id", domo.id)
              .eq("fecha_inicio", event.dtstart)
              .eq("fecha_fin", event.dtend)
              .in("fuente", ["airbnb", "manual_admin"])
              .is("airbnb_uid", null)
              .single();

            if (existingManual) {
              // Marcar la reserva existente con el UID para evitar duplicados futuros
              await supabaseAdmin
                .from("reservas")
                .update({ airbnb_uid: event.uid })
                .eq("id", existingManual.id);
              (domoResult.actualizadas as number)++;
              continue;
            }

            // Crear nueva reserva desde Airbnb
            const { data: nuevaReserva, error: insertError } = await supabaseAdmin
              .from("reservas")
              .insert({
                domo_id: domo.id,
                fecha_inicio: event.dtstart,
                fecha_fin: event.dtend,
                nombre,
                apellido,
                email: null,
                telefono: null,
                adultos: 2,
                total: 0,
                monto_pagado: 0,
                estado: "confirmado",
                fuente: "airbnb",
                notas: notas || null,
                airbnb_uid: event.uid,
                enviar_confirmacion: false,
                sincronizar_calendario: false,
              })
              .select("id")
              .single();

            if (insertError) {
              (domoResult.errores as string[]).push(
                `Error insertando ${event.uid}: ${insertError.message}`
              );
            } else {
              (domoResult.creadas as number)++;
              // 📅 Sincronizar la nueva reserva de Airbnb con Google Calendar (idempotente, no bloqueante)
              if (nuevaReserva?.id) {
                await NotificationService.syncReservaToCalendar({
                  id: nuevaReserva.id,
                  nombre,
                  apellido,
                  fecha_inicio: event.dtstart,
                  fecha_fin: event.dtend,
                  adultos: 2,
                  total: 0,
                  monto_pagado: 0,
                  estado: "confirmado",
                  fuente: "airbnb",
                  domoNombre: domo.nombre,
                });
              }
            }
          }
        }

        // 5. Reconciliación de CANCELACIONES: una reserva cancelada en Airbnb desaparece
        // del feed. Buscamos reservas de Airbnb en la BD (FUTURAS y activas) cuyo UID ya
        // no está en el feed y las marcamos "cancelada" → libera las fechas automáticamente.
        // Solo futuras: el iCal de Airbnb deja de listar las pasadas, y esas NO son cancelaciones.
        // RESGUARDO: solo reconciliar si el feed es un calendario válido (evita cancelar
        // reservas reales por un feed vacío/roto que igual devolvió 200).
        if (!icalText.includes("BEGIN:VCALENDAR")) {
          (domoResult.errores as string[]).push("Feed iCal inválido: se omitió la reconciliación de cancelaciones por seguridad.");
          results.push(domoResult);
          continue;
        }
        const uidsEnFeed = new Set(reservas.map((e) => e.uid));
        const hoyStr = new Date().toISOString().slice(0, 10);
        const { data: activasBd } = await supabaseAdmin
          .from("reservas")
          .select("id, airbnb_uid")
          .eq("domo_id", domo.id)
          .eq("fuente", "airbnb")
          .not("airbnb_uid", "is", null)
          .is("deleted_at", null)
          .gte("fecha_fin", hoyStr)
          .in("estado", ["confirmado", "pagado", "pendiente", "pending_transfer_confirmation"]);

        for (const r of activasBd || []) {
          if (r.airbnb_uid && !uidsEnFeed.has(r.airbnb_uid)) {
            const { error: cancelErr } = await supabaseAdmin
              .from("reservas")
              .update({ estado: "cancelada", updated_at: new Date().toISOString() })
              .eq("id", r.id);
            if (cancelErr) {
              (domoResult.errores as string[]).push(`Error cancelando ${r.airbnb_uid}: ${cancelErr.message}`);
            } else {
              (domoResult.canceladas as number)++;
            }
          }
        }
      } catch (err: unknown) {
        (domoResult.errores as string[]).push(
          err instanceof Error ? err.message : "Error desconocido"
        );
      }

      results.push(domoResult);
    }

    const totalCreadas = results.reduce((s, r) => s + (r.creadas as number), 0);
    const totalActualizadas = results.reduce((s, r) => s + (r.actualizadas as number), 0);
    const totalCanceladas = results.reduce((s, r) => s + (r.canceladas as number), 0);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      manual: isManual,
      domos_sincronizados: domos.length,
      total_creadas: totalCreadas,
      total_actualizadas: totalActualizadas,
      total_canceladas: totalCanceladas,
      detalle: results,
    });
  } catch (err: unknown) {
    console.error("Error en sync-airbnb:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Error interno",
      },
      { status: 500 }
    );
  }
}
