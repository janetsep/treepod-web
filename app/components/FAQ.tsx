"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { faqs } from "./faq-data";
import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";

// Artículo 06 — lista de filetes, sin tarjetas: preguntas en Fraunces con
// indicador "+" tipográfico que rota 45° al abrir. Las preguntas viven en
// faq-data.ts (compartidas con el JSON-LD FAQPage del home). Responder dudas al
// instante es la palanca #1 contra el abandono hacia las OTA.

export default function FAQ() {
  const [abierto, setAbierto] = useState<number | null>(0);

  return (
    <section className="bg-[#F7F3EC] py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 06" label="Antes de reservar" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              <h2 className="display-lg text-[#1E1B16]">
                Preguntas{" "}
                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                  frecuentes
                </span>
              </h2>
              <p className="text-[#5B5348] leading-relaxed">
                ¿Tienes otra consulta? Con gusto te ayudamos.
              </p>
              <div className="flex flex-col items-start gap-4">
                <a
                  href="https://wa.me/56984643307"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 font-semibold text-[15px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#00ADEF]" /> Escríbenos por WhatsApp
                </a>
                <Link
                  href="/terminos"
                  className="inline-flex items-center gap-2 text-[14px] text-[#5B5348] hover:text-[#1E1B16] transition-colors"
                >
                  <TriBullet /> Ver términos y condiciones completos
                </Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="divide-y divide-[#1E1B16]/12 border-y border-[#1E1B16]/12">
              {faqs.map((f, i) => {
                const open = abierto === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setAbierto(open ? null : i)}
                      className="w-full py-5 flex justify-between items-baseline gap-6 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-display font-medium text-lg md:text-xl text-[#1E1B16]">
                        {f.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`font-display text-2xl text-[#00ADEF] shrink-0 transition-transform duration-300 ${
                          open ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-6 pr-10 text-[#5B5348] leading-relaxed text-[15px]">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
