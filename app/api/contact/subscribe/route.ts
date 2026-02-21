import { NextResponse } from 'next/server';
import { NotificationService } from '@/services/NotificationService';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }

        // 1. Guardar en base de datos si existe la tabla, sino solo notificar
        try {
            const { error: dbError } = await supabase
                .from('newsletter_subscriptions')
                .upsert({ email, created_at: new Date().toISOString() });

            if (dbError) {
                console.warn('⚠️ No se pudo guardar en DB (posible tabla inexistente):', dbError.message);
            }
        } catch (e) {
            console.warn('⚠️ Error al intentar guardar suscripción en DB');
        }

        // 2. Notificar al administrador
        await NotificationService.sendContactNotification({
            name: 'Nuevo Suscriptor',
            email: email,
            subject: 'Suscripción Newsletter',
            message: `El usuario con email ${email} se ha suscrito desde el Popup (Lead Magnet).`
        });

        // 3. Enviar correo de bienvenida/guía al usuario
        await NotificationService.sendGuideEmail(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Subscribe Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
