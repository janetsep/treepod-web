import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getVerifiedAdmin } from '@/lib/admin-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Identidad verificada por token de sesión (no por el body)
    const admin = await getVerifiedAdmin(req);
    if (!admin || admin.rol !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado para realizar esta acción' }, { status: 403 });
    }
    const adminUser = { rol: admin.rol, nombre: admin.nombre };
    const adminEmail = admin.email;

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // 1. Intentar obtener el usuario por ID o Email para asegurar que existe en Auth
    let targetAuthUserId = userId;
    
    // Si el ID parece no ser de Auth (por ejemplo, si viene de authorized_admins y no coinciden)
    // Buscamos al usuario en authorized_admins para tener su email
    const { data: targetData } = await supabaseAdmin
        .from('authorized_admins')
        .select('email, nombre')
        .eq('id', userId)
        .single();
    
    const targetEmail = targetData?.email;

    if (targetEmail) {
        // Buscar en la lista de usuarios de Auth
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (!listError) {
            const authUser = authUsers.users.find(u => u.email === targetEmail);
            if (authUser) {
                targetAuthUserId = authUser.id;
            }
        }
    }

    // 2. Cambiar la contraseña usando el Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      targetAuthUserId,
      { password: newPassword }
    );

    if (error) {
      console.error("Error updating password:", error);
      return NextResponse.json({ error: `Error de Auth: ${error.message}` }, { status: 500 });
    }

    // Loggear la acción con más detalle
    await supabaseAdmin.from('admin_access_logs').insert({
        email: adminEmail,
        action: 'password_reset',
        details: `El administrador ${adminUser.nombre} cambió la contraseña de ${targetData?.nombre || 'usuario'} (${targetEmail || userId}).`
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
