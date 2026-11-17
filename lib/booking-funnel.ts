/** Read-only reporting. No guest identifiers or payment tokens leave the server. */
export const FUNNEL_EVENTS = [
  'view_disponibilidad', 'availability_checked', 'view_pricing_result',
  'click_reservar', 'click_reservar_sticky', 'reservation_created',
  'webpay_token_created', 'webpay_redirect_started', 'purchase',
  'availability_check_failed', 'pricing_failed', 'reservation_create_failed', 'webpay_start_failed',
  'checkout_email_missing', 'checkout_email_invalid', 'checkout_dates_unavailable',
  'checkout_reservation_failed', 'checkout_webpay_failed', 'click_whatsapp_reserva',
] as const;
export type GaReport = {
  dimensionHeaders?: {name: string}[];
  metricHeaders?: {name: string}[];
  rows?: {dimensionValues?: {value?: string}[]; metricValues?: {value?: string}[]}[];
  metadata?: Record<string, unknown>;
};
export type ReportClient = {request: <T>(options: {url: string; method: 'POST'; data: unknown; timeout: number}) => Promise<{data: T}>};
export type Period = {start: string; end: string; today: string; from: string; until: string};
const timezone = 'America/Santiago';
export function chileDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(date);
  return ['year','month','day'].map(type => parts.find(p => p.type === type)!.value).join('-');
}
function nextDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0,10);
}
/** Find the first instant of a Chile calendar day, including skipped DST midnight. */
export function chileDayStart(day: string) {
  let low = Date.parse(`${day}T00:00:00Z`) - 12 * 3600000;
  let high = low + 48 * 3600000;
  while (high - low > 1) {
    const mid = Math.floor((high + low) / 2);
    if (chileDate(new Date(mid)) < day) low = mid; else high = mid;
  }
  return new Date(high).toISOString();
}
export function reportPeriod(params: URLSearchParams, now = new Date()): Period {
  const today = chileDate(now);
  const start = params.get('desde') || `${today.slice(0,7)}-01`;
  const end = params.get('hasta') || today;
  const valid = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(`${s}T12:00:00Z`).toISOString().slice(0,10) === s;
  if (!valid(start) || !valid(end) || start > end || end > today || Date.parse(end) - Date.parse(start) > 92 * 86400000) {
    throw new Error('Elige un periodo válido de hasta 93 días, sin fechas futuras.');
  }
  return {start, end, today, from: chileDayStart(start), until: chileDayStart(nextDate(end,1))};
}
const filterEvents = (values: string[]) => ({filter: {fieldName: 'eventName', inListFilter: {values}}});
export const ORDERED_STEPS = [
  {id: 'precio', label: 'Vieron precio', events: ['view_pricing_result']},
  {id: 'reservar', label: 'Presionaron Reservar', events: ['click_reservar','click_reservar_sticky']},
  {id: 'webpay', label: 'Salida hacia Webpay', events: ['webpay_redirect_started']},
  {id: 'compra', label: 'Compra medida en GA4', events: ['purchase']},
];
export function orderedFunnelRequest(period: Period) {
  return {
    dateRanges: [{startDate: period.start, endDate: period.end}],
    funnel: {isOpenFunnel: false, steps: ORDERED_STEPS.map(step => ({
      name: step.id, isDirectlyFollowedBy: false,
      filterExpression: {orGroup: {expressions: step.events.map(eventName => ({funnelEventFilter: {eventName}}))}},
    }))},
  };
}
export function parseOrderedFunnel(report: GaReport) {
  const usersIndex = report.metricHeaders?.findIndex(h => h.name === 'activeUsers') ?? -1;
  if (usersIndex < 0) throw new Error('Funnel report missing metric');
  const rows = report.rows || [];
  const expected = ORDERED_STEPS.map((step,i) => `${i+1}. ${step.id}`);
  if (rows.some(row => !expected.includes(row.dimensionValues?.[0]?.value || ''))) throw new Error('Unknown funnel step');
  const steps = ORDERED_STEPS.map((step, index) => {
    const row = rows.find(row => row.dimensionValues?.[0]?.value === `${index+1}. ${step.id}`);
    const users = row ? Number(row.metricValues?.[usersIndex]?.value) : 0;
    if (!Number.isSafeInteger(users) || users < 0) throw new Error('Invalid funnel count');
    return {id: step.id, label: step.label, users};
  });
  if (steps.some((step,i) => i > 0 && step.users > steps[i-1].users)) throw new Error('Inconsistent funnel sequence');
  return steps.map((step,i) => ({...step,
    lost: i < steps.length-1 ? step.users - steps[i+1].users : null,
    lossRate: i < steps.length-1 && step.users > 0 ? (step.users - steps[i+1].users) / step.users * 100 : null,
  }));
}
export async function fetchGaBookingFunnel(client: ReportClient, period: Period) {
  const base = 'https://analyticsdata.googleapis.com';
  const dateRanges = [{startDate: period.start, endDate: period.end}];
  const request = <T>(path: string, data: unknown) => client.request<T>({url: `${base}/${path}`, method: 'POST', data, timeout: 12000});
  const [events, buttons, sequence] = await Promise.allSettled([
    request<GaReport>('v1beta/properties/357898604:runReport', {dateRanges, dimensions: [{name:'eventName'}], metrics: [{name:'totalUsers'},{name:'eventCount'}], dimensionFilter: filterEvents([...FUNNEL_EVENTS])}),
    request<GaReport>('v1beta/properties/357898604:runReport', {dateRanges, metrics: [{name:'totalUsers'},{name:'eventCount'}], dimensionFilter: filterEvents(['click_reservar','click_reservar_sticky'])}),
    request<{funnelTable: GaReport}>('v1alpha/properties/357898604:runFunnelReport', orderedFunnelRequest(period)),
  ]);
  if (events.status !== 'fulfilled' || buttons.status !== 'fulfilled') throw new Error('GA4 unavailable');
  for (const report of [events.value.data, buttons.value.data]) {
    if (report.metricHeaders?.[0]?.name !== 'totalUsers' || report.metricHeaders?.[1]?.name !== 'eventCount') throw new Error('Invalid GA metrics');
    for (const row of report.rows || []) {
      for (const metric of row.metricValues || []) {
        if (!Number.isSafeInteger(Number(metric.value)) || Number(metric.value)<0) throw new Error('Invalid GA count');
      }
    }
  }
  const counts: Record<string,{users:number; events:number}> = Object.fromEntries(FUNNEL_EVENTS.map(e => [e,{users:0,events:0}]));
  for (const row of events.value.data.rows || []) {
    const name = row.dimensionValues?.[0]?.value;
    if (name && name in counts) counts[name] = {users: Number(row.metricValues?.[0]?.value || 0), events: Number(row.metricValues?.[1]?.value || 0)};
  }
  const buttonRow = buttons.value.data.rows?.[0];
  const reserve = {users: Number(buttonRow?.metricValues?.[0]?.value || 0), events: Number(buttonRow?.metricValues?.[1]?.value || 0)};
  // The two CTAs are a union calculated by GA4, never a sum of user counts.
  let ordered = null;
  if (sequence.status === 'fulfilled') {
    try { ordered = parseOrderedFunnel(sequence.value.data.funnelTable); } catch { /* Separate counts remain available. */ }
  }
  return {counts, reserve, ordered, metadata: events.value.data.metadata || {}, sequenceMetadata: sequence.status === 'fulfilled' ? sequence.value.data.funnelTable.metadata || {} : {}, sequenceAvailable: ordered !== null};
}
export type FunnelGa = Awaited<ReturnType<typeof fetchGaBookingFunnel>>;
export type Attempt = {reserva_id: string; estado: string; monto: number|string; total_reserva: number|string; created_at: string; updated_at: string;
  reservas: {estado:string; total:number|string; monto_pagado:number|string; deleted_at:string|null; fuente:string|null; metadata?:{is_test?:boolean;analytics_test?:boolean}|null}|null};
export function summarizePayments(attempts: Attempt[], period: Period) {
  const eligible = attempts.filter(a => a.reservas && !a.reservas.deleted_at && !a.reservas.metadata?.is_test && !a.reservas.metadata?.analytics_test && Number(a.total_reserva)>500);
  const inPeriod = (date: string) => Date.parse(date) >= Date.parse(period.from) && Date.parse(date) < Date.parse(period.until);
  const started = eligible.filter(a => inPeriod(a.created_at));
  const paid = (a: Attempt) => a.estado === 'registrado' && a.reservas?.estado === 'pagado' && Number(a.monto)>0 && Number(a.monto)<=Number(a.total_reserva) && Number(a.reservas?.monto_pagado)>=Number(a.monto);
  const unique = (rows: Attempt[]) => new Set(rows.map(a => a.reserva_id)).size;
  const paidPeriod = [...new Map(eligible.filter(a => paid(a) && inPeriod(a.updated_at)).map(a => [a.reserva_id,a])).values()];
  const settledIds = new Set(eligible.filter(paid).map(a => a.reserva_id));
  return {startedReservations: unique(started), attempts: started.length,
    paidFromStarted: unique(started.filter(paid)), paidReservations: paidPeriod.length,
    paidAmount: paidPeriod.reduce((sum,a) => sum+Number(a.monto),0),
    bookingValue: paidPeriod.reduce((sum,a) => sum+Number(a.total_reserva),0),
    pendingReservations: unique(started.filter(a => !settledIds.has(a.reserva_id) && a.estado==='pendiente')),
    rejectedReservations: unique(started.filter(a => !settledIds.has(a.reserva_id) && a.estado==='rechazado')),
    reviewReservations: unique(started.filter(a => !settledIds.has(a.reserva_id) && a.estado==='revision')),
  };
}
export type FunnelPayments = ReturnType<typeof summarizePayments>;
export type FunnelResponse = {period: Period; fetchedAt: string; ga: FunnelGa|null; payments: FunnelPayments|null; warnings: string[]};
