"use client";

import { motion, useReducedMotion } from "motion/react";
import { EXPO, DUR } from "@/lib/motion";

/** Minimal code plate. Monochrome, numbered, no highlighter dependency. */
export default function CodeBlock({ code, file, language }: { code: string; file: string; language: string }) {
  const reduced = useReducedMotion();
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <motion.div initial={reduced ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <motion.figure
        className="overflow-hidden border border-paper/15 bg-ink text-paper"
        variants={{
          hidden: { clipPath: "inset(0 0 100% 0)" },
          visible: { clipPath: "inset(0 0 0% 0)", transition: { duration: DUR.section, ease: EXPO } },
        }}
      >
        <figcaption className="flex items-center justify-between border-b border-paper/15 px-4 py-3">
          <span className="label">{file}</span>
          <span className="label text-paper/50">{language}</span>
        </figcaption>
        <pre className="code overflow-x-auto px-4 py-4" tabIndex={0}>
          <code>
            {lines.map((l, i) => (
              <span key={i} className="grid grid-cols-[2.5rem_1fr]">
                <span className="select-none text-paper/30">{String(i + 1).padStart(2, "0")}</span>
                <span className="whitespace-pre">{l || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </motion.figure>
    </motion.div>
  );
}
