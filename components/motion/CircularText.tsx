"use client";

import { cn } from "@/lib/utils";

/** Rotating circular label on an SVG textPath. Pure CSS rotation, so it's cheap. */
export default function CircularText({
  text = "Available for work · 2026 · Galle, Sri Lanka · ",
  size = 160,
  className,
  duration = 24,
}: {
  text?: string;
  size?: number;
  className?: string;
  duration?: number;
}) {
  return (
    <svg
      className={cn("circular-text", className)}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden
      style={{ animation: `spin ${duration}s linear infinite` }}
    >
      <defs>
        <path id="ct-path" d="M 100,100 m -76,0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0" />
      </defs>
      <text
        fill="currentColor"
        style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.22em", textTransform: "uppercase" }}
      >
        <textPath href="#ct-path" startOffset="0%">
          {text.toUpperCase()}
        </textPath>
      </text>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .circular-text { transform-origin: 50% 50%; } @media (prefers-reduced-motion: reduce) { .circular-text { animation: none !important; } }`}</style>
    </svg>
  );
}
