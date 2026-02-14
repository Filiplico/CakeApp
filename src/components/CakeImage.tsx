"use client";

import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/cakes/placeholder.png";

type CakeImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function CakeImage({
  src,
  alt,
  fill = true,
  sizes,
  className,
  priority,
}: CakeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      className={className ?? ""}
      priority={priority}
      onError={() => setImgSrc(PLACEHOLDER)}
      style={{ objectFit: "cover" }}
    />
  );
}
