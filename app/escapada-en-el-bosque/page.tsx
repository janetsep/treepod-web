import type { Metadata } from "next";
import Image from "next/image";
import TrackView from "../components/TrackView";
import { btnPrimary } from "../components/deco/cta";

export const metadata: Metadata = {
  title: "Una noche en el bosque de Las Trancas | TreePod",
  description: "Consulta fechas y precio para un domo privado de 1 a 4 personas en Valle Las Trancas.",
  robots: { index: false, follow: true },
};

const campaignKeys = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
  "gclid", "gbraid", "wbraid", "fbclid",
];

export default async function EscapadaEnElBosquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const incoming = await searchParams;
  const attribution = new URLSearchParams();
  for (const key of campaignKeys) {
    const value = incoming[key];
    if (typeof value === "string" && value) attribution.set(key, value);
  }
  const query = attribution.toString();
  const bookingHref = `/disponibilidad${query ? `?${query}` : ""}#reservar`;

  return (
    <main className="bg-[#F7F3EC] px-5 pb-12 pt-28 text-[#1E1B16] md:px-10 md:pt-36">
      <TrackView eventName="view_escapada_bosque" />
      <div className="mx-auto grid max-w-5xl items-center gap-5 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-video overflow-hidden rounded-[2px] bg-[#1E1B16]">
          <Image
            src="/images/hero/hero-domo-poster-v6.jpg"
            alt="Ventanal del domo TreePod junto a la cama, con el bosque al fondo"
            fill
            preload
            sizes="(min-width: 1024px) 492px, (min-width: 768px) 45vw, calc(100vw - 40px)"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-display text-[clamp(2.15rem,5vw,3.8rem)] leading-none">
            Una noche en el bosque de Las Trancas
          </h1>
          <p className="mt-3 text-base text-[#5B5348]">
            Domo privado para 1 a 4 personas, con calefacción, baño privado y cocina equipada.
          </p>
          <a href={bookingHref} className={`${btnPrimary} mt-5 w-full sm:w-auto`}>
            Ver fechas y precio
          </a>
          <p className="mt-3 text-sm text-[#5B5348]">
            Reserva con el 50%. Paga el saldo al llegar.
          </p>
        </div>
      </div>
    </main>
  );
}
