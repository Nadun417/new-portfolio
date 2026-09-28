"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { pad2 } from "@/lib/utils";

/**
 * Editorial progress rail: current section index, a thin line that fills,
 * and the total. Sections are any element with [data-section]. On small
 * screens it collapses to a hairline across the top.
 */
export default function ScrollProgress({ total }: { total?: number }) {
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [count, setCount] = useState(total ?? 1);
  const pathname = usePathname();

  useGSAP(
    () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
      setCount(total ?? Math.max(1, sections.length));
      setIndex(1);

      // Document-space tops, re-measured after every ScrollTrigger refresh so
      // pinned sections (which live inside pin-spacers) are positioned correctly.
      let tops: number[] = [];
      const measure = () => {
        tops = sections.map((s) => {
          const spacer = s.parentElement?.classList.contains("pin-spacer") ? s.parentElement : s;
          return spacer.getBoundingClientRect().top + window.scrollY;
        });
      };
      measure();
      ScrollTrigger.addEventListener("refresh", measure);

      const st = ScrollTrigger.create({
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        refreshPriority: -10,
        onUpdate: (self) => {
          const p = self.progress;
          if (bar.current) gsap.set(bar.current, { scaleY: p });
          if (line.current) gsap.set(line.current, { scaleX: p });
          const y = window.scrollY + window.innerHeight * 0.45;
          let i = 0;
          for (let k = 0; k < tops.length; k++) {
            if (tops[k] <= y) i = k;
          }
          setIndex((prev) => (prev === i + 1 ? prev : i + 1));
        },
      });
      return () => {
        ScrollTrigger.removeEventListener("refresh", measure);
        st.kill();
      };
    },
    { dependencies: [total, pathname] }
  );

  return (
    <>
      {/* desktop rail */}
      <div
        ref={rail}
        className="pointer-events-none fixed bottom-[var(--gutter)] right-[calc(var(--gutter)*0.5)] z-[80] hidden flex-col items-center gap-3 mix-blend-difference lg:flex"
        aria-hidden
      >
        <span className="label text-paper tabular-nums" style={{ fontSize: 10 }}>
          {pad2(index)}
        </span>
        <div className="relative h-[8.5rem] w-px overflow-hidden bg-paper/25">
          <div ref={bar} className="absolute inset-0 origin-top bg-paper will-change-transform" style={{ transform: "scaleY(0)" }} />
        </div>
        <span className="label text-paper/70 tabular-nums" style={{ fontSize: 10 }}>
          {pad2(count)}
        </span>
      </div>
      {/* mobile hairline */}
      <div className="pointer-events-none fixed left-0 top-0 z-[80] h-[2px] w-full mix-blend-difference lg:hidden" aria-hidden>
        <div ref={line} className="h-full w-full origin-left bg-paper will-change-transform" style={{ transform: "scaleX(0)" }} />
      </div>
    </>
  );
}
