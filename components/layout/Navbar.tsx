"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/data/site";
import { EXPO, QUART_IN_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { useTransition } from "@/components/providers/TransitionProvider";
import TransitionLink from "./TransitionLink";

function useClock(timeZone: string) {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone });
    const tick = () => setT(fmt.format(new Date()));
    const raf = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 15000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [timeZone]);
  return t;
}

/** Tracks which [data-nav-id] section is in view. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-id]"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.getAttribute("data-nav-id"));
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

export default function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { navigate } = useTransition();
  const [open, setOpen] = useState(false);
  const clock = useClock(site.timeZone);
  const isHome = pathname === "/";
  const active = useActiveSection(isHome);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const go = (href: string, label: string) => {
    setOpen(false);
    window.setTimeout(() => navigate(href, label), open ? 350 : 0);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[700] mix-blend-difference text-paper"
        style={{ height: "var(--nav-h)" }}
      >
        <nav className="gutter flex h-full items-center justify-between" aria-label="Primary">
          <TransitionLink href="/" label="Home" className="label-sans flex items-center gap-2 tracking-[0.2em]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {site.brand}
          </TransitionLink>

          <ul className="hidden items-center gap-8 md:flex">
            {site.nav.map((n) => {
              const isActive = active === n.id;
              return (
                <li key={n.id} className="relative">
                  <a
                    href={n.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(n.href, n.label);
                    }}
                    className="label-sans flip py-1"
                    data-cursor="text"
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span>{n.label}</span>
                    <span aria-hidden>{n.label}</span>
                  </a>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-px w-full bg-paper"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    style={{ transformOrigin: "left" }}
                    transition={{ duration: 0.5, ease: EXPO }}
                    aria-hidden
                  />
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-6">
            <span className="label hidden text-paper/70 sm:inline" suppressHydrationWarning>
              Galle · {clock}
            </span>
            <button
              type="button"
              className="label-sans flex items-center gap-3 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-6" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-paper transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    open && "translate-y-[5.5px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px w-full bg-paper transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    open && "-translate-y-[5.5px] -rotate-45"
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ---- fullscreen menu (mobile) ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            key="menu"
            className="fixed inset-0 z-[650] md:hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* trailing paper panel */}
            <motion.div
              className="absolute inset-0 bg-paper-2"
              variants={{
                hidden: { clipPath: "inset(0 0 100% 0)" },
                visible: { clipPath: "inset(0 0 0% 0)", transition: { duration: 0.7, ease: QUART_IN_OUT } },
                exit: { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.55, ease: QUART_IN_OUT, delay: 0.1 } },
              }}
            />
            {/* ink panel */}
            <motion.div
              className="absolute inset-0 bg-ink text-paper"
              variants={{
                hidden: { clipPath: "inset(0 0 100% 0)" },
                visible: { clipPath: "inset(0 0 0% 0)", transition: { duration: 0.7, ease: QUART_IN_OUT, delay: 0.08 } },
                exit: { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.55, ease: QUART_IN_OUT } },
              }}
            >
              <div className="gutter flex h-full flex-col justify-between pb-8 pt-[calc(var(--nav-h)+1.5rem)]">
                <ul className="flex flex-col gap-1">
                  {site.nav.map((n, i) => (
                    <li key={n.id} className="mask">
                      <motion.a
                        href={n.href}
                        onClick={(e) => {
                          e.preventDefault();
                          go(n.href, n.label);
                        }}
                        className="display-lg flex items-baseline gap-4 py-1"
                        variants={{
                          hidden: { y: "110%" },
                          visible: { y: "0%", transition: { duration: 0.8, ease: EXPO, delay: 0.25 + i * 0.07 } },
                          exit: { y: "-110%", transition: { duration: 0.4, ease: EXPO, delay: i * 0.03 } },
                        }}
                      >
                        <span className="label text-paper/50" style={{ letterSpacing: "0.1em" }}>
                          0{i + 1}
                        </span>
                        {n.label}
                      </motion.a>
                    </li>
                  ))}
                </ul>
                <motion.div
                  className="flex flex-wrap items-end justify-between gap-6 border-t border-paper/15 pt-6"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EXPO, delay: 0.55 } },
                    exit: { opacity: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <a className="label link-line" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                    <div className="flex gap-5">
                      <a className="label link-line" href={site.socials.github} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                      <a className="label link-line" href={site.socials.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    </div>
                  </div>
                  <span className="label text-paper/50">
                    {site.location} · {clock}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
