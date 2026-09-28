"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/data/site";
import { EXPO, QUART_IN_OUT } from "@/lib/motion";
import { markReady } from "@/lib/ready";
import { prefersReducedMotion } from "@/lib/utils";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useMounted } from "@/lib/hooks";

const STEP_MS = 300; // per counter step
const WORD_MS = 420; // per word
const SESSION_KEY = "nm:loaded";

/**
 * Cinematic loader: N / 26, a stepped counter (00 to 100), words cycling
 * through a mask, then the curtain lifts. Runs once per session.
 *
 * Rendered on the server so the first paint is the curtain, not the hero;
 * an inline script in the layout hides it before paint on repeat visits.
 * Words and digits are stacked strips that slide inside a mask, so there are no
 * enter/exit races, always one line tall.
 */
export default function Preloader() {
  const lenis = useLenis();
  const mounted = useMounted();
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);
  const [word, setWord] = useState(0);
  const [exiting, setExiting] = useState(false);
  const finished = useRef(false);

  const steps = site.loader.steps;
  const words = site.loader.words;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    markReady();
    lenis?.start();
    window.setTimeout(() => ScrollTrigger.refresh(), 50);
  };

  // decide whether to run, deferred a frame so it's a callback rather than a render side-effect
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {}
      if (seen || prefersReducedMotion()) {
        setShow(false);
        finish();
      }
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // lock scroll while the curtain is up
  useEffect(() => {
    if (mounted && show && !exiting) lenis?.stop();
  }, [mounted, show, exiting, lenis]);

  // counter and words, only once we know the loader is really running
  useEffect(() => {
    if (!mounted || !show) return;
    const t: number[] = [];
    steps.forEach((_, i) => t.push(window.setTimeout(() => setStep(i), 220 + i * STEP_MS)));
    words.forEach((_, i) => t.push(window.setTimeout(() => setWord(i), 120 + i * WORD_MS)));
    const total = 220 + (steps.length - 1) * STEP_MS + 420;
    t.push(window.setTimeout(() => setExiting(true), total));
    return () => t.forEach(clearTimeout);
  }, [mounted, show, steps, words]);

  const value = steps[step];
  const labels = steps.map((v) => String(v).padStart(2, "0"));

  return (
    <AnimatePresence onExitComplete={finish}>
      {show && !exiting && (
        <motion.div
          key="loader"
          className="preloader fixed inset-0 z-[1200] bg-ink text-paper"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.95, ease: QUART_IN_OUT, delay: 0.25 } }}
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="gutter relative flex h-full flex-col justify-between py-[var(--gutter)]">
            {/* top row */}
            <div className="flex items-start justify-between">
              <motion.span
                className="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.6, ease: EXPO } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                {site.loader.mark}
              </motion.span>
              <motion.span
                className="label text-paper/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.6, ease: EXPO, delay: 0.1 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                Portfolio · {site.year}
              </motion.span>
            </div>

            {/* centre word: a strip of words sliding inside a one-line mask */}
            <div className="flex items-center">
              <div className="display-lg overflow-hidden" style={{ height: "1em", lineHeight: 1 }} aria-hidden>
                <motion.div
                  className="will-change-transform"
                  animate={{ y: `${-word}em` }}
                  transition={{ duration: 0.65, ease: EXPO }}
                  exit={{ y: `${-(word + 1.1)}em`, transition: { duration: 0.5, ease: EXPO } }}
                >
                  {words.map((w) => (
                    <span key={w} className="block" style={{ height: "1em", lineHeight: 1 }}>
                      {w}
                    </span>
                  ))}
                </motion.div>
              </div>
              <span className="sr-only">{words[word]}</span>
            </div>

            {/* bottom row */}
            <div className="flex items-end justify-between">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.6, ease: EXPO, delay: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <span className="label text-paper/50">Loading</span>
                <span className="relative block h-px w-[clamp(4rem,12vw,10rem)] bg-paper/20">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-paper"
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5, ease: EXPO }}
                  />
                </span>
              </motion.div>

              <div
                className="font-display overflow-hidden tabular-nums"
                style={{ fontSize: "clamp(4rem, 12vw, 11rem)", height: "1em", lineHeight: 1 }}
                aria-hidden
              >
                <motion.div
                  className="will-change-transform"
                  animate={{ y: `${-step}em` }}
                  transition={{ duration: 0.55, ease: EXPO }}
                  exit={{ y: `${-(step + 1.1)}em`, transition: { duration: 0.45, ease: EXPO } }}
                >
                  {labels.map((l, i) => (
                    <span key={i} className="block text-right" style={{ height: "1em", lineHeight: 1 }}>
                      {l}
                    </span>
                  ))}
                </motion.div>
              </div>
              <span className="sr-only">{value}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
