"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { timeline } from "@/data/experience";
import { EXPO, DUR } from "@/lib/motion";
import { WordReveal } from "@/components/motion/TextReveal";

/**
 * Minimal timeline: rules and typography. Hovering a row slides it right and
 * wakes the arrow; nothing else moves.
 */
export default function Experience() {
  const reduced = useReducedMotion();
  return (
    <section id="experience" data-section className="section-pad bg-paper" aria-labelledby="exp-title">
      <div className="gutter">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <WordReveal text="06 · Experience / Education" as="span" className="label block" />
            <h2 id="exp-title" className="display-md mt-4">
              <WordReveal text="Where I've studied and shipped." as="span" className="block descenders" />
            </h2>
          </div>
        </div>

        <ol className="mt-[clamp(2.5rem,5vw,4rem)] border-t border-ink/20">
          {timeline.map((t, i) => (
            <motion.li
              key={t.title + t.period}
              className="group relative grid grid-cols-12 items-baseline gap-x-4 gap-y-2 border-b border-ink/20 py-[clamp(1.25rem,2.5vw,2rem)] transition-[padding] duration-500 ease-[var(--ease-out-expo)] hover:pl-4"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: DUR.reveal, ease: EXPO, delay: i * 0.05 }}
              data-cursor="text"
            >
              <span className="label col-span-6 tabular-nums md:col-span-2">{t.period}</span>
              <span className="label col-span-6 text-right text-mute md:col-span-1 md:text-left">{t.kind === "work" ? "Work" : "Edu"}</span>
              <span className="col-span-12 md:col-span-4">
                <span className="display-sm block">{t.title}</span>
                <span className="mt-1 block text-sm text-ink/70">{t.sub}</span>
              </span>
              <span className="col-span-12 text-sm md:col-span-3">
                {t.org}
                {t.note ? <span className="mt-1 block text-mute">{t.note}</span> : null}
              </span>
              <span className="col-span-12 flex justify-end md:col-span-2">
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.5}
                  className="translate-y-1 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100"
                  aria-hidden
                />
              </span>
            </motion.li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span className="label text-mute">Certification · JavaScript, Simplilearn</span>
          <span className="label text-mute">Open to internship · trainee · junior roles</span>
        </div>
      </div>
    </section>
  );
}
