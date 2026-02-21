import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Configuración
const config = {
  commerceCode: process.env.WEBPAY_COMMERCE_CODE || process.env.TRANSBANK_COMMERCE_CODE || "597055555532",
  apiKey: process.env.WEBPAY_API_KEY || process.env.TRANSBANK_API_KEY || "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
  environment: process.env.WEBPAY_ENV || process.env.TRANSBANK_ENVIRONMENT || "INTEGRATION",
  apiUrl: (process.env.WEBPAY_ENV === "PRODUCTION" || process.env.TRANSBANK_ENVIRONMENT === "PRODUCTION")
    ? "https://webpay3g.transbank.cl"
    : "https://webpay3gint.transbank.cl"
};

// Función para crear transacción
async function createTransaction(amount: number, buyOrder: string, sessionId: string, returnUrl: string) {
  const url = `${config.apiUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`;

  console.log('🌐 Enviando petición a:', url);
  console.log('🔑 Headers:', {
    'Tbk-Api-Key-Id': config.commerceCode,
    'Tbk-Api-Key-Secret': '****' + config.apiKey.slice(-4)
  });
  console.log('📦 Body:', {
    buy_order: buyOrder,
    session_id: sessionId,
    amount: amount,
    return_url: returnUrl
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tbk-Api-Key-Id': config.commerceCode,
        'Tbk-Api-Key-Secret': config.apiKey
      },
      body: JSON.stringify({
        buy_order: buyOrder,
        session_id: sessionId,
        amount: amount,
        return_url: returnUrl
      })
    });

    const responseText = await response.text();
    console.log('📥 Respuesta de Transbank:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('❌ Error en la petición a Transbank:', error);
    throw error;
  }
}

function getBaseUrl(req: Request) {
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");

  if (host) {
    return `${proto}://${host}`;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  try {
    console.log('🔍 Iniciando proceso de pago...');
    const { reservaId } = await req.json();

    // Validación básica
    if (!reservaId) {
      console.log('❌ Error: No se proporcionó ID de reserva');
      return NextResponse.json(
        { error: "Se requiere el ID de la reserva" },
        { status: 400 }
      );
    }

    console.log('🔍 ID de reserva recibido:', {
      id: reservaId,
      tipo: typeof reservaId,
      longitud: reservaId.length
    });

    // 1. Verificar conexión y listar todas las reservas
    console.log('🔌 Verificando conexión con Supabase...');
    const { data: todasLasReservas, error: errorReservas } = await supabase
      .from('reservas')
      .select('id, total, estado, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (errorReservas) {
      console.error('❌ Error al conectar con Supabase:', errorReservas);
      return NextResponse.json(
        {
          error: "Error al conectar con la base de datos",
          details: errorReservas.message
        },
        { status: 500 }
      );
    }

    console.log('📋 Últimas 5 reservas:', JSON.stringify(todasLasReservas, null, 2));

    // 2. Buscar la reserva específica
    console.log(`🔍 Buscando reserva con ID: ${reservaId}`);
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', reservaId.trim())
      .single();

    if (reservaError) {
      console.error('❌ Error en la consulta:', {
        code: reservaError.code,
        message: reservaError.message,
        details: reservaError.details,
        hint: reservaError.hint
      });
    }

    if (!reserva) {
      console.log('⚠️ No se encontró la reserva');
      return NextResponse.json(
        {
          error: "Reserva no encontrada",
          idBuscado: reservaId,
          totalReservas: todasLasReservas?.length || 0,
          ultimasReservas: todasLasReservas?.map(r => ({
            id: r.id,
            estado: r.estado,
            total: r.total
          })) || []
        },
        { status: 404 }
      );
    }

    console.log('✅ Reserva encontrada:', {
      id: reserva.id,
      total: reserva.total,
      estado: reserva.estado
    });

    // 3. Procesar el pago
    console.log('💳 Procesando pago...');
    const monto = Math.round(reserva.total * 0.5);

    // Usar timestamp para orden de compra único
    const timestamp = Date.now();
    const ordenCompra = `res-${timestamp}`;

    const baseUrl = getBaseUrl(req);
    const returnUrl = `${baseUrl}/pago/retorno?reserva_id=${reserva.id}`;
    console.log('🌐 Usando baseUrl/returnUrl:', { baseUrl, returnUrl });

    console.log('📝 Detalles del pago:', {
      monto,
      ordenCompra,
      returnUrl
    });

    console.log('🔄 Creando transacción en Webpay...');
    let response;
    try {
      // Crear transacción usando la API REST directamente
      response = await createTransaction(
        monto,
        ordenCompra,
        ordenCompra,
        returnUrl
      );

      console.log('✅ Transacción creada:', {
        url: response.url,
        token: response.token,
        buyOrder: ordenCompra
      });
    } catch (error: unknown) {
      const errorObj = error as Error & { code?: string };
      console.error('❌ Error al crear transacción en Webpay:', {
        message: errorObj.message,
        code: errorObj.code,
        stack: errorObj.stack,
        name: errorObj.name
      });

      // Devolver un mensaje de error más descriptivo
      throw new Error(`Error al procesar el pago: ${errorObj.message || 'Error desconocido'}`);
    }

    // 4. Actualizar la reserva
    console.log('🔄 Actualizando estado de la reserva...');
    const { error: updateError } = await supabase
      .from("reservas")
      .update({
        metodo_pago_inicial: "webpay",
        payment_intent_id: response.token,
        estado: 'pendiente_pago',
        updated_at: new Date().toISOString()
      })
      .eq("id", reservaId);

    if (updateError) {
      console.error('❌ Error al actualizar la reserva:', updateError);
      throw updateError;
    }

    console.log('✅ Pago procesado correctamente');
    return NextResponse.json({
      url: response.url,
      token: response.token,
      returnUrl,
      baseUrl,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Error';

    console.error('❌ Error en la creación del pago:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    });

    return NextResponse.json(
      {
        error: "Error al procesar el pago",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
