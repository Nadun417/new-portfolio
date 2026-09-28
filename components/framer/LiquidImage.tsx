"use client";

import { useReducedMotion } from "motion/react";
import Vendored from "./vendor/LiquidImage.js";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  /** displacement amount on hover (0.01–0.5) */
  strength?: number;
  /** animation speed (0.01–1) */
  speed?: number;
  /** grayscale that reveals colour under the pointer */
  colorReveal?: boolean;
  fit?: "cover" | "contain" | "fill";
  borderRadius?: number;
  className?: string;
};

/**
 * WebGL liquid-distortion image (Framer community component by gustavwf).
 * The pointer warps the image and reveals colour from a grayscale base.
 * Falls back to a plain <img> when reduced motion is requested.
 */
export default function LiquidImage({
  src,
  alt,
  strength = 0.14,
  speed = 0.16,
  colorReveal = true,
  fit = "cover",
  borderRadius = 0,
  className,
}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <Vendored
        sourceType="image"
        image={{ src, alt }}
        strength={strength}
        speed={speed}
        colorReveal={colorReveal}
        fit={fit}
        borderRadius={borderRadius}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
