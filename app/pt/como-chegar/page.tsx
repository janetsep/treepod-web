import type { Metadata } from "next";
import Link from "next/link";
import CinematicSection from "../../components/CinematicSection";
import SectionFolio from "../../components/SectionFolio";
import TriBullet from "../../components/deco/TriBullet";
import GeoDivider from "../../components/deco/GeoDivider";
import { btnPrimary, linkLine } from "../../components/deco/cta";

export const metadata: Metadata = {
    title: "Como Chegar ao Valle Las Trancas desde Santiago | TreePod",
    description:
        "Guia para brasileiros: como chegar ao Valle Las Trancas e Nevados de Chillán desde Santiago de carro, trem, ônibus ou avião via Concepción. Tempos, rotas e dicas.",
    alternates: {
        canonical: "/pt/como-chegar",
        languages: {
            es: "/blog/como-llegar-valle-las-trancas-desde-santiago",
            pt: "/pt/como-chegar",
        },
    },
    openGraph: {
        title: "Como Chegar ao Valle Las Trancas desde Santiago | TreePod",
        description:
            "De carro, trem, ônibus ou avião via Concepción: todas as opções de transporte público e privado até o Valle Las Trancas, com tempos e dicas.",
        url: "/pt/como-chegar",
        images: ["/images/Galeria/Las Trancas Bosque Nativo 2.jpeg"],
        locale: "pt_BR",
    },
};

// Guia de transporte para brasileiros: público e privado, sem cifras inventadas.
const opciones: Array<{ titulo: string; dato: string; parrafos: string[] }> = [
    {
        titulo: "De carro desde Santiago (privado)",
        dato: "5–6 h",
        parrafos: [
            "São cerca de 480 km: Ruta 5 Sur até Chillán (autoestrada com pedágios) e depois a rota N-55, asfaltada, subindo 72 km até o valle. A carteira de habilitação brasileira é aceita para turistas — leve também seu documento de identidade.",
            "No inverno, os carabineros podem exigir correntes para neve no trecho final. As locadoras de Santiago e Concepción alugam correntes junto com o carro: peça ao reservar.",
        ],
    },
    {
        titulo: "De trem: Santiago–Chillán (público)",
        dato: "~4h30",
        parrafos: [
            "A EFE opera trens de Santiago (Estación Central) a Chillán, com várias saídas por dia. É a opção de transporte público mais confortável. Horários e passagens em efe.cl.",
            "De Chillán ao valle (72 km, cerca de 1 hora), siga de transfer, ônibus rural ou carro alugado — veja o último bloco.",
        ],
    },
    {
        titulo: "De ônibus: Santiago–Chillán (público)",
        dato: "5–6 h",
        parrafos: [
            "Empresas como Tur Bus, Pullman Bus e Buses Bío Bío cobrem a rota Santiago–Chillán. Horários e preços variam por dia e temporada: consulte pasajebus.com ou cada empresa.",
        ],
    },
    {
        titulo: "De avião: via Concepción",
        dato: "~1 h de voo",
        parrafos: [
            "Não há voos diretos do Brasil à região: voe ao aeroporto de Santiago (SCL) e de lá pegue um voo doméstico a Concepción (Sky, JetSmart ou LATAM, cerca de 1 hora). No aeroporto de Concepción há locadoras de carro; de lá ao valle são cerca de 3 horas dirigindo, passando por Chillán.",
        ],
    },
    {
        titulo: "O último trecho: de Chillán ao valle",
        dato: "72 km",
        parrafos: [
            "Se você chegou a Chillán de trem ou ônibus, as opções até o Valle Las Trancas são: ônibus rural (frequência limitada, algumas saídas por dia), transfer privado ou radiotáxi (preço varia por temporada) e carro alugado em Chillán.",
            "Importante: em Las Trancas não há Uber nem táxis 24 horas. Combine o transfer de volta com antecedência — podemos ajudar a coordenar pelo WhatsApp.",
        ],
    },
];

const dicas = [
    "Moeda: pesos chilenos (CLP). Cartões são amplamente aceitos, mas leve algum dinheiro para os minimercados do valle.",
    "Mercado: se vier de carro, vale abastecer a despensa em Chillán; no valle há minimercados a minutos dos domos.",
    "Inverno (junho a setembro): pneus em bom estado e correntes para neve no trecho final até o centro de esqui.",
    "Chip ou roaming: no domo você não precisa — o Wi-Fi é Starlink, de alta velocidade.",
];

export default function ComoChegarPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen" lang="pt">
            <CinematicSection
                image="/images/Galeria/Las Trancas Bosque Nativo 2.jpeg"
                alt="Bosque nativo no caminho ao Valle Las Trancas, Chile"
                eyebrow="Guia para brasileiros"
                title={<>Como chegar ao Valle Las Trancas <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[8px]">desde Santiago</span></>}
                text="De carro, trem, ônibus ou avião via Concepción: todas as opções de transporte público e privado até o km 72, onde ficam os domos."
                priority
                titleAs="h1"
                photoCaption="Bosque nativo, Valle Las Trancas"
            />

            <GeoDivider left="30%" />

            <main className="mx-auto max-w-[1100px] px-5 md:px-10 py-16 md:py-24">
                <p className="dato text-[#5B5348] mb-10">
                    <Link href="/pt" className="underline decoration-[#00ADEF] decoration-2 underline-offset-4 hover:text-[#008CBF]">← Voltar: domos TreePod em português</Link>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <Link href="/blog/como-llegar-valle-las-trancas-desde-santiago" className="underline decoration-[#00ADEF] decoration-2 underline-offset-4 hover:text-[#008CBF]">Versión en español</Link>
                </p>

                <SectionFolio num="N° 01" label="As opções, uma a uma" />
                <div className="border-b border-[#1E1B16]/12 mt-4">
                    {opciones.map((op, i) => (
                        <section key={op.titulo} className="border-t border-[#1E1B16]/12 py-8 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-4">
                            <span className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums" aria-hidden="true">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="col-span-10 md:col-span-4">
                                <h2 className="display-md text-[#1E1B16]">{op.titulo}</h2>
                                <p className="dato text-[#008CBF] mt-2">{op.dato}</p>
                            </div>
                            <div className="col-span-12 md:col-span-7 space-y-3 self-center">
                                {op.parrafos.map((p) => (
                                    <p key={p.slice(0, 24)} className="text-[15px] text-[#5B5348] leading-relaxed">{p}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-16">
                    <SectionFolio num="N° 02" label="Dicas práticas" />
                    <ul className="mt-4 space-y-3.5">
                        {dicas.map((t) => (
                            <li key={t} className="flex items-start gap-3 text-[15px] text-[#1E1B16] leading-relaxed border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" /> {t}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-16 flex flex-wrap items-center gap-6">
                    <Link href="/disponibilidad" className={btnPrimary}>Ver disponibilidade</Link>
                    <a href="https://wa.me/56984643307" className={linkLine}>
                        Dúvidas? Fale conosco no WhatsApp <span aria-hidden="true">→</span>
                    </a>
                </div>
            </main>
        </div>
    );
}
