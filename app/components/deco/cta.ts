// Sistema de CTAs de la dirección "revista": una sola variante rellena
// ("sello de imprenta") y un enlace-línea como secundario. Rectangular siempre:
// la píldora se jubila. Texto CHARCOAL sobre cyan (contraste 6,1:1, pasa AA;
// el blanco sobre cyan da 2,6:1 y falla).

/* Botón primario: marco desfasado que se "alinea" al hover — la firma. */
export const btnPrimary =
  "relative z-0 inline-flex items-center justify-center gap-2.5 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-[15px] px-7 py-3.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1.5 after:translate-y-1.5 after:-z-10 after:transition-transform hover:after:translate-x-0.5 hover:after:translate-y-0.5";

/* Variante sobre fondos oscuros: el marco pasa a crema. */
export const btnPrimaryDark =
  "relative z-0 inline-flex items-center justify-center gap-2.5 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-[15px] px-7 py-3.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#F7F3EC]/70 after:translate-x-1.5 after:translate-y-1.5 after:-z-10 after:transition-transform hover:after:translate-x-0.5 hover:after:translate-y-0.5";

/* Enlace secundario "línea": texto charcoal con subraya cyan de 3px. */
export const linkLine =
  "inline-flex items-center gap-2 font-semibold text-[15px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors";

/* Enlace secundario sobre oscuro: texto crema, misma subraya cyan. */
export const linkLineDark =
  "inline-flex items-center gap-2 font-semibold text-[15px] text-[#F7F3EC] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors";
