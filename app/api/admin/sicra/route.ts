import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

const HN_CAL = 182;
const DN_CAL = 71;
const VENTANA_DIAS = 14;

const CATS_DOMO = new Set(["Amenities y Aseo Domo", "Limpieza y Aseo", "Energía y Combustible"]);

const STOCK_SEGURIDAD: Record<string, number> = {
  "Papel higiénico": 2, "Pellet calefacción": 3, "Servilletas": 2,
  "Toalla de papel": 2, "Detergente": 1, "Limpiador": 1, "Agua mineral": 6,
};

const VIDA_UTIL: Record<string, number> = {
  "Carne": 3, "Pollo": 3, "Pescado": 2, "Jamón": 5, "Quesos": 7,
  "Leche": 5, "Pan": 2, "Palta": 4, "Frutas": 5, "Verduras": 4,
};

interface Reserva {
  checkin: string;
  checkout: string;
  noches: number;
  huespedes: number;
  domo: string;
  cliente: string;
  desayuno: boolean;
  almuerzo: boolean;
  cena: boolean;
  tinaja: boolean;
}

interface GastoPorServicio {
  total: number;
  base: number;
  desayuno: number;
  cena: number;
  tinaja: number;
  ingreso_servicios: number;
  margen_pct: number | null;
}

export async function GET(request: Request) {
  try {
    const admin = await getVerifiedAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const hoy = new Date().toISOString().split("T")[0];
    const finVentana = new Date(Date.now() + VENTANA_DIAS * 86400000).toISOString().split("T")[0];
    const finMes = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

    // 1. Precios reales de servicios desde Supabase
    const { data: rawServicios } = await supabaseAdmin
      .from("servicios")
      .select("nombre, precio, multiplicador_noches, multiplicador_personas")
      .eq("activo", true);

    const precioServicio = (nombre: string): number => {
      const s = (rawServicios || []).find((x: any) =>
        x.nombre?.toLowerCase().includes(nombre.toLowerCase())
      );
      return s ? Number(s.precio) || 0 : 0;
    };

    const precioDesayuno = precioServicio("desayuno") || 8000;
    const precioAlmuerzo = precioServicio("almuerzo") || 38000;
    const precioCena = precioServicio("cena") || 38000;
    const precioTinaja = precioServicio("tinaja") || 0;

    // 2. Reservas futuras con servicios, total y monto pagado
    const { data: rawReservas, error: errRes } = await supabaseAdmin
      .from("reservas")
      .select(`
        fecha_inicio, fecha_fin, adultos, num_huespedes, nombre, apellido,
        total, monto_pagado,
        domos (nombre),
        reserva_servicios (
          cantidad, es_cortesia,
          servicios (nombre, precio, multiplicador_noches, multiplicador_personas)
        )
      `)
      .is("deleted_at", null)
      .in("estado", ["confirmado", "pagado"])
      .gte("fecha_fin", hoy)
      .order("fecha_inicio", { ascending: true });

    if (errRes) throw errRes;

    const reservas = (rawReservas || []).map((r: any) => {
      const noches = daysBetween(r.fecha_inicio, r.fecha_fin);
      const huespedes = r.num_huespedes || r.adultos || 2;
      const hn = noches * huespedes;
      const rsItems: any[] = r.reserva_servicios || [];
      const servicioNombres = rsItems.map((rs: any) => rs.servicios?.nombre?.toLowerCase() || "");

      // Calcular cobrado real por servicio (excluir cortesías)
      let cobradoDesayuno = 0, cobradoAlmuerzo = 0, cobradoCena = 0, cobradoTinaja = 0;
      let cortesiaDesayuno = false, cortesiaAlmuerzo = false, cortesiaCena = false, cortesiaTinaja = false;
      for (const rs of rsItems) {
        const svc = rs.servicios;
        if (!svc) continue;
        const n = svc.nombre?.toLowerCase() || "";
        const esCortesia = !!rs.es_cortesia;
        if (esCortesia) {
          if (n.includes("desayuno")) cortesiaDesayuno = true;
          else if (n.includes("almuerzo")) cortesiaAlmuerzo = true;
          else if (n.includes("cena")) cortesiaCena = true;
          else if (n.includes("tinaja")) cortesiaTinaja = true;
          continue; // no sumar al ingreso
        }
        const precio = Number(svc.precio) || 0;
        const cant = Number(rs.cantidad) || 1;
        const mult = (svc.multiplicador_noches ? noches : 1) * (svc.multiplicador_personas ? huespedes : 1);
        const subtotal = precio * cant * mult;
        if (n.includes("desayuno")) cobradoDesayuno += subtotal;
        else if (n.includes("almuerzo")) cobradoAlmuerzo += subtotal;
        else if (n.includes("cena")) cobradoCena += subtotal;
        else if (n.includes("tinaja")) cobradoTinaja += subtotal;
      }

      // Fallback: si no hay servicios con precios, usar tarifas de referencia
      const hasDesayuno = servicioNombres.some((s: string) => s.includes("desayuno"));
      const hasAlmuerzo = servicioNombres.some((s: string) => s.includes("almuerzo"));
      const hasCena = servicioNombres.some((s: string) => s.includes("cena"));
      const hasTinaja = servicioNombres.some((s: string) => s.includes("tinaja"));

      if (hasDesayuno && cobradoDesayuno === 0) cobradoDesayuno = precioDesayuno * hn;
      if (hasAlmuerzo && cobradoAlmuerzo === 0) cobradoAlmuerzo = precioAlmuerzo * hn;
      if (hasCena && cobradoCena === 0) cobradoCena = precioCena * hn;
      if (hasTinaja && cobradoTinaja === 0 && precioTinaja > 0) cobradoTinaja = precioTinaja * noches;

      const totalServicios = cobradoDesayuno + cobradoAlmuerzo + cobradoCena + cobradoTinaja;
      const totalCobrado = Number(r.total) || 0;
      const hospedaje = totalCobrado > 0 ? Math.max(0, totalCobrado - totalServicios) : 0;
      const saldo = totalCobrado - (Number(r.monto_pagado) || 0);

      return {
        checkin: r.fecha_inicio,
        checkout: r.fecha_fin,
        noches,
        huespedes,
        domo: r.domos?.nombre || "—",
        cliente: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "Sin nombre",
        desayuno: hasDesayuno,
        almuerzo: hasAlmuerzo,
        cena: hasCena,
        tinaja: hasTinaja,
        cortesia: { desayuno: cortesiaDesayuno, almuerzo: cortesiaAlmuerzo, cena: cortesiaCena, tinaja: cortesiaTinaja },
        total_cobrado: totalCobrado,
        monto_pagado: Number(r.monto_pagado) || 0,
        saldo_pendiente: saldo,
        cobrado: {
          hospedaje,
          desayuno: cobradoDesayuno,
          almuerzo: cobradoAlmuerzo,
          cena: cobradoCena,
          tinaja: cobradoTinaja,
          servicios_total: totalServicios,
        },
      };
    });

    // Separar ventana A (0-14d) y B (15-30d)
    const ventanaA = reservas.filter(r => r.checkin < finVentana);
    const ventanaB = reservas.filter(r => r.checkin >= finVentana && r.checkin < finMes);

    const hnA = calcHN(ventanaA, hoy, finVentana);
    const dnA = calcDN(ventanaA, hoy, finVentana);
    const hnB = calcHN(ventanaB, finVentana, finMes);
    const dnB = calcDN(ventanaB, finVentana, finMes);

    // 2. Gastos históricos (finanzas_movimientos para supermercado)
    const { data: gastos } = await supabaseAdmin
      .from("finanzas_movimientos")
      .select("fecha_movimiento, categoria, monto, descripcion")
      .eq("tipo", "egreso")
      .in("categoria", ["supermercado", "insumos", "aseo", "combustible", "alimentos"])
      .order("fecha_movimiento", { ascending: true });

    // Reservas históricas para tendencia (últimos 12 meses)
    const hace12m = new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0];
    const { data: rawHistorial } = await supabaseAdmin
      .from("reservas")
      .select("fecha_inicio, fecha_fin, adultos, num_huespedes, total, monto_pagado, estado")
      .is("deleted_at", null)
      .in("estado", ["confirmado", "pagado"])
      .gte("fecha_inicio", hace12m)
      .order("fecha_inicio", { ascending: true });

    // Tendencia mensual combinada: reservas + gasto insumos
    const tendencia = calcTendenciaCombinada(rawHistorial || [], gastos || []);

    // Tasas de gasto (usando gasto total histórico / calibración)
    const gastoTotal = (gastos || []).reduce((s: number, g: any) => s + Math.abs(Number(g.monto) || 0), 0);
    const tasaHN = gastoTotal * 0.7 / HN_CAL;
    const tasaDN = gastoTotal * 0.3 / DN_CAL;

    // 3. Alertas de desperdicio
    const alertas: Array<{ tipo: string; mensaje: string; severidad: "alta" | "media" | "baja" }> = [];
    const proximas3d = reservas.filter(r => r.checkin <= addDays(hoy, 3));
    const proximas7d = reservas.filter(r => r.checkin <= addDays(hoy, 7));

    if (proximas3d.length === 0) {
      alertas.push({ tipo: "DESPERDICIO", mensaje: "Sin reservas en 3 días: NO compres frescos perecibles", severidad: "alta" });
    }
    if (proximas7d.length === 0) {
      alertas.push({ tipo: "DESPERDICIO", mensaje: "Sin reservas en 7 días: reduce compras al mínimo", severidad: "alta" });
    } else if (proximas7d.length === 1) {
      alertas.push({
        tipo: "DESPERDICIO",
        mensaje: `Solo 1 reserva en 7 días (${proximas7d[0].cliente}, ${proximas7d[0].huespedes}p). Compra proporcional.`,
        severidad: "media"
      });
    }

    // 4. Gasto (insumos) por cliente con desglose
    const gastoClientes = reservas.map(r => {
      const hn = r.noches * r.huespedes;
      const base = tasaDN * r.noches * 0.3 + tasaHN * hn * 0.2;
      const desay = r.desayuno ? tasaHN * hn * 0.35 : 0;
      const cena = r.cena ? tasaHN * hn * 0.5 : 0;
      const tinaja = r.tinaja ? tasaDN * r.noches * 0.15 : 0;
      const totalInsumos = base + desay + cena + tinaja;
      const ingresoServicios = r.cobrado.servicios_total;
      return {
        ...r,
        gasto: {
          total: Math.round(totalInsumos),
          base: Math.round(base),
          desayuno: Math.round(desay),
          cena: Math.round(cena),
          tinaja: Math.round(tinaja),
          ingreso_servicios: ingresoServicios,
          margen_pct: ingresoServicios > 0 ? Math.round((1 - totalInsumos / ingresoServicios) * 1000) / 10 : null,
        },
      };
    });

    // 5. Vida útil perecibles
    const perecibles = Object.entries(VIDA_UTIL).map(([nombre, dias]) => ({
      nombre, dias, alerta: dias <= 3 ? `Comprar máx ${dias} días antes` : null,
    }));

    // 6. KPIs
    const gastoVentana = Math.round(tasaHN * hnA + tasaDN * dnA);
    const conDesayuno = reservas.filter(r => r.desayuno).length;
    const conCena = reservas.filter(r => r.cena).length;
    const conTinaja = reservas.filter(r => r.tinaja).length;

    const ingresoTotal = reservas.reduce((s, r) => s + r.total_cobrado, 0);
    const ingresoServicios = reservas.reduce((s, r) => s + r.cobrado.servicios_total, 0);

    // 7. Mano de obra (HH) — actividades ligadas a reservas de la ventana A
    const num_reservas_ventana = ventanaA.length;
    const num_reservas_tinaja  = ventanaA.filter(r => r.tinaja).length;
    const dn_desayuno_mano = calcDNServicio(ventanaA, hoy, finVentana, "desayuno");

    const { data: hhDB } = await supabaseAdmin
      .from("sicra_hh_actividades")
      .select("*")
      .eq("activo", true)
      .order("area")
      .order("nombre");

    const hh_actividades = (hhDB || []).map((a: any) => {
      const horas_calc = Math.round((
        (Number(a.horas_por_reserva)        || 0) * num_reservas_ventana +
        (Number(a.horas_por_dn)             || 0) * dnA +
        (Number(a.horas_por_dn_desayuno)    || 0) * dn_desayuno_mano +
        (Number(a.horas_por_reserva_tinaja) || 0) * num_reservas_tinaja
      ) * 10) / 10;
      return {
        id: a.id,
        nombre: a.nombre,
        responsable: a.responsable,
        area: a.area,
        horas_por_reserva:        Number(a.horas_por_reserva)        || 0,
        horas_por_dn:             Number(a.horas_por_dn)             || 0,
        horas_por_dn_desayuno:    Number(a.horas_por_dn_desayuno)    || 0,
        horas_por_reserva_tinaja: Number(a.horas_por_reserva_tinaja) || 0,
        costo_hora:               Number(a.costo_hora)               || 2000,
        horas_calc,
        costo_total: Math.round(horas_calc * (Number(a.costo_hora) || 2000)),
      };
    }).filter((a: any) => a.horas_calc > 0);

    const hh_total_horas = hh_actividades.reduce((s: number, a: any) => s + a.horas_calc, 0);
    const hh_total_costo = hh_actividades.reduce((s: number, a: any) => s + a.costo_total, 0);

    // 8. Lista de compra — cantidades por producto según reservas próximas (ventana A)
    const hn_desayuno = calcHNServicio(ventanaA, hoy, finVentana, "desayuno");
    const hn_almuerzo = calcHNServicio(ventanaA, hoy, finVentana, "almuerzo");
    const hn_cena     = calcHNServicio(ventanaA, hoy, finVentana, "cena");
    const dn_tinaja   = calcDNServicio(ventanaA, hoy, finVentana, "tinaja");

    const { data: productosDB } = await supabaseAdmin
      .from("sicra_productos")
      .select("*")
      .eq("activo", true)
      .order("categoria")
      .order("nombre");

    const lista_compra = (productosDB || []).map((p: any) => {
      let hn_ref = 0;
      let dn_ref = 0;
      if (p.categoria === "desayuno")  hn_ref = hn_desayuno;
      if (p.categoria === "almuerzo")  hn_ref = hn_almuerzo;
      if (p.categoria === "cena")      hn_ref = hn_cena;
      if (p.categoria === "tinaja")    dn_ref = dn_tinaja;
      if (p.categoria === "base_domo") dn_ref = dnA;
      if (p.categoria === "bebidas")   hn_ref = hnA;

      // Cantidad bruta en unidad de consumo (sin redondear para cálculo de envases)
      const cantidad_consumo = Math.round(
        ((Number(p.cantidad_por_hn) || 0) * hn_ref +
         (Number(p.cantidad_por_dn) || 0) * dn_ref) * 100
      ) / 100;

      // Cuántas presentaciones comerciales hay que comprar
      const contenido = Number(p.contenido_por_presentacion) || 1;
      const unidades_comprar = cantidad_consumo > 0 ? Math.ceil(cantidad_consumo / contenido) : 0;

      // Precio real = precio por presentación × unidades a comprar
      const precio_compra = Number(p.precio_compra) || 0;
      const subtotal = unidades_comprar * precio_compra;

      return {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        unidad: p.unidad,
        precio_referencia: Number(p.precio_referencia) || 0,
        precio_compra,
        presentacion: p.presentacion || null,
        contenido_por_presentacion: contenido,
        cantidad_por_hn: Number(p.cantidad_por_hn) || 0,
        cantidad_por_dn: Number(p.cantidad_por_dn) || 0,
        cantidad_consumo,   // ej: 1.2 kg
        unidades_comprar,   // ej: 3 bloques
        subtotal,
        hn_ref,
        dn_ref,
      };
    }).filter((p: any) => p.cantidad_consumo > 0);

    const result = {
      hoy,
      ventana_dias: VENTANA_DIAS,
      tarifas: {
        desayuno: { precio: precioDesayuno, unidad: "persona/noche" },
        almuerzo: { precio: precioAlmuerzo, unidad: "persona/noche" },
        cena: { precio: precioCena, unidad: "persona/noche" },
        tinaja: { precio: precioTinaja, unidad: "noche" },
      },
      kpis: {
        reservas_total: reservas.length,
        hn_ventana: hnA,
        dn_ventana: dnA,
        gasto_proyectado_ventana: gastoVentana,
        gasto_por_hn: Math.round(tasaHN + tasaDN),
        ingreso_total: ingresoTotal,
        ingreso_servicios: ingresoServicios,
        con_desayuno: conDesayuno,
        con_cena: conCena,
        con_tinaja: conTinaja,
        alertas_activas: alertas.length,
      },
      alertas,
      llegadas: ventanaA,
      preparate: ventanaB.length > 0 ? {
        reservas: ventanaB,
        hn: hnB,
        dn: dnB,
        gasto_estimado: Math.round(tasaHN * hnB + tasaDN * dnB),
        fecha_compra: addDays(ventanaB[0]?.checkin || finVentana, -2),
      } : null,
      gasto_clientes: gastoClientes,
      tendencia,
      perecibles: perecibles.filter(p => p.alerta),
      lista_compra,
      lista_compra_contexto: { hn_desayuno, hn_almuerzo, hn_cena, dn_tinaja, dn_base: dnA },
      hh_actividades,
      hh_resumen: {
        total_horas: Math.round(hh_total_horas * 10) / 10,
        total_costo: hh_total_costo,
        num_reservas: num_reservas_ventana,
        num_reservas_tinaja,
      },
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("SICRA API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function calcHN(reservas: Reserva[], ini: string, fin: string): number {
  let total = 0;
  for (const r of reservas) {
    const start = r.checkin > ini ? r.checkin : ini;
    const end = r.checkout < fin ? r.checkout : fin;
    const nights = daysBetween(start, end);
    if (nights > 0) total += nights * r.huespedes;
  }
  return total;
}

function calcDN(reservas: Reserva[], ini: string, fin: string): number {
  let total = 0;
  for (const r of reservas) {
    const start = r.checkin > ini ? r.checkin : ini;
    const end = r.checkout < fin ? r.checkout : fin;
    const nights = daysBetween(start, end);
    if (nights > 0) total += nights;
  }
  return total;
}

function calcHNServicio(reservas: Reserva[], ini: string, fin: string, servicio: keyof Reserva): number {
  let total = 0;
  for (const r of reservas) {
    if (!r[servicio]) continue;
    const start = r.checkin > ini ? r.checkin : ini;
    const end = r.checkout < fin ? r.checkout : fin;
    const nights = daysBetween(start, end);
    if (nights > 0) total += nights * r.huespedes;
  }
  return total;
}

function calcDNServicio(reservas: Reserva[], ini: string, fin: string, servicio: keyof Reserva): number {
  let total = 0;
  for (const r of reservas) {
    if (!r[servicio]) continue;
    const start = r.checkin > ini ? r.checkin : ini;
    const end = r.checkout < fin ? r.checkout : fin;
    const nights = daysBetween(start, end);
    if (nights > 0) total += nights;
  }
  return total;
}

function calcTendenciaCombinada(
  reservas: any[],
  gastos: any[]
): Array<{
  mes: string; label: string;
  reservas: number; personas: number; noches: number;
  ingreso: number; monto_pagado: number;
  gasto_insumos: number;
}> {
  const porMes: Record<string, {
    reservas: number; personas: number; noches: number;
    ingreso: number; monto_pagado: number; gasto_insumos: number;
  }> = {};

  for (const r of reservas) {
    if (!r.fecha_inicio) continue;
    const mes = r.fecha_inicio.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { reservas: 0, personas: 0, noches: 0, ingreso: 0, monto_pagado: 0, gasto_insumos: 0 };
    const noches = Math.round(
      (new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000
    );
    porMes[mes].reservas      += 1;
    porMes[mes].personas      += Number(r.num_huespedes || r.adultos) || 2;
    porMes[mes].noches        += noches;
    porMes[mes].ingreso       += Number(r.total) || 0;
    porMes[mes].monto_pagado  += Number(r.monto_pagado) || 0;
  }

  for (const g of gastos) {
    if (!g.fecha_movimiento) continue;
    const mes = g.fecha_movimiento.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { reservas: 0, personas: 0, noches: 0, ingreso: 0, monto_pagado: 0, gasto_insumos: 0 };
    porMes[mes].gasto_insumos += Math.abs(Number(g.monto) || 0);
  }

  const MESES_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return Object.keys(porMes).sort().map(m => {
    const [, mm] = m.split("-");
    return {
      mes: m,
      label: `${MESES_ES[parseInt(mm) - 1]} ${m.slice(2, 4)}`,
      ...porMes[m],
      ingreso:      Math.round(porMes[m].ingreso),
      monto_pagado: Math.round(porMes[m].monto_pagado),
      gasto_insumos: Math.round(porMes[m].gasto_insumos),
    };
  });
}
