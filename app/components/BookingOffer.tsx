import TriBullet from './deco/TriBullet';

type BookingOfferProps = {
  nights: number;
  guests: number;
  total: number;
  deposit: number;
};

/** Presentation only: all amounts come from the current booking quote. */
export default function BookingOffer({nights, guests, total, deposit}: BookingOfferProps) {
  const money = (value: number) => '$'+value.toLocaleString('es-CL');
  const duration = `${nights} ${nights === 1 ? 'noche' : 'noches'}`;
  return <section aria-label="Precio y comodidad de tu domo" data-booking-offer="two-nights-v1" className="pt-4 border-t border-[#1E1B16]/15 space-y-4">
    <div>
      <p className="dato text-[#008CBF]">Domo privado · {guests} {guests === 1 ? 'persona' : 'personas'}</p>
      <h3 className="font-display text-[1.45rem] leading-tight text-[#1E1B16] mt-1">
        {nights === 2 ? 'Dos noches en el bosque' : nights === 1 ? 'Una noche en el bosque' : `${nights} noches en el bosque`}
      </h3>
      <ul aria-label="Incluido en el alojamiento" className="mt-2 space-y-1 text-[13px] leading-snug text-[#5B5348]">
        <li className="flex gap-2 items-baseline"><TriBullet className="w-2 h-1.5 shrink-0 text-[#00ADEF]"/><span>Baño privado y cocina equipada.</span></li>
        <li className="flex gap-2 items-baseline"><TriBullet className="w-2 h-1.5 shrink-0 text-[#00ADEF]"/><span>Terraza propia entre los árboles.</span></li>
      </ul>
    </div>
    <div>
      <p className="text-[13px] text-[#5B5348]">Total por {duration}</p>
      <p data-offer-total className="font-display font-medium text-[clamp(2.3rem,5.5vw,2.8rem)] leading-none tabular-nums text-[#1E1B16] mt-1">{money(total)}</p>
      <p className="text-[11px] text-[#5B5348] mt-1">Precio total del domo · IVA incluido</p>
    </div>
    <div className="bg-[#00ADEF]/[0.06] border border-[#00ADEF]/20 rounded-[2px] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] leading-snug text-[#1E1B16]">Confirma hoy<br/><span className="text-[#5B5348]">con el 50%</span></p>
        <p data-offer-deposit className="font-display font-medium text-[1.8rem] leading-none tabular-nums text-[#008CBF]">{money(deposit)}</p>
      </div>
      <p className="text-[12px] text-[#5B5348] mt-2">Saldo al llegar: <span data-offer-balance className="font-semibold tabular-nums text-[#1E1B16]">{money(total-deposit)}</span></p>
    </div>
  </section>;
}
