"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { site } from "@/data/site";
import { useAppReady } from "@/lib/ready";
import { useFinePointer } from "@/lib/hooks";
import { prefersReducedMotion } from "@/lib/utils";
import { CharacterReveal, WordReveal } from "@/components/motion/TextReveal";

/**
 * Full-bleed cinematic video hero. The reel (/media/hero.mp4|webm) plays behind
 * the type; the name is set large over the darker sky, and the composition
 * (labels top, name centre-left, supporting row along the bottom) is built to
 * fit inside one viewport. Dark theme (light type) with gradient washes so the
 * type stays legible over the brighter, busier parts of the footage.
 */
export default function Hero() {
  const ready = useAppReady();
  const fine = useFinePointer();
  const videoRef = useRef<HTMLVideoElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spx = useSpring(px, { stiffness: 50, damping: 20, mass: 0.9 });
  const spy = useSpring(py, { stiffness: 50, damping: 20, mass: 0.9 });
  const bgX = useTransform(spx, (v) => v * 14);
  const bgY = useTransform(spy, (v) => v * 14);
  const typeX = useTransform(spx, (v) => v * -6);
  const typeY = useTransform(spy, (v) => v * -6);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    if (prefersReducedMotion()) v.pause();
    else v.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine, px, py]);

  return (
    <section id="top" data-section className="relative h-[100svh] min-h-[600px] overflow-hidden bg-ink text-paper" aria-label="Introduction">
      {/* full-bleed reel; drop any clip at /media/hero.mp4 (+ .webm) to swap it */}
      <motion.div className="absolute inset-[-3%] will-change-transform" style={{ x: bgX, y: bgY }} aria-hidden>
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero-poster.jpg"
        >
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* legibility washes over the footage */}
      <div className="absolute inset-0" style={{ background: "rgba(14,14,16,0.2)" }} aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[26%]" style={{ background: "linear-gradient(180deg, rgba(14,14,16,0.7) 0%, rgba(14,14,16,0) 100%)" }} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-[44%]" style={{ background: "linear-gradient(0deg, rgba(14,14,16,0.92) 0%, rgba(14,14,16,0.35) 42%, rgba(14,14,16,0) 100%)" }} aria-hidden />
      <div className="grain absolute inset-0" aria-hidden />

      {/* composition */}
      <div className="gutter relative z-[2] grid h-full grid-cols-12 grid-rows-[auto_1fr_auto] pb-[clamp(1.5rem,3vw,2.5rem)] pt-[calc(var(--nav-h)+clamp(0.75rem,2.5vw,2rem))]">
        {/* corner labels */}
        <div className="col-span-7 flex flex-col gap-1 md:col-span-5">
          {site.hero.labels.map((l, i) => (
            <WordReveal key={l} text={l} as="span" className="label block" trigger="manual" visible={ready} delay={0.1 + i * 0.05} />
          ))}
        </div>
        <div className="col-span-5 flex flex-col items-end gap-1 text-right md:col-span-7">
          <WordReveal text={site.year} as="span" className="label block" trigger="manual" visible={ready} delay={0.15} />
          <WordReveal text={site.location} as="span" className="label block text-paper/55" trigger="manual" visible={ready} delay={0.2} />
        </div>

        {/* name, sized to fit the left column and the viewport height */}
        <div className="col-span-12 row-start-2 flex flex-col justify-center">
          <motion.h1
            className="font-display uppercase leading-[0.86] tracking-[-0.03em]"
            style={{ x: typeX, y: typeY, fontSize: "clamp(2.9rem, 8.6vw, 8.75rem)" }}
            aria-label={site.name}
          >
            <span className="block">
              <CharacterReveal text={site.first} as="span" trigger="manual" visible={ready} delay={0.25} stagger={0.045} className="block descenders" />
            </span>
            <span className="block pl-[6vw] md:pl-[12vw]">
              <CharacterReveal text={site.last} as="span" trigger="manual" visible={ready} delay={0.45} stagger={0.04} className="block descenders" />
            </span>
          </motion.h1>
        </div>

        {/* bottom row */}
        <div className="col-span-12 row-start-3 grid grid-cols-12 items-end gap-x-6 gap-y-4 border-t border-paper/20 pt-5">
          <div className="col-span-6 flex items-center gap-4 md:col-span-3">
            <motion.span
              className="relative block h-10 w-px overflow-hidden bg-paper/30"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0, transition: { delay: 0.9 } }}
            >
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-paper"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4 }}
              />
            </motion.span>
            <WordReveal text={site.hero.scroll} as="span" className="label block" trigger="manual" visible={ready} delay={0.8} />
          </div>

          <div className="col-span-12 md:col-span-5 md:col-start-5">
            <WordReveal
              text={site.roleLine}
              as="p"
              className="max-w-[34ch] text-[clamp(0.95rem,1.15vw,1.15rem)] leading-[1.4] text-paper/85"
              trigger="manual"
              visible={ready}
              delay={0.7}
              stagger={0.025}
            />
          </div>

          <div className="col-span-12 hidden items-center justify-end gap-3 md:col-span-3 md:flex">
            <WordReveal text="Est. Galle" as="span" className="label block text-paper/55" trigger="manual" visible={ready} delay={0.9} />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
