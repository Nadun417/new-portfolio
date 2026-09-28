"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { projects } from "@/data/projects";
import ArtImage from "@/components/projects/ArtImage";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useTransition } from "@/components/providers/TransitionProvider";
import { useReducedMotionPref } from "@/lib/hooks";
import { cn, clamp, pad2 } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { EXPO } from "@/lib/motion";

/**
 * Selected work as an arc carousel (after Framer's "Arc Carousel Gallery").
 * The projects are cards on a gentle convex arc: the centred card stands
 * upright and large, its neighbours lean out, dip and recede. Vertical scroll
 * drives the row horizontally (the section pins, ~1:1), and the mouse can drag
 * it too. A placard below crossfades to the focused project and links to its
 * case study. Below 1024px, and for anyone who prefers reduced motion, the
 * arc gives way to a plain vertical stack.
 */

// arc shape, tuned for a refined editorial bend rather than a fairground wheel
const ANG = 9; // degrees of lean per card-slot from centre
const DIP = 0.052; // downward dip at the edges (× card height × slots²)
const SCALE_K = 0.13; // how much each slot from centre shrinks a card
const OP_K = 0.34; // how much each slot from centre dims a card
const OP_MIN = 0.32;
const CAP = 2.4; // clamp the falloff so far cards don't collapse
const DWELL = 1.3; // scroll length multiplier; higher means each card lingers longer
const DRAG = 1.15; // px of scroll per px of horizontal drag

export default function HorizontalProjects() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const total = projects.length;

  const lenis = useLenis();
  const { openProject } = useTransition();
  const reduced = useReducedMotionPref();
  const arc = !reduced; // arc layout + motion; stack otherwise

  // drag state
  const drag = useRef({ down: false, moved: false, startX: 0, startScroll: 0 });
  const suppressClick = useRef(false);

  useGSAP(
    () => {
      if (!arc) return; // reduced motion gets the static stack, with no pin

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const trk = track.current!;
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", trk);
        const last = cards.length - 1;

        const centerOf = (i: number) => cards[i].offsetLeft + cards[i].offsetWidth / 2;
        let c0 = 0,
          cN = 0,
          slot = 1;
        const measure = () => {
          c0 = centerOf(0);
          cN = centerOf(last);
          slot = Math.max(1, centerOf(1) - centerOf(0));
        };

        // place the row for a given progress (0..1) and bend every card to the arc
        const apply = (p: number) => {
          const vw = window.innerWidth;
          const tx = vw / 2 - (c0 + (cN - c0) * p);
          gsap.set(trk, { x: tx });

          cards.forEach((card) => {
            const o = (card.offsetLeft + card.offsetWidth / 2 + tx - vw / 2) / slot;
            const a = Math.min(Math.abs(o), CAP);
            const ang = clamp(o, -CAP, CAP) * ANG;
            const y = card.offsetHeight * DIP * a * a; // a parabolic dip reads as a clear arc
            gsap.set(card, {
              rotate: ang,
              y,
              scale: 1 - a * SCALE_K,
              opacity: Math.max(OP_MIN, 1 - a * OP_K),
              zIndex: Math.round(1000 - a * 100),
            });
          });

          if (bar.current) gsap.set(bar.current, { scaleX: p });
          const idx = Math.min(last, Math.max(0, Math.round(p * last)));
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
        };

        measure();
        apply(0);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${Math.max(1, (cN - c0) * DWELL)}`,
            pin: stage.current,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              measure();
              apply(self.progress);
            },
            onUpdate: (self) => apply(self.progress),
          },
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: section, dependencies: [arc], revertOnUpdate: true }
  );

  // ---- mouse drag scrolls the arc (desktop only; touch keeps native/lenis scroll) ----
  const onPointerDown = (e: PointerEvent) => {
    if (!arc || e.pointerType !== "mouse" || !lenis || window.innerWidth < 1024) return;
    drag.current = { down: true, moved: false, startX: e.clientX, startScroll: lenis.scroll };
    suppressClick.current = false;
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d.down || !lenis) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) d.moved = true;
    if (d.moved) {
      suppressClick.current = true;
      lenis.scrollTo(d.startScroll - dx * DRAG, { immediate: true });
    }
  };
  const endDrag = () => {
    drag.current.down = false;
    // let this tick's click be swallowed, then re-arm
    if (suppressClick.current) window.setTimeout(() => (suppressClick.current = false), 0);
  };

  const openAt = (i: number, e?: MouseEvent) => {
    if (suppressClick.current) {
      e?.preventDefault();
      return;
    }
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
    e?.preventDefault();
    const el = cardRefs.current[i];
    const p = projects[i];
    if (el) openProject(el, p.media, `/work/${p.slug}`);
  };

  const focused = projects[active];

  return (
    <section
      ref={section}
      id="work"
      data-section
      data-nav-id="work"
      className="relative overflow-hidden bg-paper text-ink"
      aria-label="Selected projects"
    >
      <div ref={stage} className={cn("relative w-full overflow-hidden", arc && "lg:h-[100svh]")}>
        {/* soft spotlight lifting the centred card off the paper */}
        {arc && (
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{ background: "radial-gradient(closest-side at 50% 40%, rgba(16,16,16,0.05), transparent 70%)" }}
            aria-hidden
          />
        )}

        {/* the arc track (desktop) / vertical stack (mobile · reduced motion) */}
        <div
          ref={track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className={cn(
            "flex flex-col gap-[clamp(2.5rem,7vw,4rem)] px-[var(--gutter)] py-[clamp(3.5rem,9vw,6rem)]",
            arc &&
              "lg:absolute lg:left-0 lg:top-0 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[clamp(1.25rem,2.6vw,2.75rem)] lg:px-0 lg:py-0 lg:pb-[20vh] lg:will-change-transform lg:touch-pan-y lg:select-none"
          )}
        >
          {projects.map((p, i) => (
            <a
              key={p.slug}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={`/work/${p.slug}`}
              data-card
              data-cursor="view"
              onClick={(e) => openAt(i, e)}
              onDragStart={(e) => e.preventDefault()}
              aria-label={`View case study: ${p.title}`}
              className={cn("group relative block w-full shrink-0", arc && "lg:w-[clamp(240px,23vw,360px)]")}
            >
              {/* image plate */}
              <div
                className={cn(
                  "relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-ink-2 ring-1 ring-ink/10",
                  arc && "lg:aspect-[4/5] lg:shadow-[0_36px_70px_-38px_rgba(16,16,16,0.55)]"
                )}
              >
                {/* landscape in the 4:3 stack, portrait on the 4:5 arc */}
                <ArtImage
                  src={p.media.hero}
                  swap={arc ? { media: "(min-width: 1024px)", src: p.media.card } : undefined}
                  alt={p.media.alt}
                  draggable={false}
                  sizes="(max-width: 1024px) 100vw, 24vw"
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
                {/* index tab */}
                <span className="label absolute left-3 top-3 rounded-full bg-paper/85 px-2.5 py-1 text-ink backdrop-blur-sm">
                  {p.number}
                </span>
                {/* view affordance */}
                <span className="label absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-paper opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] [transform:translateY(-6px)] group-hover:opacity-100 group-hover:[transform:translateY(0)]">
                  View <span aria-hidden>↗</span>
                </span>
              </div>

              {/* per-card meta for the stack layouts only; the arc uses the placard */}
              <div className={cn("mt-4", arc && "lg:hidden")}>
                <div className="label text-mute">
                  {p.number} · {p.category}
                </div>
                <h3 className="font-display mt-1 text-[clamp(1.9rem,7vw,2.6rem)] leading-[0.98]">{p.title}</h3>
                <p className="mt-1 text-mute">
                  {p.tagline[0]} {p.tagline[1]}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* placard (arc only), crossfading to the focused project */}
        {arc && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(4.5rem,10vh,7rem)] z-[1100] hidden flex-col items-center px-[var(--gutter)] text-center lg:flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={focused.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.42, ease: EXPO }}
                className="flex flex-col items-center"
              >
                <span className="label text-mute">{focused.category}</span>
                <h3 className="font-display mt-2 text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[0.95]">{focused.title}</h3>
                <p className="mt-2 max-w-[48ch] text-[clamp(0.95rem,1.1vw,1.1rem)] text-ink/70">
                  {focused.tagline[0]} {focused.tagline[1]}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 flex items-center gap-8">
              <button
                type="button"
                onClick={() => openAt(active)}
                className="link-line pointer-events-auto inline-flex items-center gap-2"
                data-cursor="view"
              >
                <span className="label">View case study</span>
                <span aria-hidden>↗</span>
              </button>
              {focused.links.live && (
                <a
                  href={focused.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line pointer-events-auto inline-flex items-center gap-2"
                  data-cursor="open"
                >
                  <span className="label">Live site</span>
                  <span aria-hidden>↗</span>
                </a>
              )}
              {focused.links.repo && (
                <a
                  href={focused.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line pointer-events-auto inline-flex items-center gap-2"
                  data-cursor="open"
                >
                  <span className="label">GitHub</span>
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* progress (arc only) */}
        {arc && (
          <div className="gutter pointer-events-none absolute inset-x-0 bottom-[clamp(1.5rem,3vw,2.5rem)] z-[1100] hidden items-center gap-6 lg:flex" aria-hidden>
            <span className="label tabular-nums">
              {pad2(active + 1)} / {pad2(total)}
            </span>
            <span className="relative h-px flex-1 bg-ink/15">
              <span ref={bar} className="absolute inset-0 block origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
            </span>
            <span className="label text-mute">Drag or scroll →</span>
          </div>
        )}
      </div>
    </section>
  );
}
