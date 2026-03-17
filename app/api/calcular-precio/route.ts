import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data, error } = await supabase.rpc(
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

    console.log("✅ Precio base calculado:", data[0]);

    // Lógica de Descuento por Anticipación (Revenue Management)
    // Regla: 10% de descuento si la reserva es con más de 30 días de anticipación
    const fechaReserva = new Date();
    const diasAnticipacion = Math.ceil((new Date(entrada).getTime() - fechaReserva.getTime()) / (1000 * 60 * 60 * 24));

    let precioFinal = data[0].total; // Asumiendo que el RPC retorna un objeto con campo 'total' o similar. 
    // Nota: El RPC probablemente retorna el precio total. Ajustaremos el objeto de respuesta.
    // Si data[0] es un número o un objeto, necesitamos asegurarnos.
    // Revisando logs anteriores o asumiendo estructura estándar. 
    // Vamos a trabajar sobre el objeto data[0] directamente
    let respuestaPrecio = { ...data[0] };
    const precioBase = respuestaPrecio.total;
    let descuentoTotal = 0;
    const motivosDescuento: { motivo: string; monto: number }[] = [];

    // 1. Descuento por anticipación (> 30 días)
    if (diasAnticipacion > 30) {
      const descAnticipacion = Math.round(precioBase * 0.10);
      descuentoTotal += descAnticipacion;
      motivosDescuento.push({ motivo: `Anticipación (${diasAnticipacion} días)`, monto: descAnticipacion });
    }

    // 2. Descuento por cupón
    if (cupon && cupon.toUpperCase() === "TREEPOD10") {
      const descCupon = Math.round(precioBase * 0.10);
      descuentoTotal += descCupon;
      motivosDescuento.push({ motivo: "Cupón TREEPOD10 (10%)", monto: descCupon });
    }

    const total = precioBase - descuentoTotal;

    console.log(`💰 Descuentos aplicados:`, motivosDescuento, ` - Total Descuento: ${descuentoTotal}`);

    return NextResponse.json({
      success: true,
      ...data[0],
      total,
      precio_original: precioBase,
      descuento_aplicado: descuentoTotal > 0 ? {
        monto: descuentoTotal,
        porcentaje: Math.round((descuentoTotal / precioBase) * 100),
        motivos: motivosDescuento
      } : null
    });
  } catch (error: any) {
    console.error("❌ Error en calcular-precio:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
