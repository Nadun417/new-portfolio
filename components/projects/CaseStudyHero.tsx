"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { EXPO, DUR } from "@/lib/motion";
import { pad2 } from "@/lib/utils";
import { CharacterReveal, WordReveal } from "@/components/motion/TextReveal";
import TransitionLink from "@/components/layout/TransitionLink";
import ArtImage from "./ArtImage";

/**
 * The case study opens on the same fullscreen media the transition flew in
 * on, so the hand-off is invisible. Title and meta reveal over it.
 */
export default function CaseStudyHero({ project }: { project: Project }) {
  const reduced = useReducedMotion();
  return (
    <header className="relative bg-ink text-paper">
      <div className="relative h-[100svh] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EXPO }}
        >
          {/* landscape on landscape screens, portrait on phones held upright */}
          <ArtImage
            src={project.media.hero}
            swap={{ media: "(orientation: portrait)", src: project.media.card }}
            alt={project.media.alt}
            sizes="100vw"
            eager
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/10" aria-hidden />
        {/* keeps the back link and counter legible on light images */}
        <div className="absolute inset-x-0 top-0 h-[30svh] bg-gradient-to-b from-ink/80 via-ink/35 to-transparent" aria-hidden />

        <div className="gutter absolute inset-x-0 top-0 flex items-center justify-between pt-[calc(var(--nav-h)+0.5rem)]">
          <TransitionLink href="/#work" label="Work" className="label-sans flex items-center gap-2 py-2" data-cursor="text">
            <ArrowLeft size={14} strokeWidth={1.5} aria-hidden /> All work
          </TransitionLink>
          <span className="label">{project.number} / {pad2(projects.length)}</span>
        </div>

        <div className="gutter absolute inset-x-0 bottom-0 pb-[clamp(2rem,5vw,4rem)]">
          <WordReveal text={project.category} as="span" className="label block text-paper/80" trigger="mount" delay={0.5} />
          <h1 className="display-xl mt-3">
            <CharacterReveal text={project.title} as="span" className="block" trigger="mount" delay={0.55} stagger={0.03} />
          </h1>
          <WordReveal
            text={`${project.tagline[0]} ${project.tagline[1]}`}
            as="p"
            className="font-display-i mt-3 max-w-[24ch] text-[clamp(1.5rem,3vw,3rem)] leading-[1.05]"
            trigger="mount"
            delay={0.8}
          />
        </div>
      </div>

      {/* meta row */}
      <motion.dl
        className="gutter grid grid-cols-2 gap-x-6 gap-y-6 border-t border-paper/15 py-[clamp(1.5rem,3vw,2.5rem)] md:grid-cols-4"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.reveal, ease: EXPO, delay: 1 }}
      >
        {[
          ["Category", project.category],
          ["Role", project.role],
          ["Year", project.year],
          ["Tools", project.stack.join(" · ")],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="label text-paper/55">{k}</dt>
            <dd className="mt-2 text-sm leading-relaxed">{v}</dd>
          </div>
        ))}
      </motion.dl>
    </header>
  );
}
