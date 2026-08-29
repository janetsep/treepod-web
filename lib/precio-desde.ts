import { supabase } from "@/lib/supabase";

// FUENTE ÚNICA del precio "desde" que se publica en el sitio.
//
// Antes esto vivía en dos partes: aquí (que usaba ValueBand) y una consulta
// propia dentro de /api/public/tarifa-desde (que usan la barra fija, el widget
// de reserva, /domos y /disponibilidad). Las dos leían las mismas tablas con
// reglas distintas — una filtraba noches_min >= 2 y la otra tomaba el mínimo
// absoluto — así que podían publicar precios diferentes en la misma página sin
// que nadie se enterara. Con los datos de hoy coincidían en todas las
// temporadas cargadas, pero era cuestión de cargar una tarifa de una noche más
// barata para que se separaran. Ahora hay una sola regla y el endpoint es una
// envoltura de esta función.
//
// La regla comercial: tarifa de la temporada vigente, para 2 ADULTOS (la
// reserva típica) y estadías de 2 NOCHES O MÁS. La de una noche se informa
// aparte porque es más cara y anunciarla como "desde" seria enganar.

export type PrecioDesde = {
  precio: number | null;      // "desde $X por noche", 2 personas, 2+ noches
  nochesMin: number;          // noches minimas de esa tarifa
  unaNoche: number | null;    // tarifa de una sola noche, si existe
  temporada: string | null;   // nombre de la temporada vigente
};

type FilaTarifa = {
  precio_noche: number | null;
  adultos: number | null;
  noches_min: number | null;
  noches_max: number | null;
};

export async function precioDesde(): Promise<PrecioDesde> {
  const VACIO: PrecioDesde = { precio: null, nochesMin: 2, unaNoche: null, temporada: null };
  try {
    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

    // Una temporada temporal superpuesta puede tener mayor prioridad que la
    // base: gana la de prioridad más alta que contenga la fecha de hoy.
    const { data: temporada } = await supabase
      .from("temporadas")
      .select("nombre, tarifas(precio_noche, adultos, noches_min, noches_max)")
      .eq("activa", true)
      .lte("fecha_inicio", hoy)
      .gte("fecha_fin", hoy)
      .order("prioridad", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!temporada) return VACIO;

    const tarifas: FilaTarifa[] = (temporada.tarifas as FilaTarifa[]) || [];
    const deDos = tarifas.filter(
      (t) => Number(t.adultos) === 2 && Number(t.noches_min) >= 2 && Number(t.precio_noche) > 0
    );
    const masBarata = deDos.length
      ? deDos.reduce((a, b) => (Number(a.precio_noche) <= Number(b.precio_noche) ? a : b))
      : null;

    const unaNoche = tarifas
      .filter(
        (t) =>
          Number(t.adultos) === 2 &&
          Number(t.noches_min) === 1 &&
          Number(t.noches_max) === 1 &&
          Number(t.precio_noche) > 0
      )
      .map((t) => Number(t.precio_noche))
      .sort((a, b) => a - b)[0];

    return {
      precio: masBarata ? Number(masBarata.precio_noche) : null,
      nochesMin: masBarata ? Number(masBarata.noches_min) || 2 : 2,
      unaNoche: unaNoche ?? null,
      temporada: (temporada.nombre as string) ?? null,
    };
  } catch {
    // Sin dato es preferible a un precio inventado: quien consume esto ya
    // sabe no mostrar la banda si `precio` viene en null.
    return VACIO;
  }
}

export const fmtCLP = (n: number) => "$" + n.toLocaleString("es-CL");
