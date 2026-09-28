"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { skillsRowA, skillsRowB, type Skill } from "@/data/skills";
import { EXPO } from "@/lib/motion";
import Marquee from "@/components/motion/Marquee";
import { WordReveal } from "@/components/motion/TextReveal";

function SkillItem({ skill, dark }: { skill: Skill; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex items-center px-[clamp(1rem,2.2vw,2rem)]"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      data-cursor="text"
    >
      <motion.span
        className="display-md whitespace-nowrap uppercase"
        animate={{ opacity: open ? 1 : 0.9, y: open ? -6 : 0 }}
        transition={{ duration: 0.45, ease: EXPO }}
      >
        {skill.name}
      </motion.span>
      <span className="ml-[clamp(1rem,2.2vw,2rem)] h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />

      <AnimatePresence>
        {open && (
          <motion.span
            className={`absolute left-[clamp(1rem,2.2vw,2rem)] top-full z-10 flex flex-col gap-[2px] pt-2 ${dark ? "text-paper" : "text-ink"}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            aria-hidden
          >
            {skill.facets.map((f, i) => (
              <span key={f} className="mask">
                <motion.span
                  className="label block whitespace-nowrap"
                  variants={{
                    hidden: { y: "110%", transition: { duration: 0.25, ease: EXPO, delay: (2 - i) * 0.03 } },
                    visible: { y: "0%", transition: { duration: 0.5, ease: EXPO, delay: i * 0.06 } },
                  }}
                >
                  {f}
                </motion.span>
              </span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * Kinetic typography instead of percentage bars. Two rows travel in
 * opposite directions; hovering a technology slows the row and unfolds
 * what that technology means in practice.
 */
export default function Skills() {
  return (
    <section id="skills" data-section className="relative overflow-hidden bg-ink py-[clamp(5rem,12vw,11rem)] text-paper" aria-labelledby="skills-title">
      <div className="gutter mb-[clamp(3rem,6vw,5rem)] grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <WordReveal text="04 · Capabilities" as="span" className="label block text-paper/60" />
          <h2 id="skills-title" className="display-md mt-4">
            <WordReveal text="Tools, in practice." as="span" className="block" />
          </h2>
        </div>
        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <WordReveal
            text="No percentage bars. Hover a technology to see what it actually means in the work: the systems, patterns and decisions behind it."
            as="p"
            className="max-w-[40ch] text-sm leading-relaxed text-paper/70"
            delay={0.1}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[clamp(2rem,4vw,3.5rem)] border-y border-paper/15 py-[clamp(2rem,4vw,3.5rem)]">
        <Marquee speed={55} direction={1} slowOnHover ariaLabel={skillsRowA.map((s) => s.name).join(", ")} className="overflow-visible">
          {skillsRowA.map((s) => (
            <SkillItem key={s.name} skill={s} dark />
          ))}
        </Marquee>
        <span className="rule-paper mx-[var(--gutter)]" aria-hidden />
        <Marquee speed={48} direction={-1} slowOnHover ariaLabel={skillsRowB.map((s) => s.name).join(", ")} className="overflow-visible">
          {skillsRowB.map((s) => (
            <SkillItem key={s.name} skill={s} dark />
          ))}
        </Marquee>
      </div>

      <div className="gutter mt-[clamp(2rem,4vw,3rem)] flex flex-wrap justify-between gap-4">
        <span className="label text-paper/50">Also: PHP · Java · Flask · Electron · Power BI · Vitest · pytest · Git</span>
        <span className="label text-paper/50">← → opposite directions</span>
      </div>
    </section>
  );
}
