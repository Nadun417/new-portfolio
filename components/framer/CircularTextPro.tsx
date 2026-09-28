"use client";

import Vendored from "./vendor/CircularText.js";

/**
 * Framer community rotating circular text (Circular-Text-Pro). Wrapped so the
 * rest of the app can pass simple props. Sizes itself to `radius`.
 */
export default function CircularTextPro({
  text = "Available for work • 2026 • Galle, Sri Lanka • ",
  radius = 62,
  rotateSpeed = 22,
  color = "currentColor",
  direction = "clockwise",
  className,
}: {
  text?: string;
  radius?: number;
  /** seconds per rotation (lower is faster) */
  rotateSpeed?: number;
  color?: string;
  direction?: "clockwise" | "counterclockwise";
  className?: string;
}) {
  return (
    <div className={className} style={{ color }}>
      <Vendored
        text={text}
        color={color}
        direction={direction}
        motion={{ radius, startAngle: -90, rotateSpeed }}
        hoverEffect={{ type: "speed" }}
        style={{ width: radius * 2, height: radius * 2 }}
      />
    </div>
  );
}
