"use client";

/**
 * Central GSAP registration. Import gsap from here everywhere so plugins are
 * registered exactly once on the client and eases are shared.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
  CustomEase.create("expo", "0.16, 1, 0.3, 1");
  CustomEase.create("quartInOut", "0.76, 0, 0.24, 1");
  CustomEase.create("quartOut", "0.25, 1, 0.5, 1");
  gsap.defaults({ ease: "expo", duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const EASE = {
  expo: "expo",
  inOut: "quartInOut",
  out: "quartOut",
} as const;

export { gsap, ScrollTrigger, useGSAP };
