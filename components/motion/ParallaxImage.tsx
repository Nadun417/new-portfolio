"use client";

import { useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

type Props = Omit<ImageProps, "fill"> & {
  /** percent of height the image travels while crossing the viewport */
  speed?: number;
  className?: string;
  imgClassName?: string;
  /** overscale so the parallax never shows edges */
  overscan?: number;
};

/**
 * Large-scale image parallax tied to scroll (GSAP scrub). The container
 * clips; the image is oversized and translated as it crosses the viewport.
 */
export default function ParallaxImage({
  speed = 12,
  className,
  imgClassName,
  overscan = 1.18,
  alt,
  sizes = "100vw",
  ...img
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !wrap.current || !inner.current) return;
      gsap.fromTo(
        inner.current,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    },
    { scope: wrap, dependencies: [speed] }
  );

  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)}>
      <div ref={inner} className="absolute inset-0 will-change-transform" style={{ scale: overscan }}>
        <Image alt={alt} fill sizes={sizes} className={cn("object-cover", imgClassName)} {...img} />
      </div>
    </div>
  );
}
