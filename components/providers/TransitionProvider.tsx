"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Project } from "@/data/projects";
import { EXPO, QUART_IN_OUT } from "@/lib/motion";
import { useLenis } from "./SmoothScrollProvider";

type Rect = { top: number; left: number; width: number; height: number };
/** `from` is what the clicked preview shows; `to` is what the case-study hero will show. */
type MediaTransition = { rect: Rect; from: string | null; to: string; alt: string; href: string };
type PanelTransition = { label: string; href: string };

type Ctx = {
  /** Project preview, then fullscreen media, then the case study hero. */
  openProject: (el: HTMLElement, media: Project["media"], href: string) => void;
  /** Curtain transition for ordinary page navigation. */
  navigate: (href: string, label?: string) => void;
  busy: boolean;
};

const TransitionContext = createContext<Ctx>({ openProject: () => {}, navigate: () => {}, busy: false });
export const useTransition = () => useContext(TransitionContext);

const PANEL_IN = 0.7;
const MEDIA_IN = 0.85;

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const [media, setMedia] = useState<MediaTransition | null>(null);
  const [mediaFull, setMediaFull] = useState(false);
  const [panel, setPanel] = useState<PanelTransition | null>(null);
  const [panelLeaving, setPanelLeaving] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const busy = Boolean(media || panel);

  // When the route actually changes, release whichever overlay is covering.
  useEffect(() => {
    if (!pendingHref.current) return;
    const arrived = pathname === pendingHref.current.split("#")[0];
    if (!arrived) return;
    pendingHref.current = null;
    const t = window.setTimeout(() => {
      setMedia(null);
      setMediaFull(false);
      setPanelLeaving(true);
      window.setTimeout(() => {
        setPanel(null);
        setPanelLeaving(false);
        lenis?.start();
      }, PANEL_IN * 1000);
    }, 120);
    return () => window.clearTimeout(t);
  }, [pathname, lenis]);

  const openProject = useCallback<Ctx["openProject"]>(
    (el, m, href) => {
      if (busy) return;
      const r = el.getBoundingClientRect();
      lenis?.stop();
      router.prefetch(href);
      // the hero shows the portrait image on portrait screens (see CaseStudyHero)
      const to = window.matchMedia("(orientation: portrait)").matches ? m.card : m.hero;
      new window.Image().src = to;
      // crossfade only when the preview shows the other image
      const shown = el.querySelector("img")?.currentSrc ?? "";
      const from = shown && !shown.includes(encodeURIComponent(to)) && !shown.endsWith(to) ? shown : null;
      setMedia({ rect: { top: r.top, left: r.left, width: r.width, height: r.height }, from, to, alt: m.alt, href });
      requestAnimationFrame(() => requestAnimationFrame(() => setMediaFull(true)));
      pendingHref.current = href;
      window.setTimeout(() => router.push(href), MEDIA_IN * 1000 + 60);
    },
    [busy, lenis, router]
  );

  const navigate = useCallback<Ctx["navigate"]>(
    (href, label) => {
      if (busy) return;
      const [path, hash] = href.split("#");
      // A link to the page we're already on never changes the route, so the
      // curtain would wait forever for a navigation that doesn't happen.
      // Scroll instead: to the section for a hash link, to the top otherwise.
      if (path === "" || path === pathname) {
        const target = hash ? document.getElementById(hash) : null;
        if (hash && !target) return;
        if (lenis) lenis.scrollTo(target ?? 0, { offset: 0 });
        else if (target) target.scrollIntoView({ behavior: "smooth" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      lenis?.stop();
      router.prefetch(path || "/");
      setPanel({ label: label ?? "", href });
      pendingHref.current = path || "/";
      window.setTimeout(() => router.push(path || "/"), PANEL_IN * 1000 + 40);
    },
    [busy, lenis, pathname, router]
  );

  const value = useMemo(() => ({ openProject, navigate, busy }), [openProject, navigate, busy]);

  return (
    <TransitionContext.Provider value={value}>
      {children}

      {/* ---- shared media flight ---- */}
      <AnimatePresence>
        {media && (
          <motion.div
            key="media-flight"
            className="fixed z-[900] overflow-hidden bg-ink"
            initial={{
              top: media.rect.top,
              left: media.rect.left,
              width: media.rect.width,
              height: media.rect.height,
            }}
            animate={
              mediaFull
                ? {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    transition: { duration: MEDIA_IN, ease: QUART_IN_OUT },
                  }
                : {
                    top: media.rect.top,
                    left: media.rect.left,
                    width: media.rect.width,
                    height: media.rect.height,
                    transition: { duration: 0 },
                  }
            }
            exit={{ opacity: 0, transition: { duration: 0.5, ease: EXPO } }}
            style={{ willChange: "top, left, width, height" }}
          >
            <motion.img
              src={media.to}
              alt={media.alt}
              className="h-full w-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1, transition: { duration: MEDIA_IN + 0.3, ease: EXPO } }}
            />
            {media.from && (
              <motion.img
                src={media.from}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ scale: 1.08, opacity: 1 }}
                animate={{
                  scale: 1,
                  opacity: 0,
                  transition: { scale: { duration: MEDIA_IN + 0.3, ease: EXPO }, opacity: { duration: MEDIA_IN, ease: QUART_IN_OUT } },
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- curtain ---- */}
      <AnimatePresence>
        {panel && (
          <motion.div
            key="curtain"
            className="fixed inset-0 z-[950] flex items-end bg-ink text-paper"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{
              clipPath: panelLeaving ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
              transition: { duration: PANEL_IN, ease: QUART_IN_OUT },
            }}
            exit={{ opacity: 0, transition: { duration: 0.01 } }}
          >
            <div className="gutter w-full pb-[clamp(1.5rem,4vw,3.5rem)]">
              <div className="flex items-end justify-between">
                <span className="mask">
                  <motion.span
                    className="display-lg block"
                    initial={{ y: "110%" }}
                    animate={{
                      y: panelLeaving ? "-110%" : "0%",
                      transition: { duration: 0.7, ease: EXPO, delay: panelLeaving ? 0 : 0.2 },
                    }}
                  >
                    {panel.label}
                  </motion.span>
                </span>
                <span className="label text-paper/60">Nadun™ · 2026</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
