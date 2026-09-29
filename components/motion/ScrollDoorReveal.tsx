"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, useGSAP);

type Size = { width: number; height: number };

export type ScrollDoorRevealProps = Omit<ComponentPropsWithoutRef<"section">, "children"> & {
  /** video sources, in order of preference */
  sources: { src: string; type: string }[];
  poster?: string;
  /** the closed door as a share of the viewport: width in vw, height in svh */
  door?: { desktop: Size; mobile: Size };
  /** how far the visitor scrolls while the section is pinned, in % of the viewport height */
  length?: { desktop: number; mobile: number };
  /** media query for the desktop door and length; everything else gets mobile */
  breakpoint?: string;
  /** how zoomed in the video starts; it settles to 1 as the door opens */
  zoom?: number;
  /** colour around the door */
  background?: string;
  /** colour inside the door before the video paints */
  doorColor?: string;
  /** CSS background faded over the open door so closing text reads; false for none */
  scrim?: string | false;
  /**
   * Overlays, drawn above the door in order. Mark anything that should fade out
   * as the door opens with `data-door-fade`, and closing lines that rise into
   * view at the end with `data-door-rise` (wrap each in an overflow-hidden
   * element so it rises out of a mask).
   */
  children?: ReactNode;
};

// The door is a full-screen layer cut down by a clip-path, rather than a box
// whose width and height change. Resizing the box forced a layout and a
// re-clip of the playing video on every scroll frame, which made the video
// stutter; animating the clip leaves layout alone. The clip is the doorway
// opening (top, right, bottom, left, then the corner radii at half the door's
// width, so the crown is a semicircle), standing on the bottom of the frame.
// Open and closed keep the same units in the same order so GSAP can
// interpolate between them.
const round = (n: number) => Math.round(n * 1000) / 1000;
const closedClip = ({ width, height }: Size) => {
  const side = round((100 - width) / 2);
  const r = round(width / 2);
  return `inset(${round(100 - height)}svh ${side}vw 0svh ${side}vw round ${r}vw ${r}vw 0vw 0vw)`;
};
const OPEN_CLIP = "inset(0svh 0vw 0svh 0vw round 0vw 0vw 0vw 0vw)";

/**
 * A tall arched doorway stands at the bottom of a pinned, full-screen stage
 * with a video playing inside it. As the visitor scrolls, the door opens until
 * the video is full-bleed, anything marked `data-door-fade` fades away, and
 * lines marked `data-door-rise` rise over the finished scene. One GSAP
 * timeline, scrubbed by scroll; visitors who prefer reduced motion get the
 * open scene straight away.
 */
export default function ScrollDoorReveal({
  sources,
  poster,
  door = { desktop: { width: 26, height: 78 }, mobile: { width: 64, height: 64 } },
  length = { desktop: 320, mobile: 260 },
  breakpoint = "(min-width: 1024px)",
  zoom = 1.25,
  background = "#F1EFE9",
  doorColor = "#101010",
  scrim = "rgba(14,14,14,0.6)",
  children,
  style,
  ...rest
}: ScrollDoorRevealProps) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const doorway = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const shade = useRef<HTMLDivElement>(null);

  // Some browsers only honour autoplay once muted is set as a property too.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.play().catch(() => {});
  }, []);

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const fades = root.querySelectorAll<HTMLElement>("[data-door-fade]");
      const rises = root.querySelectorAll<HTMLElement>("[data-door-rise]");
      const shadeEl = shade.current; // null when scrim is false

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(doorway.current, { clipPath: OPEN_CLIP });
        gsap.set(video.current, { scale: 1 });
        if (fades.length) gsap.set(fades, { autoAlpha: 0 });
        if (shadeEl) gsap.set(shadeEl, { autoAlpha: 1 });
        if (rises.length) gsap.set(rises, { yPercent: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add({ desktop: breakpoint, mobile: `not all and ${breakpoint}` }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const closed = closedClip(desktop ? door.desktop : door.mobile);

        gsap.set(doorway.current, { clipPath: closed });
        gsap.set(video.current, { scale: zoom });
        if (rises.length) gsap.set(rises, { yPercent: 130 });

        const play = () => video.current?.play().catch(() => {});
        const pause = () => video.current?.pause();
        const tl = gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${desktop ? length.desktop : length.mobile}%`,
              pin: stage.current,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              // only decode the video while the section is on screen
              onEnter: play,
              onEnterBack: play,
              onLeave: pause,
              onLeaveBack: pause,
            },
          })
          // fromTo with explicit strings: read back from the page, the clip
          // would come in pixels and no longer line up with the target units
          .fromTo(doorway.current, { clipPath: closed }, { clipPath: OPEN_CLIP, ease: "power2.inOut", duration: 1 }, 0)
          .to(video.current, { scale: 1, ease: "power2.out", duration: 1 }, 0);
        if (fades.length) tl.to(fades, { autoAlpha: 0, duration: 0.25 }, 0);
        if (shadeEl) tl.fromTo(shadeEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.72);
        if (rises.length) tl.to(rises, { yPercent: 0, stagger: 0.09, duration: 0.55, ease: "power2.out" }, 0.82);
        // a beat of stillness before the pin releases (appended after everything above)
        tl.to({}, { duration: 0.3 });
      });

      return () => mm.revert();
    },
    { scope: section, dependencies: [breakpoint, zoom, length.desktop, length.mobile, door.desktop.width, door.desktop.height, door.mobile.width, door.mobile.height] }
  );

  return (
    <section ref={section} style={{ position: "relative", ...style }} {...rest}>
      <div ref={stage} style={{ position: "relative", height: "100svh", width: "100%", overflow: "hidden", background }}>
        <div
          ref={doorway}
          style={{ position: "absolute", inset: 0, overflow: "hidden", background: doorColor, clipPath: closedClip(door.desktop) }}
        >
          <video
            ref={video}
            style={{ display: "block", height: "100%", width: "100%", objectFit: "cover", willChange: "transform" }}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={poster}
          >
            {sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        </div>
        {scrim !== false && (
          <div ref={shade} style={{ position: "absolute", inset: 0, pointerEvents: "none", background: scrim, visibility: "hidden" }} aria-hidden />
        )}
        {children}
      </div>
    </section>
  );
}
