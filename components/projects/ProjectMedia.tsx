"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";
import { useTransition } from "@/components/providers/TransitionProvider";
import { EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The project plate. Hover zooms the image, the cursor says VIEW, and a click
 * flies the media to fullscreen before the case study takes over.
 */
export default function ProjectMedia({
  project,
  className,
  sizes = "(max-width: 1024px) 100vw, 55vw",
}: {
  project: Project;
  className?: string;
  sizes?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { openProject } = useTransition();
  const href = `/work/${project.slug}`;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (ref.current) openProject(ref.current, project.media, href);
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      data-cursor="view"
      data-media
      className={cn("group relative block overflow-hidden bg-ink-2", className)}
      aria-label={`View case study: ${project.title}`}
    >
      <motion.div className="relative h-full w-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.9, ease: EXPO }}>
        <Image src={project.media.hero} alt={project.media.alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
      <span className="label pointer-events-none absolute bottom-3 left-3 text-paper/85 mix-blend-difference">
        {project.number} · {project.title}
      </span>
      <span className="label pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-paper px-3 py-1.5 text-ink opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:opacity-100 [transform:translateY(-6px)] group-hover:[transform:translateY(0)]">
        View <span aria-hidden>↗</span>
      </span>
    </a>
  );
}
