"use client";

/**
 * Text animation system.
 *
 *  LineReveal        explicit lines, each masked and rising into place
 *  WordReveal        a sentence split into masked words
 *  CharacterReveal   masked characters, words kept unbreakable
 *  SplitTextReveal   one entry point choosing between the three
 *  ScrollTextReveal  scroll-scrubbed word opacity (GSAP ScrollTrigger)
 *
 * All respect prefers-reduced-motion by rendering the final state.
 */

import { createElement, useMemo, useRef, type ComponentProps, type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EXPO, DUR } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Trigger = "view" | "mount" | "manual";

type BaseProps = {
  className?: string;
  as?: RevealTag;
  delay?: number;
  stagger?: number;
  duration?: number;
  trigger?: Trigger;
  /** for trigger="manual" */
  visible?: boolean;
  once?: boolean;
  amount?: number;
  style?: React.CSSProperties;
};

function useAnimateProps({ trigger = "view", visible, once = true, amount = 0.4 }: BaseProps) {
  const reduced = useReducedMotion();
  if (reduced) return { initial: "visible", animate: "visible" } as const;
  if (trigger === "mount") return { initial: "hidden", animate: "visible" } as const;
  if (trigger === "manual") return { initial: "hidden", animate: visible ? "visible" : "hidden" } as const;
  return { initial: "hidden", whileInView: "visible", viewport: { once, amount } } as const;
}

/** Pre-built motion tags, so components are never created during render. */
const TAGS = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  li: motion.li,
  a: motion.a,
} as const;
export type RevealTag = keyof typeof TAGS;

/** Renders the pre-built motion element for `tag`, with no component creation in render. */
function Tagged({ tag, ...props }: { tag: RevealTag } & ComponentProps<typeof motion.div>) {
  return createElement((TAGS[tag] ?? motion.div) as typeof motion.div, props);
}

// Hidden state starts 130% below (not just 110%) so a mask that paints a little
// past its box (see `.name-reveal` in globals.css, which lets display-type
// descenders show) still keeps the pre-reveal glyph fully clipped. The extra
// travel is invisible for every mask (the glyph is hidden until it crosses in).
const unit = (delay: number, stagger: number, duration: number) => ({
  hidden: { y: "130%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration, ease: EXPO, delay: delay + i * stagger },
  }),
});

/* ------------------------------------------------------------------ */
export function LineReveal({
  lines,
  className,
  lineClassName,
  as: Tag = "div",
  delay = 0,
  stagger = 0.09,
  duration = DUR.reveal,
  style,
  ...rest
}: BaseProps & { lines: ReactNode[]; lineClassName?: string }) {
  const anim = useAnimateProps(rest);
  const v = useMemo(() => unit(delay, stagger, duration), [delay, stagger, duration]);

  return (
    <Tagged tag={Tag} className={className} style={style} {...anim}>
      {lines.map((line, i) => (
        <span key={i} className={cn("mask", lineClassName)}>
          <motion.span custom={i} variants={v} className="block">
            {line}
          </motion.span>
        </span>
      ))}
    </Tagged>
  );
}

/* ------------------------------------------------------------------ */
export function WordReveal({
  text,
  className,
  as: Tag = "p",
  delay = 0,
  stagger = 0.035,
  duration = DUR.reveal,
  style,
  ...rest
}: BaseProps & { text: string }) {
  const anim = useAnimateProps(rest);
  const v = useMemo(() => unit(delay, stagger, duration), [delay, stagger, duration]);
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <Tagged tag={Tag} className={className} style={style} aria-label={text} {...anim}>
      {words.map((w, i) => (
        <span key={i} className="mask-inline" aria-hidden>
          <motion.span custom={i} variants={v}>
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tagged>
  );
}

/* ------------------------------------------------------------------ */
export function CharacterReveal({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  stagger = 0.028,
  duration = DUR.reveal,
  style,
  ...rest
}: BaseProps & { text: string }) {
  const anim = useAnimateProps(rest);
  const v = useMemo(() => unit(delay, stagger, duration), [delay, stagger, duration]);
  const words = useMemo(() => text.split(" "), [text]);

  let idx = 0;
  return (
    <Tagged tag={Tag} className={className} style={style} aria-label={text} {...anim}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {Array.from(w).map((ch, ci) => {
            const i = idx++;
            return (
              <span key={ci} className="mask-inline">
                <motion.span custom={i} variants={v}>
                  {ch}
                </motion.span>
              </span>
            );
          })}
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tagged>
  );
}

/* ------------------------------------------------------------------ */
export function SplitTextReveal({
  type = "words",
  text,
  lines,
  ...props
}: BaseProps & { type?: "lines" | "words" | "chars"; text?: string; lines?: ReactNode[] }) {
  if (type === "lines") return <LineReveal lines={lines ?? [text]} {...props} />;
  if (type === "chars") return <CharacterReveal text={text ?? ""} {...props} />;
  return <WordReveal text={text ?? ""} {...props} />;
}

/* ------------------------------------------------------------------ */
/** Words brighten as the block scrolls through the viewport (scrubbed). */
export function ScrollTextReveal({
  text,
  className,
  as: Tag = "p",
  start = "top 80%",
  end = "top 35%",
  dim = 0.18,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  start?: string;
  end?: string;
  dim?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const spans = ref.current.querySelectorAll<HTMLElement>("[data-w]");
      gsap.fromTo(
        spans,
        { opacity: dim },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: { trigger: ref.current, start, end, scrub: true },
        }
      );
    },
    { scope: ref, dependencies: [text] }
  );

  const T = Tag as ElementType;
  return (
    <T ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} data-w aria-hidden style={{ opacity: reduced ? 1 : dim }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </T>
  );
}

export { ScrollTrigger };
