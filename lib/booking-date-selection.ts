/** Calendar dates are strings; keep Chile's booking cutoff independent of device timezone. */
export function nextCalendarDate(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0,10);
}
export function minimumBookingDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const part = (type: string) => parts.find(p=>p.type===type)!.value;
  const day = `${part('year')}-${part('month')}-${part('day')}`;
  return Number(part('hour')) >= 13 ? nextCalendarDate(day) : day;
}

export const bookingCutoffMessage = 'Las reservas web para llegar hoy cierran a las 13:00 (hora de Chile). Elige una llegada a partir de mañana.';
