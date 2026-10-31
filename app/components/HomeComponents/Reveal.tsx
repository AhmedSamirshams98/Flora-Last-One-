"use client";

import { useEffect, useRef } from "react";

type Variant = "up" | "fade" | "scale";

/**
 * Scroll reveal. Content is visible by default (server render, no JS, reduced
 * motion). Only elements that start below the fold are hidden after mount and
 * released the first time they scroll into view.
 */
export default function Reveal({
  children,
  delay = 0,
  variant = "up",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: Variant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) return; // already on screen

    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "done";
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-variant={variant}
      className={className}
      style={{ "--rd": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
