"use client";

import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";
import { LineReveal, WordReveal } from "@/components/motion/TextReveal";
import { MagneticLink } from "@/components/motion/Magnetic";
import CircularTextPro from "@/components/framer/CircularTextPro";
import Footer from "@/components/layout/Footer";

const LINKS = [
  { label: "Email", href: `mailto:${site.email}`, external: false },
  { label: "LinkedIn", href: site.socials.linkedin, external: true },
  { label: "GitHub", href: site.socials.github, external: true },
];

/**
 * The closing scene. Ink ground, the invitation set huge, three magnetic
 * links, and the footer.
 */
export default function Contact() {
  const [a, b, c, d] = site.contact.lines;
  return (
    <section id="contact" data-section data-nav-id="contact" className="relative bg-ink text-paper" aria-labelledby="contact-title">
      <div className="gutter grid min-h-[100svh] grid-cols-12 gap-x-6 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(6rem,14vw,12rem)]">
        <div className="col-span-12 flex items-start justify-between md:col-span-12">
          <WordReveal text="07 · Contact" as="span" className="label block text-paper/60" />
          <div className="relative hidden place-items-center text-paper/80 md:grid">
            <CircularTextPro text="Let's talk • Open to roles • 2026 • " radius={60} rotateSpeed={20} />
            <ArrowUpRight size={18} strokeWidth={1.5} className="absolute text-accent" aria-hidden />
          </div>
        </div>

        <h2 id="contact-title" className="col-span-12 mt-[clamp(2rem,4vw,3rem)]">
          <LineReveal
            lines={[a, b, c, <span key="d" className="font-display-i normal-case text-accent">{d}</span>]}
            className="display-xl descenders"
            lineClassName="[&:nth-child(2)]:pl-[8vw] [&:nth-child(3)]:pl-[16vw] [&:nth-child(4)]:pl-[4vw]"
            amount={0.3}
          />
        </h2>

        <div className="col-span-12 mt-[clamp(3rem,6vw,5rem)] grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-5">
            <WordReveal text={site.contact.sub} as="p" className="max-w-[36ch] text-paper/70" />
            <MagneticLink href={`mailto:${site.email}`} className="display-sm mt-6 link-line" data-cursor="open" strength={0.2}>
              {site.email}
            </MagneticLink>
          </div>

          <ul className="col-span-12 flex flex-wrap gap-x-10 gap-y-4 md:col-span-6 md:col-start-7 md:justify-end">
            {LINKS.map((l) => (
              <li key={l.label}>
                <MagneticLink href={l.href} external={l.external} className="label-sans gap-2 py-3" data-cursor={l.external ? "open" : "text"} strength={0.35}>
                  <span className="flip">
                    <span>{l.label}</span>
                    <span aria-hidden>{l.label}</span>
                  </span>
                  <ArrowUpRight size={14} strokeWidth={1.5} className="ml-1" aria-hidden />
                </MagneticLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer dark />
    </section>
  );
}
