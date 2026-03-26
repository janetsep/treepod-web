import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entrada, salida, adultos, cupon } = body;

    console.log("🚀 API calcular-precio llamada con:", { entrada, salida, adultos });

    if (!entrada || !salida || !adultos) {
      console.warn("⚠️ Datos incompletos recibidos");
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Error: Variables de entorno de Supabase no configuradas");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    console.log("🔗 Conectando a Supabase en:", supabaseUrl);

    const { data, error } = await supabaseAdmin.rpc(
      "calcular_precio",
      {
        p_fecha_inicio: entrada,
        p_fecha_fin: salida,
        p_adultos: adultos,
      }
    );

    if (error) {
      console.error("❌ Error en RPC de Supabase:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No se encontró tarifa para los parámetros dados");
      return NextResponse.json(
        { error: "No se encontró tarifa para estas fechas" },
        { status: 404 }
      );
    }

    console.log("✅ Precio calculado:", data[0]);

    return NextResponse.json({
      success: true,
      ...data[0],
      precio_original: data[0].total,
      descuento_aplicado: null
    });
  } catch (error: any) {
    console.error("❌ Error en calcular-precio:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
