"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** px per second */
  speed?: number;
  /** 1 = leftwards, -1 = rightwards */
  direction?: 1 | -1;
  /** react to scroll velocity */
  scrollBoost?: boolean;
  /** slow down while hovered (for interactive rows) */
  slowOnHover?: boolean;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
};

/**
 * Infinite marquee. The track is duplicated once; GSAP moves it by exactly
 * half its width on a loop so the seam is invisible. Scroll velocity nudges
 * the time scale (GSAP's job: scroll-linked motion).
 */
export default function Marquee({
  children,
  speed = 60,
  direction = 1,
  scrollBoost = true,
  slowOnHover = false,
  className,
  trackClassName,
  ariaLabel,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !track.current) return;
      const el = track.current;

      // An endless tween keeps restyling and repainting the row on every frame
      // even when it is nowhere near the viewport, and that cost lands on
      // whatever the visitor is actually looking at (it made the showreel
      // stutter). So the loop only runs while the row is on screen.
      let visible = false;
      const onScreen = { trigger: wrap.current, start: "top bottom", end: "bottom top" };
      const vis = ScrollTrigger.create({
        ...onScreen,
        onToggle: (self) => {
          visible = self.isActive;
          if (visible) tween.current?.play();
          else tween.current?.pause();
        },
      });
      visible = vis.isActive;

      const build = () => {
        tween.current?.kill();
        const half = el.scrollWidth / 2;
        if (!half) return;
        gsap.set(el, { x: direction === 1 ? 0 : -half });
        tween.current = gsap.to(el, {
          x: direction === 1 ? -half : 0,
          duration: half / speed,
          ease: "none",
          repeat: -1,
          paused: !visible,
        });
      };
      build();

      let st: ScrollTrigger | undefined;
      if (scrollBoost) {
        // scoped to the row, so scrolling elsewhere on the page doesn't keep
        // spinning up speed tweens for a marquee nobody can see
        st = ScrollTrigger.create({
          ...onScreen,
          onUpdate: (self) => {
            const v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
            const dir = self.direction;
            const t = tween.current;
            if (!t) return;
            gsap.to(t, { timeScale: (1 + v) * (dir === 1 ? 1 : -1) * (direction === 1 ? 1 : 1), duration: 0.25, overwrite: true });
            gsap.to(t, { timeScale: 1, duration: 0.8, delay: 0.25, ease: "power2.out" });
          },
        });
      }

      const ro = new ResizeObserver(build);
      ro.observe(el);
      return () => {
        ro.disconnect();
        vis.kill();
        st?.kill();
        tween.current?.kill();
      };
    },
    { scope: wrap, dependencies: [speed, direction, scrollBoost] }
  );

  const onEnter = () => slowOnHover && tween.current && gsap.to(tween.current, { timeScale: 0.12, duration: 0.6, overwrite: true });
  const onLeave = () => slowOnHover && tween.current && gsap.to(tween.current, { timeScale: 1, duration: 0.8, overwrite: true });

  return (
    <div
      ref={wrap}
      className={cn("relative w-full overflow-hidden", className)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-label={ariaLabel}
    >
      <div ref={track} className={cn("flex w-max will-change-transform", trackClassName)}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
