"use client";

import { useSyncExternalStore } from "react";

export const READY_EVENT = "app:ready";

/** Called once by the preloader when the curtain has lifted. */
export function markReady() {
  document.documentElement.dataset.ready = "true";
  window.dispatchEvent(new Event(READY_EVENT));
}

export function isReady() {
  return typeof document !== "undefined" && document.documentElement.dataset.ready === "true";
}

const subscribe = (cb: () => void) => {
  window.addEventListener(READY_EVENT, cb);
  return () => window.removeEventListener(READY_EVENT, cb);
};

/** true once the preloader has finished (or was skipped). */
export function useAppReady() {
  return useSyncExternalStore(subscribe, isReady, () => false);
}
