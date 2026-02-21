import { NextResponse } from 'next/server';
import { NotificationService } from '@/services/NotificationService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const result = await NotificationService.sendContactNotification({
            name,
            email,
            subject: subject || 'Consulta Web',
            message
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Email failed' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Contact Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
