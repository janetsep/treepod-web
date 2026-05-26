import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// IDs de domos habilitados para exportar iCal (solo los que están en Airbnb)
const DOMOS_AIRBNB: Record<string, string> = {
  "18e83b14-554d-4c11-ae24-a6c1b936af67": "Domo 3",
  "ac7d3717-8049-4c09-9773-2905ae5f5c37": "Domo 4",
};

function formatICalDate(dateStr: string): string {
  // dateStr viene como "YYYY-MM-DD" → convertir a "YYYYMMDD"
  return dateStr.replace(/-/g, "");
}

function addOneDayStr(dateStr: string): string {
  // Suma 1 día a una fecha "YYYY-MM-DD" y devuelve "YYYYMMDD"
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domoId: string }> }
) {
  const { domoId } = await params;

  // Solo permitir domos que están en Airbnb
  if (!DOMOS_AIRBNB[domoId]) {
    return new NextResponse("Domo no encontrado o no habilitado para iCal", {
      status: 404,
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Traer reservas activas (no canceladas) para este domo, desde hace 30 días en adelante
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  const desdeStr = desde.toISOString().slice(0, 10);

  const { data: reservas, error } = await supabase
    .from("reservas")
    .select("id, fecha_inicio, fecha_fin, nombre, apellido, estado, fuente, airbnb_uid, notas")
    .eq("domo_id", domoId)
    // No exportar reservas borradas (papelera) ni estados que no ocupan realmente
    .is("deleted_at", null)
    .not("estado", "in", "(cancelada,rechazado,expirada)")
    .gte("fecha_fin", desdeStr)
    // Excluir bloqueos automáticos de Airbnb ("Not available") que no son reservas reales
    .not("apellido", "ilike", "%(Not available)%")
    .order("fecha_inicio", { ascending: true });

  if (error) {
    console.error("Error obteniendo reservas para iCal:", error);
    return new NextResponse("Error interno", { status: 500 });
  }

  const domoNombre = DOMOS_AIRBNB[domoId];
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z"); // resultado: 20260513T183431Z (un solo Z)

  // Construir el iCal
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TreePod Glamping//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:TreePod ${domoNombre} - Reservas`,
    "X-WR-TIMEZONE:America/Santiago",
    "X-WR-CALDESC:Calendario de ocupación TreePod Glamping Las Trancas",
    // Definición de zona horaria Chile (necesaria para DTSTART/DTEND con TZID)
    "BEGIN:VTIMEZONE",
    "TZID:America/Santiago",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0400",
    "TZNAME:CLT",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0300",
    "TZNAME:CLST",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];

  for (const reserva of reservas || []) {
    // Check-in: día de llegada a las 16:00 hora Chile
    const dtstart = formatICalDate(reserva.fecha_inicio) + "T160000";

    // Convención de fecha_fin difiere según origen:
    // - Reservas importadas desde Airbnb (airbnb_uid IS NOT NULL):
    //   fecha_fin = última noche de estadía → checkout = fecha_fin + 1 día
    // - Reservas WEB / manuales / airbnb sin uid:
    //   fecha_fin = día de checkout (día en que sale el huésped) → usar directo
    const isAirbnbSynced = reserva.fuente === "airbnb" && reserva.airbnb_uid;
    const checkoutDayStr = isAirbnbSynced
      ? addOneDayStr(reserva.fecha_fin)
      : formatICalDate(reserva.fecha_fin);
    const dtend = checkoutDayStr + "T120000";

    const uid = `treepod-${reserva.id}@domostreepod.cl`;
    // Para bloqueos manuales mostramos el motivo (de las notas), no un nombre de huésped
    const summary = escapeICalText(
      reserva.estado === "bloqueado"
        ? `Bloqueado${reserva.notas ? ` - ${reserva.notas}` : ""}`
        : `Reservado - ${reserva.nombre ?? ""} ${reserva.apellido ?? ""}`.trim()
    );

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;TZID=America/Santiago:${dtstart}`);
    lines.push(`DTEND;TZID=America/Santiago:${dtend}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`STATUS:CONFIRMED`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const icalContent = lines.join("\r\n");

  return new NextResponse(icalContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${domoNombre.replace(" ", "-")}-reservas.ics"`,
      // Sin cache para que Airbnb siempre vea datos frescos
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
