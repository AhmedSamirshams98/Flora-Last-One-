"use client";

/* The one pop-up the dashboard uses (forms, order details).
   It is drawn straight into <body>, so no section of the page (the nav, the footer, a card with a
   transform or an overflow) can sit above it or cut it, and it is above the sticky nav (z-50) but
   under the toasts. It locks the page behind it, closes with Esc or a click on the dark ground,
   and gives focus to the panel. The panel itself scrolls, never the page. */

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function AdminModal({
  children,
  onClose,
  label,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  /** wider panel (product form, order details) */
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", key);
      opener?.focus?.();
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fl-modal"
      dir="rtl"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`fl-modal-panel fl-admin ${wide ? "fl-modal-wide" : ""}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
