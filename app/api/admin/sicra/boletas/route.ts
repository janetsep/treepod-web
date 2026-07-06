import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { precioPromedioPonderado } from "@/lib/sicra-costo";

interface ParsedItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
  precio_final: number;
}

interface ParsedBoleta {
  fecha: string;
  tienda: string;
  numero_boleta: string;
  subtotal: number;
  descuentos: number;
  total: number;
  archivo_origen: string;
  items: ParsedItem[];
}

function parseBoleta(text: string, archivo: string): ParsedBoleta | null {
  const lines = text.split("\n").map((l) => l.trimEnd());

  // Extract boleta number
  const boletaMatch = text.match(/BOLETA ELECTRONICA[^\d]*(\d+)/i);
  const numero_boleta = boletaMatch ? boletaMatch[1] : "";

  // Extract date from footer: DD/MM/YY HH:MM
  const fechaMatch = text.match(/(\d{2})\/(\d{2})\/(\d{2})\s+\d{2}:\d{2}/);
  let fecha = "";
  if (fechaMatch) {
    const [, dd, mm, yy] = fechaMatch;
    fecha = `20${yy}-${mm}-${dd}`;
  }

  if (!fecha) return null;

  // Extract totals
  const subtotalMatch = text.match(/SUB\s*TOTAL\s*\$\s*([\d.]+)/);
  const descuentosMatch = text.match(/DESCUENTOS\s*\$\s*([\d.]+)/);
  const totalMatch = text.match(/TOTAL\s*\$\s*([\d.]+)/m);

  const subtotal = subtotalMatch
    ? parseInt(subtotalMatch[1].replace(/\./g, ""))
    : 0;
  const descuentos = descuentosMatch
    ? parseInt(descuentosMatch[1].replace(/\./g, ""))
    : 0;

  // Find the TOTAL line that's not SUB TOTAL or IVA
  let total = 0;
  const totalLines = text.match(/^\s*TOTAL\s*\$\s*([\d.,]+)/m);
  if (totalLines) {
    total = parseInt(totalLines[1].replace(/\./g, "").replace(",", ""));
  }

  const up = text.toUpperCase();
  const tienda = up.includes("JUMBO") ? "Jumbo"
    : (up.includes("LIDER") || up.includes("LÍDER")) ? "Líder"
    : up.includes("SANTA ISABEL") ? "Santa Isabel"
    : up.includes("UNIMARC") ? "Unimarc"
    : up.includes("TOTTUS") ? "Tottus"
    : "Otro";

  // Parse items - lines between the header separator and SUB TOTAL
  const items: ParsedItem[] = [];
  let inItems = false;
  let pendingQtyLine: { cantidad: number; precio_unitario: number } | null =
    null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("- - - - - -")) {
      // Skip next 2 lines (address)
      inItems = true;
      i += 2;
      continue;
    }

    if (line.match(/SUB\s*TOTAL/)) break;
    if (!inItems) continue;

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip discount lines
    if (trimmed.startsWith("TMP ")) continue;

    // Check for "N X $price" quantity prefix line
    const qtyPrefixMatch = trimmed.match(
      /^(\d+)\s*X\s*\$\s*([\d.,]+)\s*$/
    );
    if (qtyPrefixMatch) {
      pendingQtyLine = {
        cantidad: parseInt(qtyPrefixMatch[1]),
        precio_unitario: parseInt(
          qtyPrefixMatch[2].replace(/\./g, "").replace(",", "")
        ),
      };
      continue;
    }

    // Check for "N,NNN KG X $price" weight prefix line
    const weightPrefixMatch = trimmed.match(
      /^([\d.,]+)\s*KG\s*X\s*\$\s*([\d.,]+)\s*$/
    );
    if (weightPrefixMatch) {
      pendingQtyLine = {
        cantidad: parseFloat(weightPrefixMatch[1].replace(",", ".")),
        precio_unitario: parseInt(
          weightPrefixMatch[2].replace(/\./g, "").replace(",", "")
        ),
      };
      continue;
    }

    // Product line: "CODE NAME PRICE" — price is always the last number
    const productMatch = trimmed.match(
      /^(\d[\d\s]*\d)\s+(.+?)\s+([\d.,]+)\s*$/
    );
    if (productMatch) {
      const codigo = productMatch[1].trim();
      const nombre = productMatch[2].trim();
      const linePrice = parseInt(
        productMatch[3].replace(/\./g, "").replace(",", "")
      );

      let cantidad = 1;
      let unidad = "unidad";
      let precio_unitario = linePrice;

      if (pendingQtyLine) {
        cantidad = pendingQtyLine.cantidad;
        precio_unitario = pendingQtyLine.precio_unitario;
        unidad = Number.isInteger(cantidad) ? "unidad" : "kg";
        pendingQtyLine = null;
      }

      const subtotalItem = linePrice;

      // Look ahead for discount on next line
      let descuento = 0;
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]?.trim() || "";
        const discountMatch = nextLine.match(
          /TMP\s+(?:OFERTA|DESCUENTO|DESCUENTO DEFAU).*?-\s*(?:[A-Z]*-?)?([\d.,]+)/
        );
        if (discountMatch) {
          descuento = parseInt(
            discountMatch[1].replace(/\./g, "").replace(",", "")
          );
        }
      }

      items.push({
        codigo,
        nombre,
        cantidad,
        unidad,
        precio_unitario,
        subtotal: subtotalItem,
        descuento,
        precio_final: subtotalItem - descuento,
      });
      continue;
    }

    pendingQtyLine = null;
  }

  return {
    fecha,
    tienda,
    numero_boleta,
    subtotal,
    descuentos,
    total,
    archivo_origen: archivo,
    items,
  };
}

// EAN global válido (sirve para comparar entre tiendas): 12-13 dígitos y NO parte
// con '2' (prefijo 2 = código interno de balanza/peso variable, no universal).
function esEanGlobal(codigo: string | null | undefined): boolean {
  return !!codigo && /^[0-9]{12,13}$/.test(codigo) && codigo[0] !== "2";
}

// Mapea el nombre de tienda de la boleta a la clave de supermercado del panel.
function tiendaASuper(tienda: string | null | undefined): string | null {
  const s = (tienda || "").toLowerCase();
  if (s.includes("jumbo")) return "jumbo";
  if (s.includes("lider") || s.includes("líder")) return "lider_supermercado";
  if (s.includes("santa")) return "santaisabel";
  if (s.includes("unimarc")) return "unimarc";
  if (s.includes("tottus")) return "tottus";
  return null;
}

// Vincula un item de boleta a un producto: ajusta stock (resta del anterior, suma
// al nuevo), recalcula precio_compra (promedio ponderado) y fija el EAN del producto
// desde el código de la boleta. Compartido por el vínculo manual (PUT) y el
// automático por EAN (POST autovincular).
async function vincularItem(item_id: string, producto_id: string | null) {
  const { data: item } = await supabaseAdmin
    .from("sicra_boleta_items")
    .select("producto_id, cantidad, precio_unitario, precio_final, descuento, nombre, codigo, sicra_boletas(fecha, tienda)")
    .eq("id", item_id)
    .single();
  if (!item) return { error: "Item no encontrado" };

  const fechaBoleta = (item.sicra_boletas as any)?.fecha || new Date().toISOString().split("T")[0];
  const tiendaBoleta = (item.sicra_boletas as any)?.tienda as string | undefined;

  // Revertir stock del producto anterior (si lo había).
  if (item.producto_id) {
    const { data: oldProd } = await supabaseAdmin
      .from("sicra_productos").select("stock_actual, contenido_por_unidad").eq("id", item.producto_id).single();
    if (oldProd) {
      const factorOld = Number(oldProd.contenido_por_unidad) || 1;
      await supabaseAdmin.from("sicra_productos")
        .update({ stock_actual: Number(oldProd.stock_actual) - Number(item.cantidad) * factorOld })
        .eq("id", item.producto_id);
    }
  }

  const { error } = await supabaseAdmin
    .from("sicra_boleta_items").update({ producto_id: producto_id || null }).eq("id", item_id);
  if (error) return { error: error.message };

  if (producto_id) {
    const { data: newProd } = await supabaseAdmin
      .from("sicra_productos")
      .select("stock_actual, precio_compra, fecha_precio_actual, contenido_por_unidad, ean, termino_busqueda")
      .eq("id", producto_id)
      .single();
    if (newProd) {
      const factorNew = Number(newProd.contenido_por_unidad) || 1;
      const stockActual = Number(newProd.stock_actual);
      const precioActual = Number(newProd.precio_compra) || 0;
      const update: Record<string, unknown> = {
        stock_actual: stockActual + Number(item.cantidad) * factorNew,
      };
      const nuevoPrecio = precioPromedioPonderado({
        stockActualConsumo: stockActual,
        factor: factorNew,
        precioViejo: precioActual,
        qtyCompra: Number(item.cantidad),
        precioNuevo: Number(item.precio_unitario),
      });
      if (nuevoPrecio !== precioActual) {
        update.precio_anterior = precioActual || null;
        update.fecha_precio_anterior = newProd.fecha_precio_actual as string | null;
        update.precio_compra = nuevoPrecio;
        update.fecha_precio_actual = fechaBoleta;
      }
      // Fijar el EAN del producto desde la boleta (si aún no lo tiene y es global).
      if ((!newProd.ean || newProd.ean === "") && esEanGlobal(item.codigo)) {
        update.ean = item.codigo;
      }
      // Término de búsqueda específico (marca + tamaño) desde el nombre de la boleta,
      // para que la comparación apunte al producto exacto y no a uno genérico.
      if ((!newProd.termino_busqueda || newProd.termino_busqueda === "") && (item as any).nombre) {
        update.termino_busqueda = (item as any).nombre;
      }
      await supabaseAdmin.from("sicra_productos").update(update).eq("id", producto_id);

      // Registrar el precio REAL pagado en esa tienda como observación del panel de
      // ofertas (exacto, por producto y tienda; viene de tu propia boleta).
      const sup = tiendaASuper(tiendaBoleta);
      if (sup) {
        const precioPagado = Math.round(Number((item as any).precio_final ?? item.precio_unitario) || 0);
        if (precioPagado > 0) {
          await supabaseAdmin.from("sicra_jumbo_precios").insert({
            producto_id,
            termino: (item as any).nombre || "",
            titulo: (item as any).nombre || null,
            supermercado: sup,
            precio: precioPagado,
            en_oferta: Number((item as any).descuento) > 0,
            url: null,
            origen: "boleta",
            observado_at: fechaBoleta,
          });
        }
      }
    }
  }
  return {};
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("sicra_boletas")
    .select("*, sicra_boleta_items(*)")
    .order("fecha", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ boletas: data || [] });
}

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  // Auto-vincular items sin producto cuyo EAN coincide con un producto del catálogo.
  if (body.autovincular) {
    const { data: items } = await supabaseAdmin
      .from("sicra_boleta_items")
      .select("id, codigo")
      .is("producto_id", null);
    const candidatos = (items || []).filter((it: any) => esEanGlobal(it.codigo));
    const eans = Array.from(new Set(candidatos.map((c: any) => c.codigo)));
    let vinculados = 0;
    if (eans.length > 0) {
      const { data: prods } = await supabaseAdmin
        .from("sicra_productos").select("id, ean").in("ean", eans);
      const porEan: Record<string, string> = {};
      for (const p of prods || []) if (p.ean) porEan[p.ean] = p.id;
      for (const it of candidatos) {
        const pid = porEan[(it as any).codigo];
        if (!pid) continue;
        const r = await vincularItem((it as any).id, pid);
        if (!r.error) vinculados++;
      }
    }
    return NextResponse.json({ ok: true, vinculados, revisados: candidatos.length });
  }

  // Bulk import: array of {text, archivo}
  if (Array.isArray(body.boletas)) {
    const results = [];
    for (const b of body.boletas) {
      const parsed = parseBoleta(b.text, b.archivo);
      if (!parsed) continue;

      const { items, ...boletaData } = parsed;
      const { data: boleta, error } = await supabaseAdmin
        .from("sicra_boletas")
        .insert(boletaData)
        .select()
        .single();

      if (error || !boleta) continue;

      if (items.length > 0) {
        const itemsWithBoleta = items.map((it) => ({
          ...it,
          boleta_id: boleta.id,
        }));
        await supabaseAdmin.from("sicra_boleta_items").insert(itemsWithBoleta);
      }

      results.push({ ...boleta, items_count: items.length });
    }
    return NextResponse.json({ ok: true, imported: results });
  }

  // Single boleta text
  if (body.text) {
    const parsed = parseBoleta(body.text, body.archivo || "manual");
    if (!parsed)
      return NextResponse.json(
        { error: "No se pudo parsear la boleta" },
        { status: 400 }
      );

    // Evitar duplicados: si ya existe una boleta con el mismo número, no reimportar
    if (parsed.numero_boleta) {
      const { data: existentes } = await supabaseAdmin
        .from("sicra_boletas")
        .select("id, fecha")
        .eq("numero_boleta", parsed.numero_boleta)
        .limit(1);
      if (existentes && existentes.length > 0) {
        return NextResponse.json(
          { error: `La boleta N°${parsed.numero_boleta} ya estaba importada (${existentes[0].fecha}).`, duplicada: true },
          { status: 409 }
        );
      }
    }

    const { items, ...boletaData } = parsed;
    const { data: boleta, error } = await supabaseAdmin
      .from("sicra_boletas")
      .insert(boletaData)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    if (items.length > 0) {
      const itemsWithBoleta = items.map((it) => ({
        ...it,
        boleta_id: boleta.id,
      }));
      await supabaseAdmin.from("sicra_boleta_items").insert(itemsWithBoleta);
    }

    return NextResponse.json({ ok: true, boleta, items_count: items.length });
  }

  return NextResponse.json({ error: "Falta texto de boleta" }, { status: 400 });
}

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { item_id, producto_id } = await request.json();
  if (!item_id)
    return NextResponse.json({ error: "item_id requerido" }, { status: 400 });

  const res = await vincularItem(item_id, producto_id || null);
  if (res.error) {
    const status = res.error === "Item no encontrado" ? 404 : 500;
    return NextResponse.json({ error: res.error }, { status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id)
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("sicra_boletas")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
