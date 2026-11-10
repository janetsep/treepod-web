const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

// Solo se abre la consulta con una estadía completa. Así nunca se envían
// placeholders vacíos ni rangos invertidos a WhatsApp.
export function crearEnlaceConsultaTinaja(entrada: string, salida: string, adultos: number): string | null {
  if (!FECHA_ISO.test(entrada) || !FECHA_ISO.test(salida) || salida <= entrada) return null;
  const huespedes = Math.min(4, Math.max(1, Number(adultos) || 2));
  const texto = `Hola, ¿hay tinaja disponible del ${entrada} al ${salida} para ${huespedes} ${huespedes === 1 ? "persona" : "personas"}? ¿Cuánto cuesta la estadía con tinaja incluida?`;
  return `https://wa.me/56984643307?text=${encodeURIComponent(texto)}`;
}
