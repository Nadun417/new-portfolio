"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { EXPO, DUR } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import CaseStudyHero from "./CaseStudyHero";
import ProjectMedia from "./ProjectMedia";
import { LineReveal, ScrollTextReveal, WordReveal } from "@/components/motion/TextReveal";
import RevealMask from "@/components/motion/RevealMask";
import ParallaxImage from "@/components/motion/ParallaxImage";
import { MagneticLink } from "@/components/motion/Magnetic";
import Footer from "@/components/layout/Footer";

function Block({ n, title, children, className, dark }: { n: string; title: string; children: ReactNode; className?: string; dark?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      data-section
      className={cn("gutter grid grid-cols-12 gap-x-6 gap-y-8 py-[clamp(3.5rem,8vw,7rem)]", dark ? "border-t border-paper/15" : "border-t border-ink/15", className)}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: DUR.reveal, ease: EXPO }}
      aria-labelledby={`cs-${n}`}
    >
      <div className="col-span-12 md:col-span-3">
        <span className={cn("label block", dark ? "text-paper/55" : "text-mute")}>{n}</span>
        <h2 id={`cs-${n}`} className="display-sm mt-2">
          {title}
        </h2>
      </div>
      <div className="col-span-12 md:col-span-8 md:col-start-5">{children}</div>
    </motion.section>
  );
}

const Para = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("max-w-[60ch] text-[clamp(1rem,1.25vw,1.2rem)] leading-[1.55] text-ink/85", className)}>{children}</p>
);

export default function CaseStudy({ project, next }: { project: Project; next: Project }) {
  const cs = project.caseStudy;
  const reduced = useReducedMotion();


  return (
    <main className="bg-paper text-ink">
      <CaseStudyHero project={project} />

      {/* overview */}
      <section data-section className="gutter grid grid-cols-12 gap-x-6 py-[clamp(4rem,10vw,9rem)]">
        <div className="col-span-12 md:col-span-9 md:col-start-3">
          <ScrollTextReveal text={cs.overview} className="lead text-[clamp(1.5rem,3vw,3rem)] leading-[1.2]" />
        </div>
        <div className="col-span-12 mt-10 flex flex-wrap gap-x-8 gap-y-3 md:col-span-9 md:col-start-3">
          {project.categoryList.map((c) => (
            <span key={c} className="label">
              {c}
            </span>
          ))}
        </div>
        <div className="col-span-12 mt-8 flex flex-wrap gap-x-8 gap-y-3 md:col-span-9 md:col-start-3">
          {project.links.live && (
            <MagneticLink href={project.links.live} external className="label-sans gap-1" data-cursor="open">
              Live site <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden />
            </MagneticLink>
          )}
          {project.links.repo ? (
            <MagneticLink href={project.links.repo} external className="label-sans gap-1" data-cursor="open">
              Code on GitHub <ArrowUpRight size={12} strokeWidth={1.5} aria-hidden />
            </MagneticLink>
          ) : (
            <span className="label text-mute">Private repository (client work)</span>
          )}
        </div>
      </section>

      {/* full-width media */}
      <RevealMask direction="up" className="mx-[var(--gutter)] aspect-[2/1] max-h-[80svh]">
        <ParallaxImage src={project.media.hero} alt={project.media.alt} sizes="100vw" speed={8} className="h-full w-full" />
      </RevealMask>

      <Block n="01" title="The brief">
        {cs.context.map((p, i) => (
          <Para key={i} className={i ? "mt-5" : ""}>
            {p}
          </Para>
        ))}
      </Block>

      <Block n="02" title="What it does">
        <ul className="border-t border-ink/15">
          {cs.features.map((f, i) => (
            <li key={f} className="grid grid-cols-[3rem_1fr] items-baseline gap-3 border-b border-ink/15 py-3 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-relaxed">
              <span className="label text-mute">{pad2(i + 1)}</span>
              {f}
            </li>
          ))}
        </ul>
      </Block>

      {/* key numbers on a dark plate */}
      {cs.facts && cs.facts.length > 0 && (
        <section data-section className="bg-ink text-paper">
          <div className="gutter grid grid-cols-12 gap-x-6 gap-y-10 py-[clamp(4rem,9vw,8rem)]">
            <div className="col-span-12 md:col-span-3">
              <span className="label block text-paper/55">03</span>
              <h2 className="display-sm mt-2">In numbers</h2>
            </div>
            <div className="col-span-12 md:col-span-8 md:col-start-5">
              <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-3">
                {cs.facts.map((r, i) => (
                  <motion.div
                    key={r.label}
                    className="border-t border-paper/20 pt-4"
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: DUR.reveal, ease: EXPO, delay: i * 0.08 }}
                  >
                    <span className="font-display block text-[clamp(3rem,6vw,6rem)] leading-none">{r.stat}</span>
                    <span className="label mt-3 block text-paper/60">{r.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* next project */}
      <section data-section className="gutter border-t border-ink/15 py-[clamp(4rem,9vw,8rem)]">
        <WordReveal text="Next project" as="span" className="label block text-mute" />
        <div className="mt-6 grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-7">
            <LineReveal lines={[next.number, next.title]} as="h2" className="display-lg" lineClassName="first:text-mute" />
            <p className="font-display-i mt-3 text-[clamp(1.35rem,2.4vw,2.4rem)] leading-[1.05]">
              {next.tagline[0]} {next.tagline[1]}
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9">
            <ProjectMedia project={next} className="aspect-[4/3] w-full" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        </div>
      </section>

      <Footer dark={false} />
    </main>
  );
}
