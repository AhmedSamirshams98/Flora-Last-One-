"use client";

import React, { useEffect, useState } from "react";
import { MobileNavProps } from "@/types/nav";
import MobileNavOverlay from "./MobileNavOverlay";
import MobileNavContainer from "./MobileNavContainer";

const MobileNav = ({
  isOpen,
  onClose,
  onUserClick,
  lang,
  toggleLang,
}: MobileNavProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape closes the menu, and the page behind it stops scrolling while it is open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 font-gess"
      dir={lang === "ar" ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <MobileNavOverlay isAnimating={isAnimating} onClose={onClose} />

      <MobileNavContainer
        isAnimating={isAnimating}
        lang={lang}
        onClose={onClose}
        onUserClick={onUserClick}
        toggleLang={toggleLang}
      />
    </div>
  );
};

export default React.memo(MobileNav);
