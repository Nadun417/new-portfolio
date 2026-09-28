"use client";

import { type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { useTransition } from "@/components/providers/TransitionProvider";

type Props = ComponentPropsWithoutRef<"a"> & {
  href: string;
  /** Word shown on the curtain while the page changes */
  label?: string;
};

/**
 * Internal link that routes through the transition system: hash links on the
 * current page smooth-scroll, everything else gets the curtain.
 */
export default function TransitionLink({ href, label, onClick, children, ...rest }: Props) {
  const { navigate } = useTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, label);
  };
  return (
    <a href={href} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
