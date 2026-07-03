// Integración con Knasta (knasta.cl), agregador de precios chileno.
// Cubre, de supermercados: Líder (Walmart) y Santa Isabel (Cencosud, mismo grupo
// que Jumbo → buen referente del precio Jumbo). NO cubre Jumbo ni Unimarc directo.
// Lee la página /results?q=<termino> (Next.js con JSON embebido en __NEXT_DATA__).
// Sin captcha. Úsese con baja frecuencia para no abusar del servicio.

export interface PrecioSuper {
  supermercado: string;       // "lider" | "santaisabel"
  etiqueta: string;           // label legible
  titulo: string;             // título exacto del producto que matcheó (verificable)
  precio: number;
  url: string;
  en_oferta: boolean;
  porcentaje: number | null;  // % de variación que reporta Knasta (si existe)
}

// Palabras que delatan que NO es el abarrote buscado (perfumería, aseo personal, etc.).
const RUIDO = [
  "perfume", "edp", "edt", "colonia", "exfoliante", "crema", "shampoo", "jabon corporal",
  "cabello", "corporal facial", "labial", "mascara", "esmalte", "tarro", "bote ", "kit ",
  "organizador", "bandeja organizadora", "sucedaneo", "vela", "difusor",
];

// Retails de SUPERMERCADO (abarrotes). Ojo: "lider" es el marketplace de Líder
// (trae basura: perfumes, electro), así que SOLO usamos el supermercado real.
const SUPERMERCADOS: Record<string, string> = {
  lider_supermercado: "Líder",
  santaisabel: "Santa Isabel",
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

function normaliza(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Extrae el tamaño/cantidad de un texto, normalizado a una base comparable:
// masa → gramos, volumen → ml, o un número "suelto" (base '?') si no hay unidad clara.
function tamano(text: string): { base: "g" | "ml" | "?"; v: number } | null {
  const t = text.toLowerCase().replace(",", ".");
  const m = t.match(/(\d+(?:\.\d+)?)\s*(kgs?|kilos?|grs?|gramos?|g|ml|cc|lts?|litros?|l)\b/);
  if (m) {
    const v = parseFloat(m[1]);
    const u = m[2];
    if (/^(kg|kgs|kilo)/.test(u)) return { base: "g", v: v * 1000 };
    if (/^(g|gr|grs|gramo)/.test(u)) return { base: "g", v };
    if (u === "ml" || u === "cc") return { base: "ml", v };
    return { base: "ml", v: v * 1000 }; // l, lt, litro
  }
  const n = t.match(/\b(\d{2,4})\b/); // número suelto tipo "750"
  if (n) return { base: "?", v: parseFloat(n[1]) };
  return null;
}

// Quita el tamaño del término para la CONSULTA a Knasta (su buscador funciona peor
// con "900ml" pegado; el tamaño se filtra localmente con mismoTamano).
function quitarTamano(term: string): string {
  return term
    .replace(/\d+(?:[.,]\d+)?\s*(kgs?|kilos?|grs?|gramos?|g|ml|cc|lts?|litros?|l)\b/gi, "")
    .replace(/\b\d{2,4}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ¿El candidato tiene el MISMO tamaño que el objetivo? (mismo producto y cantidad)
function mismoTamano(objetivo: ReturnType<typeof tamano>, titulo: string): boolean {
  if (!objetivo) return true;               // el término no especifica tamaño → no filtra
  const cand = tamano(titulo);
  if (!cand) return false;                  // el candidato no declara tamaño → descartar
  if (objetivo.base === "?" || cand.base === "?") return Math.abs(objetivo.v - cand.v) < 1;
  if (objetivo.base !== cand.base) return false;
  return Math.abs(objetivo.v - cand.v) <= objetivo.v * 0.05; // tolerancia 5%
}

// Una opción concreta (marca + tamaño) encontrada en una tienda.
export interface Alternativa {
  supermercado: string;
  etiqueta: string;
  marca: string;
  titulo: string;
  precio: number;
  url: string;
  en_oferta: boolean;
}

// Núcleo compartido: busca el término en Knasta y devuelve TODOS los candidatos
// válidos (mismo producto y tamaño, cualquier marca, solo supermercados).
async function candidatosKnasta(termino: string): Promise<{ url: string; items: any[] }> {
  const tamObjetivo = tamano(termino);
  const consulta = quitarTamano(termino) || termino; // se busca sin el tamaño
  const url = `https://knasta.cl/results?q=${encodeURIComponent(consulta)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, cache: "no-store" });
  if (!res.ok) return { url, items: [] };
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return { url, items: [] };
  let productos: any[] = [];
  try {
    productos = JSON.parse(m[1])?.props?.pageProps?.initialData?.products || [];
  } catch {
    return { url, items: [] };
  }

  // Palabras que deben aparecer (marca/producto), EXCLUYENDO números y unidades.
  const UNIDADES = new Set(["kg", "kgs", "kilo", "kilos", "g", "gr", "grs", "gramo", "gramos", "ml", "cc", "l", "lt", "lts", "litro", "litros", "un", "u", "unidad", "unidades"]);
  const palabras = normaliza(consulta).split(/\s+/).filter((w) => w.length > 2 && !/\d/.test(w) && !UNIDADES.has(w));

  const puntuar = (titulo: string): number | null => {
    const t = normaliza(titulo);
    if (palabras.length === 0) return 0;
    if (!palabras.every((w) => t.includes(w))) return null;
    if (palabras.some((w) => t.includes(`sin ${w}`))) return null;
    if (RUIDO.some((r) => t.includes(r))) return null;
    const tokens = t.split(/\s+/);
    const pos = tokens.indexOf(palabras[0]);
    return pos === 0 ? 3 : pos === 1 ? 2 : pos > 1 ? 1 : 0;
  };

  const items: any[] = [];
  for (const p of productos) {
    if (!SUPERMERCADOS[p?.retail]) continue;
    if (!(Number(p?.current_price) > 0)) continue;
    const score = puntuar(p?.title || "");
    if (score == null) continue;
    if (!mismoTamano(tamObjetivo, p?.title || "")) continue; // mismo tamaño/cantidad
    items.push({ ...p, _score: score });
  }
  return { url, items };
}

// Devuelve, por supermercado, la MEJOR coincidencia (término líder, más barata).
export async function buscarKnasta(termino: string): Promise<PrecioSuper[]> {
  const { url, items } = await candidatosKnasta(termino);
  const porSuper: Record<string, any[]> = {};
  for (const it of items) (porSuper[it.retail] ||= []).push(it);

  const resultado: PrecioSuper[] = [];
  for (const [retail, arr] of Object.entries(porSuper)) {
    arr.sort((a, b) => b._score - a._score || Number(a.current_price) - Number(b.current_price));
    const best = arr[0];
    const pct = best?.percent != null ? Number(best.percent) : null;
    resultado.push({
      supermercado: retail,
      etiqueta: SUPERMERCADOS[retail],
      titulo: best.title,
      precio: Number(best.current_price),
      url: best.url || url,
      en_oferta: best.is_best_price === true || (pct != null && pct < 0),
      porcentaje: pct,
    });
  }
  return resultado.sort((a, b) => a.supermercado.localeCompare(b.supermercado));
}

// Devuelve TODAS las opciones del mismo producto y tamaño (todas las marcas, todas
// las tiendas), ordenadas de más barata a más cara. Para el comparador con alternativas.
export async function alternativasKnasta(termino: string): Promise<Alternativa[]> {
  const { url, items } = await candidatosKnasta(termino);
  const seen = new Set<string>();
  const alts: Alternativa[] = [];
  for (const p of items) {
    const clave = `${p.retail}|${normaliza(p.title || "")}`;
    if (seen.has(clave)) continue;
    seen.add(clave);
    const pct = p?.percent != null ? Number(p.percent) : null;
    alts.push({
      supermercado: p.retail,
      etiqueta: SUPERMERCADOS[p.retail] || p.retail,
      marca: p.brand || p.brand_title || "",
      titulo: p.title,
      precio: Number(p.current_price),
      url: p.url || url,
      en_oferta: p.is_best_price === true || (pct != null && pct < 0),
    });
  }
  return alts.sort((a, b) => a.precio - b.precio);
}
