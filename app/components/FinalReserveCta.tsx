import Link from "next/link";
import { btnPrimaryDark } from "./deco/cta";

export default function FinalReserveCta() {
  return (
    <section className="bg-[#1E1B16] text-[#F7F3EC] py-20 md:py-28">
      <div className="mx-auto max-w-[860px] px-5 md:px-10 text-center">
        <p className="dato text-[#00ADEF]">Tu escapada empieza aquí</p>
        <h2 className="display-lg !text-[#F7F3EC] mt-4">
          Elige tus fechas y conoce el <span className="italic text-[#00ADEF]">valor real</span> de tu estadía.
        </h2>
        <p className="mt-5 text-white/75 text-[16px] leading-relaxed max-w-xl mx-auto">
          Verás fechas, noches, huéspedes, total, pago de hoy y saldo al llegar antes de ir a Webpay.
        </p>
        <div className="mt-10">
          <Link href="/disponibilidad#reservar" className={btnPrimaryDark}>
            Ver disponibilidad y precio
          </Link>
        </div>
      </div>
    </section>
  );
}
