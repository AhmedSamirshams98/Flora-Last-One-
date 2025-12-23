"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Marquee from "react-fast-marquee";
import logo from "@/public/images/logo.png";
import Image from "next/image";
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
    return (
      <div className="bg-yellow-100 border-b border-yellow-300 py-2">
        <div className="animate-pulse text-center text-yellow-800">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    );
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
      <span className={`mx-6 ${lang === "ar" ? "font-gess" : "font-sans"}`}>
        {displayText}
      </span>
      <div className="inline-flex items-center mx-4">
        <Image
          src={logo}
          alt={
            lang === "ar"
              ? "فلورا ستور فلورا كفر الشيخ للشنط والأحذية "
              : "Flora Store flora store kafrelshiekh for woman shoes and bags"
          }
          className="w-12"
          priority
          quality={75}
        />
      </div>
    </>
  );

  return (
    <div
      role="marquee"
      aria-live="polite"
      aria-label={displayText}
      className="bg-yellow-50 border-b border-yellow-300 py-1 overflow-hidden"
    >
      <Marquee
        speed={90}
        gradient={false}
        pauseOnHover
        pauseOnClick
        direction={lang === "ar" ? "right" : "left"}
        loop={0}
        autoFill={true}
        className={`font-medium text-yellow-800 ${
          lang === "ar" ? "font-gess" : "font-sans"
        }`}
      >
        {marqueeContent}
      </Marquee>
    </div>
  );
};

export default React.memo(MarqueeBanner);
