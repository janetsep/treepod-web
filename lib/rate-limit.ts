// Rate limiter en memoria (best-effort). En serverless es por-instancia; para protección
// fuerte conviene un store distribuido (Upstash Redis / Vercel KV). Sirve como primera capa
// de defensa contra abuso/spam desde una misma IP, sin costo.
const hits = new Map<string, number[]>();

/** Devuelve true si se permite la petición; false si excede el límite. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  // Limpieza ocasional para no crecer sin límite
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > windowMs)) hits.delete(k);
    }
  }
  return true;
}

/** IP del cliente a partir de las cabeceras del proxy. */
export function clientIp(req: Request): string {
  const h = req.headers;
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
