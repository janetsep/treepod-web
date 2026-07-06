import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CinematicSection from "../components/CinematicSection";
import SectionFolio from "../components/SectionFolio";
import TriBullet from "../components/deco/TriBullet";
import GeoDivider from "../components/deco/GeoDivider";
import { btnPrimary, linkLine } from "../components/deco/cta";

export const metadata: Metadata = {
    title: "Onde Ficar Perto do Nevados de Chillán | Domos TreePod",
    description:
        "Domos geodésicos aquecidos no bosque nativo do Valle Las Trancas, a 12 minutos de carro do centro de esqui Nevados de Chillán. Aquecimento automático, Wi-Fi Starlink, reserva direta.",
    alternates: {
        canonical: "/pt",
        languages: {
            es: "/",
            en: "/en",
            pt: "/pt",
        },
    },
    openGraph: {
        title: "Onde Ficar Perto do Nevados de Chillán | TreePod",
        description:
            "Domos geodésicos no bosque, a 12 minutos das pistas. Aquecimento a pellet automático, Wi-Fi Starlink, reserva direta.",
        url: "/pt",
        images: ["/images/hero/domonieve2.jpeg"],
        locale: "pt_BR",
    },
};

const facts: Array<[string, string, string]> = [
    ["De carro até o Nevados de Chillán", "12 min", "Esquie de manhã, curta as termas à tarde e volte para um domo aquecido no meio do bosque."],
    ["Estufa a pellet automática", "sem lenha", "A estufa é programável e se alimenta sozinha. O domo fica aquecido a noite toda, mesmo nevando lá fora."],
    ["Wi-Fi Starlink via satélite", "alta velocidade", "Internet de verdade na montanha: suba as fotos do powder ou faça aquela call de trabalho."],
    ["Cozinha no domo + quincho", "incluído", "Cozinha completa, cafeteira Nespresso e um quincho (churrasqueira chilena coberta) no bosque."],
    ["Estacionamento ao lado do domo", "grátis", "Carregue e descarregue o equipamento de esqui a poucos passos da porta."],
    ["Capacidade por domo", "até 4", "Cama de casal mais um mezanino. Temos 4 domos no total."],
];

const goodToKnow = [
    "Não aceitamos pets, para proteger a fauna do bosque nativo.",
    "O ofurô de madeira aquecido a lenha é um serviço sazonal (primavera a outono). Não funciona na temporada de esqui.",
    "Há lojas de aluguel de equipamento de esqui e snowboard no povoado de Las Trancas, a minutos dos domos.",
    "No inverno, os carabineros podem exigir correntes para neve na estrada até o centro de esqui. Leve as suas.",
];

export default function PortugueseSkiPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen" lang="pt">
            <CinematicSection
                image="/images/hero/domonieve2.jpeg"
                alt="Domo geodésico TreePod coberto de neve no Valle Las Trancas, Chile"
                eyebrow="Valle Las Trancas · Ñuble, Chile"
                title={<>Durma a 12 minutos das pistas, <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[8px]">em um domo aquecido no bosque</span></>}
                text="O TreePod é um glamping de 4 domos no bosque nativo do Valle Las Trancas, na estrada para o Nevados de Chillán — um dos destinos de neve mais conhecidos da América do Sul."
                priority
                titleAs="h1"
                stat="4,9"
                statCaption="59 avaliações verificadas no Google"
                photoCaption="Inverno no TreePod, Valle Las Trancas"
            />

            <GeoDivider left="22%" />

            <main className="mx-auto max-w-[1100px] px-5 md:px-10 py-16 md:py-24">
                <p className="dato text-[#5B5348] mb-10">
                    <Link href="/" className="underline decoration-[#00ADEF] decoration-2 underline-offset-4 hover:text-[#008CBF]">Español</Link>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <Link href="/en" className="underline decoration-[#00ADEF] decoration-2 underline-offset-4 hover:text-[#008CBF]">English</Link>
                </p>

                <SectionFolio num="N° 01" label="Por que esquiadores ficam aqui" />
                <div className="mt-4">
                    {facts.map(([t, dato, d]) => (
                        <div key={t} className="py-3.5 border-b border-[#1E1B16]/10 last:border-b-0">
                            <div className="flex items-baseline gap-3">
                                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                <span className="text-[15px] font-semibold text-[#1E1B16] leading-snug">{t}</span>
                                <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-6" aria-hidden="true" />
                                <span className="dato text-[#1E1B16] whitespace-nowrap">{dato}</span>
                            </div>
                            <p className="text-sm text-[#5B5348] leading-relaxed mt-1.5 pl-[22px]">{d}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-14">
                    <figure>
                        <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden border border-[#1E1B16]/15">
                            <Image src="/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg" alt="Interior aquecido do domo com cama e estufa a pellet" fill sizes="(max-width: 768px) 50vw, 540px" className="object-cover" />
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">Dentro do domo: cama e estufa a pellet</span>
                        </figcaption>
                    </figure>
                    <figure>
                        <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden border border-[#1E1B16]/15">
                            <Image src="/images/Galeria/domopiscinainvierno.jpg" alt="Vista aérea de um domo TreePod no bosque nevado" fill sizes="(max-width: 768px) 50vw, 540px" className="object-cover" />
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">Os domos vistos de cima, no inverno</span>
                        </figcaption>
                    </figure>
                </div>

                <div className="mt-20">
                    <SectionFolio num="N° 02" label="Tarifas e reserva" />
                    <div className="grid grid-cols-12 gap-x-6 gap-y-10 mt-4">
                        <div className="col-span-12 md:col-span-6">
                            <p className="dato text-[#5B5348]">Domos a partir de</p>
                            <p className="font-display font-medium text-[clamp(2.6rem,6vw,4rem)] leading-none text-[#1E1B16] mt-2">CLP $145.000</p>
                            <p className="text-sm text-[#5B5348] mt-2 leading-relaxed">
                                por noite · 2 pessoas · estadias de 2+ noites (pesos chilenos).<br />
                                Estadia de 1 noite: CLP $160.000.
                            </p>
                        </div>
                        <div className="col-span-12 md:col-span-6 space-y-3 self-center">
                            {[
                                "Melhor preço reservando direto, sem taxas de intermediários.",
                                "Confirme com 50% de sinal; o saldo é pago no check-in.",
                                "Pagamento online (Webpay) ou transferência combinada pelo WhatsApp.",
                            ].map((t) => (
                                <p key={t} className="flex items-start gap-3 text-[15px] text-[#1E1B16] leading-relaxed">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" /> {t}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="mt-10 flex flex-wrap items-center gap-6">
                        <Link href="/disponibilidad" className={btnPrimary}>Ver disponibilidade</Link>
                        <a href="https://wa.me/56984643307" className={linkLine}>
                            Fale conosco no WhatsApp <span aria-hidden="true">→</span>
                        </a>
                    </div>
                    <p className="text-[13px] text-[#5B5348] mt-4 italic font-display">
                        O calendário de reservas está em espanhol: &ldquo;Llegada&rdquo; é o check-in, &ldquo;Salida&rdquo; é o check-out.
                    </p>
                </div>

                <div className="mt-20">
                    <SectionFolio num="N° 03" label="Como chegar" />
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6 mt-4 text-[15px] text-[#5B5348] leading-relaxed">
                        <p className="col-span-12 md:col-span-6">
                            O TreePod fica no km 72 da rota N-55, a estrada asfaltada que sobe da cidade de
                            Chillán (cerca de 70 km) até o centro de esqui Nevados de Chillán. De Santiago são
                            uns 480 km — 5 a 6 horas de carro, ou trem/ônibus até Chillán mais um transfer
                            até o vale.
                        </p>
                        <p className="col-span-12 md:col-span-6">
                            Chegando de avião? O aeroporto de Concepción fica a cerca de 3 horas de carro, com
                            locadoras no terminal. O voo Santiago–Concepción leva cerca de uma hora.
                        </p>
                    </div>
                </div>

                <div className="mt-20">
                    <SectionFolio num="N° 04" label="Bom saber" />
                    <ul className="mt-4 space-y-3.5">
                        {goodToKnow.map((t) => (
                            <li key={t} className="flex items-start gap-3 text-[15px] text-[#1E1B16] leading-relaxed border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" /> {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <section className="py-20 md:py-24 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1100px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Valle Las Trancas · Chile" dark />
                    <h2 className="display-lg !text-[#F7F3EC] max-w-3xl">
                        Dias de powder terminam melhor <span className="italic text-[#00ADEF]">no bosque.</span>
                    </h2>
                    <div className="mt-10">
                        <Link href="/disponibilidad" className="inline-flex items-center justify-center rounded-[2px] bg-[#00ADEF] px-8 py-4 font-semibold text-[#1E1B16] ring-1 ring-offset-2 ring-offset-[#1E1B16] ring-[#00ADEF] hover:bg-[#33bdf2] transition-colors">
                            Ver disponibilidade
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
