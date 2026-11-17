"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "fill" | "width" | "height" | "placeholder" | "blurDataURL"> & {
  preview?: string;
  containerClassName?: string;
};

// La vista previa permanece debajo: Next/Image quita su blur de golpe al cargar.
// Aquí solo la foto ya decodificada gana opacidad, sin dejar un cuadro vacío.
export default function PhotoImage({
  preview,
  containerClassName = "",
  className = "",
  style,
  src,
  alt,
  onLoad,
  ...props
}: Props) {
  const [loadedSrc, setLoadedSrc] = useState<ImageProps["src"] | null>(null);

  return (
    <span
      className={`photo-image absolute inset-0 ${containerClassName}`}
      data-loaded={loadedSrc === src || !preview}
    >
      {preview && (
        <span
          aria-hidden="true"
          className={`photo-preview absolute inset-0 ${className}`}
          style={{
            ...style,
            backgroundImage: `url("${preview}")`,
            backgroundSize: "cover",
            backgroundPosition: style?.objectPosition ?? "center",
            filter: "blur(8px)",
          }}
        />
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        fill
        placeholder="empty"
        className={`photo-full ${className}`}
        style={style}
        onLoad={(event) => {
          setLoadedSrc(src);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
