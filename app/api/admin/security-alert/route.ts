import { NextResponse } from "next/server";
import { NotificationService } from "@/services/NotificationService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, email, details } = body;

        if (!type || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`🛡️ Recibida alerta de seguridad API: ${type} para ${email}`);

        // Aquí usamos el servicio que ya existe (que usa Resend y es seguro en el servidor)
        await NotificationService.sendSecurityAlert(type, { email, details });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Error en API security-alert:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
