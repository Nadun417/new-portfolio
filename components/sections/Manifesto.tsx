"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { site } from "@/data/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { EXPO, DUR } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/utils";
import { ScrollTextReveal, WordReveal } from "@/components/motion/TextReveal";
import ParallaxImage from "@/components/motion/ParallaxImage";
import RevealMask from "@/components/motion/RevealMask";

/**
 * Four lines, four different entrances, one motion language. The in-view
 * trigger lives on the heading (always visible) and drives variants on the
 * masked lines; scroll displaces the lines horizontally via GSAP.
 */
const V = {
  rise: {
    hidden: { y: "130%" },
    visible: { y: "0%", transition: { duration: DUR.section, ease: EXPO } },
  },
  wipe: {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    visible: { clipPath: "inset(0 0% 0 0)", transition: { duration: DUR.section, ease: EXPO, delay: 0.1 } },
  },
  track: {
    hidden: { letterSpacing: "0.18em", opacity: 0 },
    visible: { letterSpacing: "-0.025em", opacity: 1, transition: { duration: DUR.section + 0.2, ease: EXPO, delay: 0.2 } },
  },
  settle: {
    hidden: { scale: 1.18, opacity: 0, y: "10%" },
    visible: { scale: 1, opacity: 1, y: "0%", transition: { duration: DUR.section, ease: EXPO, delay: 0.3 } },
  },
  strike: {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.7, ease: EXPO, delay: 1.0 } },
  },
};

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [l1, l2, l3, l4] = site.manifesto.lines;

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;
      root.current.querySelectorAll<HTMLElement>("[data-shift]").forEach((el) => {
        const amt = Number(el.dataset.shift || 0);
        gsap.fromTo(
          el,
          { x: `${-amt}vw` },
          { x: `${amt}vw`, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="manifesto" data-section className="section-pad relative overflow-hidden bg-paper" aria-labelledby="manifesto-title">
      <div className="gutter">
        <div className="mb-[clamp(2rem,5vw,4rem)] flex items-center gap-4">
          <span className="label">02 · Manifesto</span>
          <span className="rule w-16" aria-hidden />
        </div>

        <motion.h2
          id="manifesto-title"
          className="descenders relative font-display uppercase leading-[1.04] tracking-[-0.02em] text-[clamp(2.4rem,7.2vw,7.2rem)]"
          aria-label={site.manifesto.lines.join(" ")}
          initial={reduced ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          {/* 1: masked rise */}
          <span className="mask" data-shift="1.5" aria-hidden>
            <motion.span className="block" variants={V.rise}>
              {l1}
            </motion.span>
          </span>
          {/* 2: wipe from the left, indented */}
          <span className="block pl-[6vw]" data-shift="-2" aria-hidden>
            <motion.span className="block" variants={V.wipe}>
              {l2}
            </motion.span>
          </span>
          {/* 3: tracking tightens */}
          <span className="block pl-[3vw]" data-shift="2.5" aria-hidden>
            <motion.span className="block" variants={V.track}>
              {l3}
            </motion.span>
          </span>
          {/* 4: italic, settles from scale, then a line strikes through */}
          <span className="block pl-[10vw]" data-shift="-1.5" aria-hidden>
            <motion.span
              className="font-display-i relative inline-block normal-case tracking-[-0.01em]"
              variants={V.settle}
              style={{ transformOrigin: "left bottom" }}
            >
              {l4}
              <motion.span className="absolute left-0 top-[52%] h-[0.06em] w-full bg-accent" variants={V.strike} style={{ transformOrigin: "left" }} />
            </motion.span>
          </span>
        </motion.h2>

        {/* supporting copy + parallax image */}
        <div className="mt-[clamp(4rem,10vw,9rem)] grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-4 md:col-start-1">
            <div className="relative w-[74%] md:w-full">
              {/* offset outline for depth */}
              <span className="pointer-events-none absolute -bottom-3 -right-3 left-6 top-8 border border-ink/25" aria-hidden />
              {/* matted frame */}
              <div className="relative border border-ink/70 bg-paper p-[6px]">
                <RevealMask direction="up" className="aspect-[3/4] w-full">
                  <ParallaxImage src="/media/manifesto.jpg" alt="Nadun Mathuja, portrait" sizes="(max-width: 768px) 60vw, 30vw" speed={10} className="h-full w-full" />
                </RevealMask>
              </div>
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent" aria-hidden />
            </div>
            <p className="label mt-4 text-mute">Fig. 01 · The engineer</p>
          </div>

          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <ScrollTextReveal text={site.manifesto.intro} className="lead max-w-[38ch] text-[clamp(1.35rem,2.4vw,2.3rem)] leading-[1.25]" />

            <ul className="mt-[clamp(2.5rem,5vw,4rem)] border-t border-ink/15">
              {site.manifesto.pillars.map((p, i) => (
                <motion.li
                  key={p.n}
                  className="grid grid-cols-12 items-baseline gap-4 border-b border-ink/15 py-5"
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: DUR.reveal, ease: EXPO, delay: i * 0.08 }}
                >
                  <span className="label col-span-2 text-mute md:col-span-1">{p.n}</span>
                  <span className="display-sm col-span-10 md:col-span-5">{p.title}</span>
                  <span className="col-span-10 col-start-3 text-sm text-ink/70 md:col-span-6 md:col-start-7">{p.body}</span>
                </motion.li>
              ))}
            </ul>

            <WordReveal text="Software engineering + UI/UX + creative front-end + product thinking." as="p" className="label mt-8 text-mute" />
          </div>
        </div>
      </div>
    </section>
  );
}
