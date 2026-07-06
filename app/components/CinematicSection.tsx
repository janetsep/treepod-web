import Image from "next/image";
import Link from "next/link";
import TriBullet from "./deco/TriBullet";

interface Props {
  image: string;
  alt: string;
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  ctaText?: string;
  ctaHref?: string;
  align?: "left" | "center"; // compat: la composición ancla siempre abajo-izquierda
  position?: string; // object-position
  priority?: boolean; // marcar como LCP cuando es el hero de la página
  titleAs?: "h1" | "h2"; // h1 cuando el hero es el título principal de la página
  stat?: string; // dato protagonista abajo-derecha (ej: "12")
  statCaption?: string; // pie del dato (ej: "minutos a Nevados de Chillán")
  photoCaption?: string; // pie de foto vertical en el borde derecho
}

// Pausa fotográfica a sangre completa: la foto manda, el texto se compone
// abajo-izquierda como leyenda de revista y el dato duro (si existe) ocupa la
// esquina opuesta. Scrim cálido charcoal, nunca negro de stock; CTA como
// enlace-línea, nunca píldora.
export default function CinematicSection({
  image,
  alt,
  eyebrow,
  title,
  text,
  ctaText,
  ctaHref,
  position = "center",
  priority = false,
  titleAs = "h2",
  stat,
  statCaption,
  photoCaption,
}: Props) {
  const TitleTag = titleAs;
  return (
    <section className="relative w-full min-h-[80vh] flex items-end overflow-hidden">
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
      {/* Scrim cálido inferior: deja ver la foto y mantiene el texto legible */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#1E1B16]/85 via-[#1E1B16]/25 to-transparent"
        aria-hidden="true"
      />
      {/* Velo superior sutil para el navbar transparente */}
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#1E1B16]/45 to-transparent"
        aria-hidden="true"
      />

      {photoCaption && (
        <span
          className="absolute right-3 bottom-20 z-10 hidden md:block [writing-mode:vertical-rl] text-[10px] tracking-[0.12em] uppercase text-white/70"
          aria-hidden="true"
        >
          {photoCaption}
        </span>
      )}

      <div className="cine-enter relative z-10 w-full mx-auto max-w-[1280px] px-5 md:px-10 pb-14 md:pb-20 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-8 items-end">
        <div className={`col-span-12 ${stat ? "lg:col-span-8" : "lg:col-span-9"}`}>
          {eyebrow && (
            <div className="flex items-baseline gap-3 mb-4">
              <TriBullet />
              <span className="font-display italic text-lg md:text-xl text-white/90">{eyebrow}</span>
            </div>
          )}
          <TitleTag className="display-lg !text-white drop-shadow-[0_2px_18px_rgba(30,27,22,0.6)]">
            {title}
          </TitleTag>
          {text && (
            <p className="text-white/85 text-base md:text-xl mt-4 leading-relaxed max-w-2xl drop-shadow-[0_2px_12px_rgba(30,27,22,0.6)]">
              {text}
            </p>
          )}
          {ctaText && ctaHref && (
            <div className="mt-8">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 font-semibold text-[15px] text-[#F7F3EC] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors"
              >
                {ctaText} <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>

        {stat && (
          <div className="col-span-12 lg:col-span-4 lg:text-right">
            <div className="font-display italic text-[clamp(4rem,8vw,7rem)] text-white leading-none tabular-nums">
              {stat}
            </div>
            {statCaption && (
              <div className="font-display italic text-[13px] text-white/85 mt-2">{statCaption}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
