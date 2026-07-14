import { NextResponse } from "next/server";

// Link corto de marca para pedir reseñas: domostreepod.cl/evalua
// Redirige al formulario "Escribir una reseña" del perfil de Google de TreePod.
export function GET() {
  return NextResponse.redirect(
    "https://search.google.com/local/writereview?placeid=ChIJLeBk77CVbpYROCttTaLeCpw",
    308
  );
}
