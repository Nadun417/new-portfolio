"use client";

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/hooks";

type CoreProps = {
  children: ReactNode;
  strength?: number;
  innerStrength?: number;
  className?: string;
  innerClassName?: string;
};

/**
 * Shared magnetic core. The wrapper drifts toward the pointer; the inner
 * label drifts a little less, giving depth. Springs, never elastic overshoot.
 */
function useMagnetic(strength: number, innerStrength: number) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ix = useMotionValue(0);
  const iy = useMotionValue(0);
  const sx = useSpring(x, SPRING.magnetic);
  const sy = useSpring(y, SPRING.magnetic);
  const six = useSpring(ix, SPRING.magnetic);
  const siy = useSpring(iy, SPRING.magnetic);

  const onMove = (e: React.PointerEvent) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    ix.set(dx * innerStrength);
    iy.set(dy * innerStrength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
  };

  return { ref, sx, sy, six, siy, onMove, onLeave };
}

export function MagneticButton({
  children,
  strength = 0.28,
  innerStrength = 0.12,
  className,
  innerClassName,
  ...rest
}: CoreProps & ComponentPropsWithoutRef<"button">) {
  const { ref, sx, sy, six, siy, onMove, onLeave } = useMagnetic(strength, innerStrength);
  return (
    <motion.div ref={ref} className="inline-block" style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <button className={cn("relative inline-flex items-center", className)} {...rest}>
        <motion.span className={cn("inline-flex items-center", innerClassName)} style={{ x: six, y: siy }}>
          {children}
        </motion.span>
      </button>
    </motion.div>
  );
}

export function MagneticLink({
  children,
  strength = 0.28,
  innerStrength = 0.12,
  className,
  innerClassName,
  external,
  ...rest
}: CoreProps & ComponentPropsWithoutRef<"a"> & { external?: boolean }) {
  const { ref, sx, sy, six, siy, onMove, onLeave } = useMagnetic(strength, innerStrength);
  return (
    <motion.div ref={ref} className="inline-block" style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <a
        className={cn("relative inline-flex items-center", className)}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...rest}
      >
        <motion.span className={cn("inline-flex items-center", innerClassName)} style={{ x: six, y: siy }}>
          {children}
        </motion.span>
      </a>
    </motion.div>
  );
}

/** Wrap any element (e.g. an icon) to make it magnetic. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const { ref, sx, sy, onMove, onLeave } = useMagnetic(strength, 0);
  return (
    <motion.div ref={ref} className={cn("inline-block", className)} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.div>
  );
}
