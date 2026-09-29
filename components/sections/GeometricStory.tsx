"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

// The door is a full-screen layer cut down by a clip-path, rather than a box
// whose width and height change. Resizing the box forced a layout and a
// re-clip of the playing video on every scroll frame, which made the reel
// stutter; animating the clip leaves layout alone. Values are the doorway
// opening: top, right, bottom, left, then the corner radii (half the door's
// width, so the crown is a semicircle). Both states keep the same units in
// the same order so GSAP can interpolate between them.
const DOOR_DESKTOP = "inset(22svh 37vw 0svh 37vw round 13vw 13vw 0vw 0vw)"; // 26vw wide, 78svh tall
const DOOR_MOBILE = "inset(36svh 18vw 0svh 18vw round 32vw 32vw 0vw 0vw)"; // 64vw wide, 64svh tall
const DOOR_OPEN = "inset(0svh 0vw 0svh 0vw round 0vw 0vw 0vw 0vw)";

/**
 * The door. A tall arched doorway stands in the middle of the page showing
 * the reel. As you scroll, the door zooms toward you and opens: it grows and
 * its arched crown flattens until you have passed through it into the scene,
 * full-bleed. One pinned GSAP timeline, scrubbed by scroll.
 */
export default function GeometricStory() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const door = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const eyebrow = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const flankL = useRef<HTMLDivElement>(null);
  const flankR = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const finale = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const v = video.current;
    if (v) {
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {});
    }
  }, []);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      if (reduced) {
        gsap.set(door.current, { clipPath: DOOR_OPEN });
        gsap.set(video.current, { scale: 1 });
        gsap.set([eyebrow.current, caption.current, flankL.current, flankR.current], { autoAlpha: 0 });
        gsap.set(scrim.current, { autoAlpha: 1 });
        if (finale.current) gsap.set(finale.current.querySelectorAll("[data-fl]"), { yPercent: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          // starting doorway: stands on the floor (bottom of the frame),
          // tall and narrow with an arched crown
          const closed = desktop ? DOOR_DESKTOP : DOOR_MOBILE;

          gsap.set(door.current, { clipPath: closed });
          gsap.set(video.current, { scale: 1.25 });
          const flLines = finale.current ? finale.current.querySelectorAll<HTMLElement>("[data-fl]") : [];
          gsap.set(flLines, { yPercent: 130 });
          gsap.set(scrim.current, { autoAlpha: 0 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${desktop ? 320 : 260}%`,
              pin: stage.current,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (progress.current) {
                  const pct = Math.round(self.progress * 100);
                  const txt = String(pct).padStart(2, "0");
                  if (progress.current.textContent !== txt) progress.current.textContent = txt;
                }
              },
              onEnter: () => video.current?.play().catch(() => {}),
              onEnterBack: () => video.current?.play().catch(() => {}),
              onLeave: () => video.current?.pause(),
              onLeaveBack: () => video.current?.pause(),
            },
          });

          tl
            // labels + flanking credo fade out as you step through the door
            .to(eyebrow.current, { autoAlpha: 0, duration: 0.25 }, 0)
            .to(caption.current, { autoAlpha: 0, duration: 0.25 }, 0)
            .to([flankL.current, flankR.current], { autoAlpha: 0, duration: 0.2 }, 0)
            // the door zooms open toward you until it is full-bleed, its crown flattening
            // (fromTo with explicit strings: read back from the page, the clip
            // would come in pixels and no longer line up with the target units)
            .fromTo(door.current, { clipPath: closed }, { clipPath: DOOR_OPEN, ease: "power2.inOut", duration: 1 }, 0)
            // the scene settles from a slight zoom as the door fills the frame
            .to(video.current, { scale: 1, ease: "power2.out", duration: 1 }, 0)
            // a scrim + closing statement rise over the full-bleed reel
            .fromTo(scrim.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.72)
            .to(flLines, { yPercent: 0, stagger: 0.09, duration: 0.55, ease: "power2.out" }, 0.82)
            .to({}, { duration: 0.3 });
        }
      );

      return () => mm.revert();
    },
    { scope: section }
  );

  return (
    <section ref={section} id="story" data-section className="relative bg-paper" aria-label="Showreel: step through the door">
      <div ref={stage} className="relative flex h-[100svh] w-full items-end justify-center overflow-hidden bg-paper">
        {/* eyebrow */}
        <div ref={eyebrow} className="pointer-events-none absolute inset-x-0 top-[calc(var(--nav-h)+clamp(0.5rem,2vw,1.5rem))] z-[3] flex flex-col items-center gap-3" aria-hidden>
          <span className="label text-mute">The practice</span>
          <span className="h-8 w-px bg-ink/30" />
        </div>

        {/* flanking credo: fills the space either side of the door, reads
            across it, and fades out the moment the door starts to open */}
        <div
          ref={flankL}
          className="pointer-events-none absolute left-[var(--gutter)] right-[calc(63vw+3.5rem)] top-[52%] z-[3] hidden -translate-y-1/2 flex-col items-end gap-4 text-right lg:flex"
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
          ref={flankR}
          className="pointer-events-none absolute left-[calc(63vw+3.5rem)] right-[var(--gutter)] top-[52%] z-[3] hidden -translate-y-1/2 flex-col items-start gap-4 lg:flex"
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

        {/* the door */}
        <div ref={door} className="absolute inset-0 z-[2] overflow-hidden bg-ink" style={{ clipPath: DOOR_DESKTOP }}>
          <video
            ref={video}
            className="h-full w-full object-cover will-change-transform"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster="/media/reel-poster.jpg"
          >
            <source src="/media/reel.webm" type="video/webm" />
            <source src="/media/reel.mp4" type="video/mp4" />
          </video>
        </div>

        {/* caption, blended so it reads over the dark door and the paper alike */}
        <div ref={caption} className="pointer-events-none absolute inset-x-0 bottom-[clamp(1.5rem,3vw,2.5rem)] z-[3] flex items-end justify-between px-[var(--gutter)] mix-blend-difference text-paper" aria-hidden>
          <span className="label">© 2026 · Showreel</span>
          <span className="label">Scroll to step through</span>
        </div>

        {/* scrim over the reel once it is full-bleed, so the closing line reads.
            Darker through the centre band where the text sits, so cream type stays
            legible even over the brightest (cloud/sunset) frames of the reel. */}
        <div ref={scrim} className="pointer-events-none absolute inset-0 z-[3]" style={{ background: "radial-gradient(125% 105% at 50% 50%, rgba(14,14,14,0.62) 0%, rgba(14,14,14,0.5) 42%, rgba(14,14,14,0.78) 100%)" }} aria-hidden />

        {/* closing statement, which rises over the full-bleed scene at the end */}
        <div
          ref={finale}
          className="pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-4 px-[var(--gutter)] text-center text-paper"
          style={{ textShadow: "0 2px 34px rgba(0,0,0,0.6)" }}
          aria-hidden
        >
          <span className="mask">
            <span data-fl className="label block text-paper/85">The practice</span>
          </span>
          <h3 className="descenders font-display leading-[0.95]">
            <span className="mask block">
              <span data-fl className="block text-[clamp(2.6rem,7vw,7rem)] uppercase tracking-[-0.02em]">Engineering</span>
            </span>
            <span className="mask block">
              <span data-fl className="font-display-i block text-[clamp(1.6rem,4vw,4.2rem)]">with a designer&apos;s eye.</span>
            </span>
          </h3>
          <span className="mask mt-2">
            <span data-fl className="label block text-paper/80">Selected work below ↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
