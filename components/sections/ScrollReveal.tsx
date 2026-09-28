"use client";

import type { ComponentType } from "react";
import VendoredRaw from "@/components/framer/vendor/ScrollZoomReveal.js";

// The vendored default export takes Framer prop shapes; type it permissively.
const ScrollZoomReveal = VendoredRaw as unknown as ComponentType<Record<string, unknown>>;

const MONO = { fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const };

/**
 * "Scroll zoom reveal", the Framer community component (by its author),
 * vendored to run outside Framer. A framed media card zooms from a small
 * rounded plate to full-bleed as the section is scrolled, revealing the reel.
 * It manages its own 400vh scroll track and sticky stage internally, so it
 * only needs an ink ground and a section id for the nav / progress rail.
 */
export default function ScrollReveal() {
  return (
    <section id="story" data-section className="relative bg-ink text-paper">
      <ScrollZoomReveal
        image={{ src: "/media/reel-poster.jpg", alt: "Working above the clouds" }}
        videoUrl="/media/reel.mp4"
        autoPlay
        loop
        muted
        leftText="© 2026"
        rightText="The practice"
        buttonText="Play reel"
        buttonLink=""
        textColor="#F1EFE9"
        buttonTextColor="#101010"
        buttonBgColor="#F1EFE9"
        iconType="play"
        leftFont={MONO}
        rightFont={MONO}
        buttonFont={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}
      />
    </section>
  );
}
