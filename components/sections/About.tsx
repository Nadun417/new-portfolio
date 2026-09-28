"use client";

import { motion, useReducedMotion } from "motion/react";
import { site } from "@/data/site";
import { EXPO, DUR } from "@/lib/motion";
import { LineReveal, WordReveal } from "@/components/motion/TextReveal";
import RevealMask from "@/components/motion/RevealMask";
import ParallaxImage from "@/components/motion/ParallaxImage";

/**
 * Editorial about. Title and portrait share the top row in separate columns;
 * labels, bio and facts share the second row. Nothing sits on anything.
 */
export default function About() {
  const reduced = useReducedMotion();
  return (
    <section id="about" data-section data-nav-id="about" className="section-pad relative overflow-hidden border-t border-ink/15 bg-paper" aria-labelledby="about-title">
      <div className="gutter">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-7">
            <WordReveal text="05 · About" as="span" className="label block" />
            <LineReveal lines={site.about.title as unknown as string[]} as="h2" className="display-xl mt-4" lineClassName="last:pl-[10vw]" />
            <span id="about-title" className="sr-only">
              About Nadun
            </span>
          </div>

          <div className="col-span-9 col-start-4 mt-6 md:col-span-4 md:col-start-9">
            <div className="relative">
              {/* offset outline behind, for depth without a hard shadow */}
              <span className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-ink/30" aria-hidden />
              {/* frame matches the photo's 4:5 shape: full image edge to edge,
                  no crop and no side letterbox */}
              <RevealMask direction="up" className="relative aspect-[4/5] w-full">
                <div className="h-full w-full overflow-hidden">
                  <ParallaxImage
                    src="/media/about.jpg"
                    alt="Nadun Mathuja"
                    sizes="(max-width: 768px) 80vw, 32vw"
                    speed={0}
                    overscan={1}
                    className="h-full w-full"
                  />
                </div>
              </RevealMask>
              {/* accent at a corner */}
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
            </div>
            <div className="mt-4 flex justify-between">
              <span className="label text-mute">Fig. 02 · Galle, 2026</span>
              <span className="label text-mute">Nadun M.</span>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(3rem,7vw,7rem)] grid grid-cols-12 gap-x-6 gap-y-12">
          <ul className="col-span-12 border-t border-ink/15 md:col-span-3">
            {site.about.labels.map((l, i) => (
              <motion.li
                key={l.n}
                className="flex items-baseline gap-4 border-b border-ink/15 py-4"
                initial={reduced ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: DUR.reveal, ease: EXPO, delay: i * 0.07 }}
              >
                <span className="label text-mute">{l.n}</span>
                <span className="label-sans">{l.t}</span>
              </motion.li>
            ))}
          </ul>

          <div className="col-span-12 md:col-span-6 md:col-start-5">
            <WordReveal text={site.about.bio[0]} as="p" className="lead text-[clamp(1.25rem,2vw,1.9rem)] leading-[1.3]" />
            {site.about.bio.slice(1).map((p, i) => (
              <motion.p
                key={i}
                className="mt-6 max-w-[52ch] text-ink/75"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: DUR.reveal, ease: EXPO, delay: 0.1 + i * 0.08 }}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <dl className="col-span-12 md:col-span-2 md:col-start-11">
            {site.about.facts.map((f) => (
              <div key={f.k} className="border-b border-ink/15 py-3">
                <dt className="label text-mute">{f.k}</dt>
                <dd className="mt-1 text-sm">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
