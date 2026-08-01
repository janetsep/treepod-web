import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CinematicSection from "../components/CinematicSection";
import SectionFolio from "../components/SectionFolio";
import TriBullet from "../components/deco/TriBullet";
import GeoDivider from "../components/deco/GeoDivider";
import { btnPrimary, linkLine } from "../components/deco/cta";

export const metadata: Metadata = {
    title: "Ski Lodging Near Nevados de Chillán | TreePod Geodesic Domes",
    description:
        "Warm geodesic domes in the native forest of Valle Las Trancas, a 12-minute drive from Nevados de Chillán ski resort. Automatic heating, Starlink Wi-Fi, direct booking.",
    alternates: {
        canonical: "/en",
        languages: {
            es: "/",
            en: "/en",
            pt: "/pt",
        },
    },
    openGraph: {
        title: "Ski Lodging Near Nevados de Chillán | TreePod",
        description:
            "Geodesic domes in the forest, 12 minutes from the slopes. Automatic pellet heating, Starlink Wi-Fi, direct booking.",
        url: "/en",
        images: ["/images/hero/domonieve2.jpeg"],
        locale: "en_US",
    },
};

// Ficha práctica: mismo formato de tabla de leyenda que Ubicacion (KM 72)
const facts: Array<[string, string, string]> = [
    ["Drive to Nevados de Chillán ski resort", "12 min", "Ski in the morning, thermal baths in the afternoon, and come back to a warm dome in the forest."],
    ["Automatic pellet stove", "no wood", "The stove is programmable and refills itself. Your dome stays warm through the night, even when it snows outside."],
    ["Starlink satellite Wi-Fi", "high speed", "Real internet in the mountains: upload your powder photos or take a work call."],
    ["Kitchen in your dome + barbecue", "included", "Full kitchen, Nespresso coffee machine, and a barbecue grill we bring to your dome."],
    ["Parking next to your dome", "free", "Load and unload your ski gear a few steps from the door."],
    ["Capacity per dome", "up to 4", "One queen bed plus a loft. We have 4 domes in total."],
];

const goodToKnow = [
    "No pets, to protect the native forest wildlife.",
    "The wood-fired hot tub is a seasonal service (spring to autumn). It does not operate during the ski season.",
    "Ski and snowboard rental shops are available in Las Trancas village, minutes from the domes.",
    "In winter, carabineros may require snow chains on the road to the ski resort. Carry them.",
];

export default function EnglishSkiPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen" lang="en">
            <CinematicSection
                image="/images/hero/domonieve2.jpeg"
                alt="TreePod geodesic dome covered in snow in Valle Las Trancas, Chile"
                eyebrow="Valle Las Trancas · Ñuble, Chile"
                title={<>Sleep 12 minutes from the slopes, <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[8px]">in a warm dome in the forest</span></>}
                text="TreePod is a 4-dome glamping in the native forest of Valle Las Trancas, on the road to Nevados de Chillán — one of South America's best-known powder destinations."
                priority
                titleAs="h1"
                stat="4,9"
                statCaption="209 reviews across all platforms"
                photoCaption="Winter at TreePod, Valle Las Trancas"
            />

            <GeoDivider left="22%" />

            <main className="mx-auto max-w-[1100px] px-5 md:px-10 py-16 md:py-24">
                <p className="dato text-[#5B5348] mb-10">
                    <Link href="/" className="underline decoration-[#00ADEF] decoration-2 underline-offset-4 hover:text-[#008CBF]">Español</Link>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <Link href="/pt" className="underline decoration-[#00ADEF] decoration-2 underline-offset-4 hover:text-[#008CBF]">Português</Link>
                </p>

                <SectionFolio num="N° 01" label="Why skiers stay here" />
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
                            <Image src="/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg" alt="Warm dome interior with bed and pellet stove" fill sizes="(max-width: 768px) 50vw, 540px" className="object-cover" />
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">Inside the dome: bed and pellet stove</span>
                        </figcaption>
                    </figure>
                    <figure>
                        <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden border border-[#1E1B16]/15">
                            <Image src="/images/Galeria/domopiscinainvierno.jpg" alt="Aerial view of a TreePod dome in the snowy forest" fill sizes="(max-width: 768px) 50vw, 540px" className="object-cover" />
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">The domes from above, in winter</span>
                        </figcaption>
                    </figure>
                </div>

                <div className="mt-20">
                    <SectionFolio num="N° 02" label="Rates and booking" />
                    <div className="grid grid-cols-12 gap-x-6 gap-y-10 mt-4">
                        <div className="col-span-12 md:col-span-6">
                            <p className="dato text-[#5B5348]">Domes from</p>
                            <p className="font-display font-medium text-[clamp(2.6rem,6vw,4rem)] leading-none text-[#1E1B16] mt-2">CLP $145.000</p>
                            <p className="text-sm text-[#5B5348] mt-2 leading-relaxed">
                                per night · 2 guests · stays of 2+ nights.<br />
                                Single-night stays: CLP $160.000.
                            </p>
                        </div>
                        <div className="col-span-12 md:col-span-6 space-y-3 self-center">
                            {[
                                "Best price booking direct — no middleman fees.",
                                "Confirm with a 50% deposit; the balance is paid at check-in.",
                                "Online payment (Webpay) or bank transfer coordinated by WhatsApp.",
                            ].map((t) => (
                                <p key={t} className="flex items-start gap-3 text-[15px] text-[#1E1B16] leading-relaxed">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" /> {t}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="mt-10 flex flex-wrap items-center gap-6">
                        <Link href="/disponibilidad" className={btnPrimary}>Check availability</Link>
                        <a href="https://wa.me/56984643307" className={linkLine}>
                            WhatsApp us in English <span aria-hidden="true">→</span>
                        </a>
                    </div>
                    <p className="text-[13px] text-[#5B5348] mt-4 italic font-display">
                        The booking calendar is in Spanish: &ldquo;Llegada&rdquo; is your check-in date, &ldquo;Salida&rdquo; your check-out.
                    </p>
                </div>

                <div className="mt-20">
                    <SectionFolio num="N° 03" label="Getting here" />
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6 mt-4 text-[15px] text-[#5B5348] leading-relaxed">
                        <p className="col-span-12 md:col-span-6">
                            TreePod sits at km 72 of route N-55, the paved road that climbs from the city of
                            Chillán (about 70 km) to the Nevados de Chillán ski resort. From Santiago it is
                            around 480 km — 5 to 6 hours by car, or a train/bus ride to Chillán plus a transfer
                            up the valley.
                        </p>
                        <p className="col-span-12 md:col-span-6">
                            Flying in? Concepción airport is about a 3-hour drive away, with car rentals at the
                            terminal. Santiago–Concepción flights take around one hour.
                        </p>
                    </div>
                </div>

                <div className="mt-20">
                    <SectionFolio num="N° 04" label="Good to know" />
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
                        Powder days end better <span className="italic text-[#00ADEF]">in the forest.</span>
                    </h2>
                    <div className="mt-10">
                        <Link href="/disponibilidad" className="inline-flex items-center justify-center rounded-[2px] bg-[#00ADEF] px-8 py-4 font-semibold text-[#1E1B16] ring-1 ring-offset-2 ring-offset-[#1E1B16] ring-[#00ADEF] hover:bg-[#33bdf2] transition-colors">
                            Check availability
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
