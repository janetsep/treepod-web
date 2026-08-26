"use client";

import { useEffect, useState } from "react";

type Locale = "en" | "pt";

export default function LocalizedRates({ locale }: { locale: Locale }) {
  const [rates, setRates] = useState<{ desde: number; unaNoche: number | null } | null>(null);

  useEffect(() => {
    fetch("/api/public/tarifa-desde", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.desde === "number") {
          setRates({
            desde: data.desde,
            unaNoche: typeof data.unaNoche === "number" ? data.unaNoche : null,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!rates) {
    return (
      <p className="text-sm text-[#5B5348] mt-2 leading-relaxed">
        {locale === "en" ? "Check current rates and availability." : "Consulte tarifas e disponibilidade atuais."}
      </p>
    );
  }

  const desde = rates.desde.toLocaleString("es-CL");
  const unaNoche = rates.unaNoche?.toLocaleString("es-CL");

  if (locale === "en") {
    return (
      <>
        <p className="font-display font-medium text-[clamp(2.6rem,6vw,4rem)] leading-none text-[#1E1B16] mt-2">
          CLP ${desde}
        </p>
        <p className="text-sm text-[#5B5348] mt-2 leading-relaxed">
          per night · 2 guests · stays of 2+ nights.
          {unaNoche ? <><br />Single-night stays: CLP ${unaNoche}.</> : null}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="font-display font-medium text-[clamp(2.6rem,6vw,4rem)] leading-none text-[#1E1B16] mt-2">
        CLP ${desde}
      </p>
      <p className="text-sm text-[#5B5348] mt-2 leading-relaxed">
        por noite · 2 pessoas · estadias de 2+ noites (pesos chilenos).
        {unaNoche ? <><br />Estadia de 1 noite: CLP ${unaNoche}.</> : null}
      </p>
    </>
  );
}
