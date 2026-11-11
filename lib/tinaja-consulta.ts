const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function esFechaIsoCalendarioValida(valor: string): boolean {
  if (!FECHA_ISO.test(valor)) return false;

  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(0);
  fecha.setUTCFullYear(anio, mes - 1, dia);
  return fecha.getUTCFullYear() === anio
    && fecha.getUTCMonth() === mes - 1
    && fecha.getUTCDate() === dia;
}

export function normalizarAdultos(valor: string | number): number {
  const adultos = Number(valor);
  if (!Number.isInteger(adultos) || adultos === 0) return 2;
  return Math.min(4, Math.max(1, adultos));
}

// Solo se abre la consulta con una estadía completa. Así nunca se envían
// placeholders vacíos ni rangos invertidos a WhatsApp.
export function crearEnlaceConsultaTinaja(entrada: string, salida: string, adultos: number): string | null {
  if (!esFechaIsoCalendarioValida(entrada) || !esFechaIsoCalendarioValida(salida) || salida <= entrada) return null;
  const huespedes = normalizarAdultos(adultos);
  const texto = `Hola, ¿hay tinaja disponible del ${entrada} al ${salida} para ${huespedes} ${huespedes === 1 ? "persona" : "personas"}? ¿Cuánto cuesta la estadía con tinaja incluida?`;
  return `https://wa.me/56984643307?text=${encodeURIComponent(texto)}`;
}
