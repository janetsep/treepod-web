import { NextResponse } from "next/server";
import { NotificationService } from "@/services/NotificationService";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Tipos de alerta permitidos (evita que se use este endpoint para enviar correos arbitrarios).
const TIPOS_VALIDOS = new Set(["signup", "unauthorized_access", "login_success", "login_failed", "login_attempt"]);
// Solo estos tipos disparan un correo real. El resto se acepta pero NO notifica
// (así no llega un correo por cada login/signup, solo por accesos no autorizados).
const TIPOS_NOTIFICAR = new Set(["unauthorized_access"]);

export async function POST(request: Request) {
    try {
        // Antispam: este endpoint es público (lo llama el login antes de autenticar).
        // Límite por IP para que no se abuse del envío de correos vía Resend.
        if (!rateLimit(`security-alert:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
            return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
        }

        const body = await request.json();
        const { type, email, details } = body;

        if (!type || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (!TIPOS_VALIDOS.has(String(type))) {
            return NextResponse.json({ error: "Tipo de alerta no válido" }, { status: 400 });
        }

        // Solo se envía correo para eventos NO autorizados. El resto se registra sin notificar.
        if (!TIPOS_NOTIFICAR.has(String(type))) {
            return NextResponse.json({ success: true, notified: false });
        }

        // Recortar el detalle para evitar inyección de contenido extenso en el correo.
        const detailsSeguro = typeof details === "string" ? details.slice(0, 500) : details;

        await NotificationService.sendSecurityAlert(String(type), { email: String(email).slice(0, 120), details: detailsSeguro });

        return NextResponse.json({ success: true, notified: true });
    } catch (error: any) {
        console.error("❌ Error en API security-alert:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
