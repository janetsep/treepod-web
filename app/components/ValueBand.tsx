import { precioDesde, fmtCLP } from "@/lib/precio-desde";
import TriBullet from "./deco/TriBullet";

// Franja "ficha técnica" bajo la portada: tipografía pura entre filetes, sin
// iconos ni tarjetas. Comunica el precio "desde" real (2 adultos, temporada
// vigente — ver lib/precio-desde) y las palancas de reserva directa.
// Server component: precio en vivo.

const items = [
  { t: "Mejor precio directo", s: "Sin comisión de intermediarios" },
  { t: "Reserva con el 50%", s: "El saldo se paga en el check-in" },
  { t: "Registro SERNATUR", s: "N° 36805 · operación formal" },
  { t: "Respuesta rápida", s: "Te asesoramos por WhatsApp" },
];

export default async function ValueBand() {
  const { precio: desde, nochesMin } = await precioDesde();
  // Si las tarifas no responden se omite la franja entera. Antes habia un
  // respaldo fijo de $160.000 que no estaba en la base: publicar un precio
  // inventado es peor que no publicar ninguno.
  if (!desde) return null;
  return (
    <section className="bg-white border-b border-[#1E1B16]/15 py-6">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-6 items-center">
        {/* Precio desde */}
        <div className="col-span-12 md:col-span-4">
          <div className="dato text-[#5B5348]">Domos desde</div>
          <div className="flex items-baseline gap-3 flex-wrap mt-1">
            <span className="font-display font-medium text-[clamp(2.4rem,4vw,3.4rem)] leading-none tabular-nums text-[#1E1B16]">
              {fmtCLP(desde)}
            </span>
            <span className="caption-editorial">
              / noche · 2 personas
              {nochesMin > 1 ? ` · para estadías de ${nochesMin} noches o más` : ""}
            </span>
          </div>
        </div>

        {/* Palancas de reserva directa */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 lg:gap-x-0 lg:divide-x lg:divide-[#1E1B16]/10">
          {items.map(({ t, s }) => (
            <div key={t} className="lg:px-5 lg:first:pl-0 lg:last:pr-0">
              <div className="flex items-center gap-2">
                <TriBullet />
                <span className="text-[13px] font-semibold text-[#1E1B16] leading-tight">{t}</span>
              </div>
              <div className="text-[11px] text-gray-600 leading-tight mt-1 pl-[18px]">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
