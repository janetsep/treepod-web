import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  image: string;
  alt: string;
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  ctaText?: string;
  ctaHref?: string;
  align?: "left" | "center";
  position?: string; // object-position
  priority?: boolean; // marcar como LCP cuando es el hero de la página
  titleAs?: "h1" | "h2"; // h1 cuando el hero es el título principal de la página
}

// Sección inmersiva a sangre completa: foto grande de fondo, degradado cinematográfico
// y texto editorial gigante encima. Da la sensación de "estar ahí" — el corazón del
// rediseño cinematográfico.
export default function CinematicSection({
  image,
  alt,
  eyebrow,
  title,
  text,
  ctaText,
  ctaHref,
  align = "left",
  position = "center",
  priority = false,
  titleAs = "h2",
}: Props) {
  const TitleTag = titleAs;
  return (
    <section className="relative w-full min-h-[78vh] md:min-h-screen flex items-end overflow-hidden">
      <Image
        src={image}
        alt={alt}
        fill
        quality={75}
        priority={priority}
        sizes="100vw"
        className="object-cover ken-burns-soft"
        style={{ objectPosition: position }}
      />
      {/* Degradado abajo: deja ver la foto y mantiene el texto legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      {/* Velo superior sutil: asegura el contraste del navbar transparente sobre la foto */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      <div
        className={`cine-enter relative z-10 container mx-auto px-4 md:px-12 pb-16 md:pb-24 ${
          align === "center" ? "text-center mx-auto max-w-4xl" : "max-w-3xl"
        }`}
      >
        {eyebrow && (
          <span className="inline-block text-[#00ADEF] text-xs md:text-sm font-black tracking-[0.3em] uppercase mb-5">
            {eyebrow}
          </span>
        )}
        <TitleTag className="!text-white font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
          {title}
        </TitleTag>
        {text && (
          <p
            className={`text-white/90 text-sm sm:text-lg md:text-2xl mt-4 md:mt-6 leading-relaxed font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] ${
              align === "center" ? "mx-auto" : ""
            } max-w-2xl`}
          >
            {text}
          </p>
        )}
        {ctaText && ctaHref && (
          <div className={`mt-9 ${align === "center" ? "flex justify-center" : ""}`}>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-[#00ADEF] hover:bg-[#0098d4] text-white font-semibold text-base px-8 py-4 rounded-full shadow-xl active:scale-95 transition-all"
            >
              {ctaText} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
