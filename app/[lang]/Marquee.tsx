"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Marquee from "react-fast-marquee";
import { useMarqueeStore } from "@/store/marquee-store";
import { useShallow } from "zustand/shallow";

const MarqueeBanner = () => {
  const pathname = usePathname();

  const { activeMarquee, fetchMarquees, isLoading } = useMarqueeStore(
    useShallow((state) => ({
      activeMarquee: state.activeMarquee,
      fetchMarquees: state.fetchMarquees,
      isLoading: state.isLoading,
    }))
  );

  const lang = useMemo(
    () => (pathname.startsWith("/en") ? "en" : "ar"),
    [pathname]
  );

  useEffect(() => {
    fetchMarquees();
  }, [fetchMarquees]);

  if (isLoading) {
    return <div aria-hidden="true" className="h-9 bg-ribbon" />;
  }

  const displayText =
    lang === "ar"
      ? activeMarquee?.text
      : activeMarquee?.textEn || activeMarquee?.text;

  if (!displayText || !activeMarquee) {
    return null;
  }

  const marqueeContent = (
    <>
      <span className={`mx-8 ${lang === "ar" ? "font-gess" : "font-sans"}`}>
        {displayText}
      </span>
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rotate-45 bg-gold"
      />
    </>
  );

  return (
    <div
      role="marquee"
      aria-live="polite"
      aria-label={displayText}
      className="overflow-hidden bg-ribbon py-2"
    >
      <Marquee
        speed={36}
        gradient={false}
        pauseOnHover
        pauseOnClick
        direction={lang === "ar" ? "right" : "left"}
        loop={0}
        autoFill={true}
        className={`text-sm tracking-wide text-primary-foreground/90 ${
          lang === "ar" ? "font-gess" : "font-sans"
        }`}
      >
        {marqueeContent}
      </Marquee>
    </div>
  );
};

export default React.memo(MarqueeBanner);
