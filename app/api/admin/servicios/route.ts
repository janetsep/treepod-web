import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Verifica sesión + rol con permiso de escritura para PUT/POST/DELETE
async function requireWriter(req: Request) {
    const admin = await getVerifiedAdmin(req);
    if (!admin) {
        return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
    }
    if (admin.rol === "viewer") {
        return NextResponse.json({ error: "Tu perfil es de solo lectura" }, { status: 403 });
    }
    return null;
}

export async function GET() {
    try {
        const { data: servicios, error } = await supabaseAdmin
            .from("servicios")
            .select("*")
            .order("nombre", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ servicios });
    } catch (error: any) {
        console.error("Error en GET /api/admin/servicios:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const denied = await requireWriter(req);
        if (denied) return denied;
        const body = await req.json();
        const { id, nombre, descripcion, precio, multiplicador_noches, multiplicador_personas, image_url, activo } = body;

        const { error } = await supabaseAdmin
            .from("servicios")
            .update({ nombre, descripcion, precio, multiplicador_noches, multiplicador_personas, image_url, activo })
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en PUT /api/admin/servicios:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const denied = await requireWriter(req);
        if (denied) return denied;
        const body = await req.json();
        const { nombre, descripcion, precio, multiplicador_noches, multiplicador_personas, image_url, activo } = body;

        const { error } = await supabaseAdmin
            .from("servicios")
            .insert({ nombre, descripcion, precio, multiplicador_noches, multiplicador_personas, image_url, activo });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en POST /api/admin/servicios:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const denied = await requireWriter(req);
        if (denied) return denied;
        const { id } = await req.json();

        const { error } = await supabaseAdmin
            .from("servicios")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error en DELETE /api/admin/servicios:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
