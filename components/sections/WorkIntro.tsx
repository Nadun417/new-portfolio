"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { projects } from "@/data/projects";
import { LineReveal, WordReveal } from "@/components/motion/TextReveal";

/**
 * Prepares the direction change. A giant line drifts sideways with scroll and
 * the arrow turns from down to right as the horizontal section approaches.
 */
export default function WorkIntro() {
  const root = useRef<HTMLElement>(null);
  const drift = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 };
      gsap.fromTo(drift.current, { xPercent: 6 }, { xPercent: -22, ease: "none", scrollTrigger: st });
      gsap.fromTo(arrow.current, { rotate: 90 }, { rotate: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom 60%", scrub: 0.6 } });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="work-intro" data-section className="relative overflow-hidden border-t border-ink/15 bg-paper py-[clamp(4rem,10vw,9rem)]" aria-labelledby="work-title">
      <div className="gutter grid grid-cols-12 gap-6">
        <div className="col-span-6 md:col-span-3">
          <WordReveal text="03 · Selected work" as="span" className="label block" />
        </div>
        <div className="col-span-6 flex justify-end md:col-span-3 md:col-start-10">
          <WordReveal text={`${String(projects.length).padStart(2, "0")} projects`} as="span" className="label block text-right" />
        </div>

        <div className="col-span-12 mt-[clamp(2rem,4vw,3rem)]">
          <LineReveal
            lines={["Selected", "work"]}
            as="h2"
            className="display-xl"
            lineClassName="last:pl-[14vw]"
          />
          <span id="work-title" className="sr-only">
            Selected work
          </span>
        </div>

        <div className="col-span-12 mt-[clamp(1.5rem,3vw,2.5rem)] flex flex-wrap items-center justify-between gap-6 border-t border-ink/15 pt-6">
          <span className="label">2024 to 2026</span>
          <span className="label flex items-center gap-3 text-mute">
            <span>Scroll direction changes</span>
            <span ref={arrow} className="inline-block text-ink" aria-hidden>
              →
            </span>
          </span>
        </div>
      </div>

      {/* drifting line, purely decorative */}
      <div ref={drift} className="pointer-events-none mt-[clamp(3rem,6vw,5rem)] whitespace-nowrap will-change-transform" aria-hidden>
        <span className="font-display-i text-[clamp(3rem,9vw,10rem)] leading-none text-ink/12">
          case studies · systems · interfaces · motion · case studies · systems · interfaces · motion ·
        </span>
      </div>

    </section>
  );
}
