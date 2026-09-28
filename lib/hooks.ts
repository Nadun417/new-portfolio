"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    const raf = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", update);
    };
  }, [query]);
  return matches;
}

/** true when the device has a precise hover-capable pointer */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useReducedMotionPref() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}

const noopSubscribe = () => () => {};
/** false during SSR / hydration, true once mounted on the client. */
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
