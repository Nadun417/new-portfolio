"use client";

import { site } from "@/data/site";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import { MagneticButton } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";

export default function Footer({ dark = true, className }: { dark?: boolean; className?: string }) {
  const lenis = useLenis();
  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer
      className={cn(
        "gutter flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t py-6",
        dark ? "border-paper/15 bg-ink text-paper" : "border-ink/15 bg-paper text-ink",
        className
      )}
    >
      <span className="label">
        {site.name} © {site.year}
      </span>
      <span className={cn("label", dark ? "text-paper/55" : "text-mute")}>Designed + developed by Nadun</span>
      <MagneticButton onClick={toTop} className="label py-2" aria-label="Back to top">
        <span className="flip">
          <span>Back to top ↑</span>
          <span aria-hidden>Back to top ↑</span>
        </span>
      </MagneticButton>
    </footer>
  );
}
