"use client";

import ScrollDoorReveal from "@/components/motion/ScrollDoorReveal";

// Darker through the centre band where the closing line sits, so cream type
// stays legible even over the brightest (cloud/sunset) frames of the reel.
const SCRIM = "radial-gradient(125% 105% at 50% 50%, rgba(14,14,14,0.62) 0%, rgba(14,14,14,0.5) 42%, rgba(14,14,14,0.78) 100%)";

/**
 * The showreel. A tall arched doorway stands in the middle of the page showing
 * the reel; as you scroll, the door opens until you have passed through it
 * into the scene, full-bleed. The motion lives in ScrollDoorReveal; this file
 * is the words around it.
 */
export default function GeometricStory() {
  return (
    <ScrollDoorReveal
      id="story"
      data-section
      className="bg-paper"
      aria-label="Showreel: step through the door"
      sources={[
        { src: "/media/reel.webm", type: "video/webm" },
        { src: "/media/reel.mp4", type: "video/mp4" },
      ]}
      poster="/media/reel-poster.jpg"
      background="var(--color-paper)"
      doorColor="var(--color-ink)"
      scrim={SCRIM}
    >
      {/* eyebrow */}
      <div data-door-fade className="pointer-events-none absolute inset-x-0 top-[calc(var(--nav-h)+clamp(0.5rem,2vw,1.5rem))] flex flex-col items-center gap-3" aria-hidden>
        <span className="label text-mute">The practice</span>
        <span className="h-8 w-px bg-ink/30" />
      </div>

      {/* flanking credo: fills the space either side of the door, reads
          across it, and fades out the moment the door starts to open */}
      <div
        data-door-fade
        className="pointer-events-none absolute left-[var(--gutter)] right-[calc(63vw+3.5rem)] top-[52%] hidden -translate-y-1/2 flex-col items-end gap-4 text-right lg:flex"
        aria-hidden
      >
        <span className="label text-mute">01 · Showreel</span>
        <span className="font-display text-[clamp(2rem,3.6vw,3.8rem)] leading-[0.98]">
          The systems
          <br />
          <span className="font-display-i">nobody sees.</span>
        </span>
      </div>
      <div
        data-door-fade
        className="pointer-events-none absolute left-[calc(63vw+3.5rem)] right-[var(--gutter)] top-[52%] hidden -translate-y-1/2 flex-col items-start gap-4 lg:flex"
        aria-hidden
      >
        <span className="font-display text-[clamp(2rem,3.6vw,3.8rem)] leading-[0.98]">
          The surface
          <br />
          <span className="font-display-i">everyone feels.</span>
        </span>
        <p className="max-w-[26ch] text-sm leading-relaxed text-ink/70">
          A reel of the practice: the architecture, the interface, and the small moments in between.
        </p>
      </div>

      {/* caption, blended so it reads over the dark door and the paper alike */}
      <div data-door-fade className="pointer-events-none absolute inset-x-0 bottom-[clamp(1.5rem,3vw,2.5rem)] flex items-end justify-between px-[var(--gutter)] mix-blend-difference text-paper" aria-hidden>
        <span className="label">© 2026 · Showreel</span>
        <span className="label">Scroll to step through</span>
      </div>

      {/* closing statement, which rises over the full-bleed scene at the end */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-[var(--gutter)] text-center text-paper"
        style={{ textShadow: "0 2px 34px rgba(0,0,0,0.6)" }}
        aria-hidden
      >
        <span className="mask">
          <span data-door-rise className="label block text-paper/85">The practice</span>
        </span>
        <h3 className="descenders font-display leading-[0.95]">
          <span className="mask block">
            <span data-door-rise className="block text-[clamp(2.6rem,7vw,7rem)] uppercase tracking-[-0.02em]">Engineering</span>
          </span>
          <span className="mask block">
            <span data-door-rise className="font-display-i block text-[clamp(1.6rem,4vw,4.2rem)]">with a designer&apos;s eye.</span>
          </span>
        </h3>
        <span className="mask mt-2">
          <span data-door-rise className="label block text-paper/80">Selected work below ↓</span>
        </span>
      </div>
    </ScrollDoorReveal>
  );
}
