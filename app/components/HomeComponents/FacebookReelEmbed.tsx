"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./home.css";

interface ReelType {
  id: string;
  url: string;
}

interface AboutSectionProps {
  lang: "ar" | "en";
}

export default function ReelsCarousel({ lang }: AboutSectionProps) {
  const [reels, setReels] = useState<ReelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch("/api/reels")
      .then((res) => res.json())
      .then((data) => {
        setReels(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const nextReel = () => {
    setCurrentIndex((prev) => (prev + 1) % reels.length);
  };

  const prevReel = () => {
    setCurrentIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextReel() : prevReel();
    }
  };
  // Nothing to show while loading or when empty: the section simply isn't there.
  if (loading) return null;

  // No reels yet: show nothing rather than an empty-state message.
  if (!reels.length) return null;

  return (
    <div
      className="container mx-auto px-4 pb-20 pt-4 md:pb-28"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* العنوان */}
      <div className="mb-10 flex items-center gap-6 md:mb-14">
        <h2
          lang={lang}
          className={`fl-display shrink-0 text-3xl text-primary ${
            lang === "ar" ? "md:text-5xl" : "md:text-4xl"
          }`}
        >
          {lang === "ar" ? "أحدث الريلز" : "Latest Reels"}
        </h2>
        <span className="fl-rule" aria-hidden="true" />
      </div>

      {/* الكاروسيل */}
      <div className="relative">
        {/* زر السابق */}
        <button
          onClick={prevReel}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-accent hover:text-primary"
          aria-label={lang === "ar" ? "السابق" : "Previous"}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* محتوى الكاروسيل */}
        <div
          className="overflow-hidden rounded-sm"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reels.map((reel, idx) => (
              <div key={reel.id} className="w-full flex-shrink-0">
                {Math.abs(idx - currentIndex) <= 1 ? (
                  <iframe
                    src={reel.url}
                    className="w-full aspect-[9/16] sm:aspect-[4/3] md:aspect-video rounded-sm"
                    loading="lazy"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`Reel ${idx + 1}`}
                  />
                ) : (
                  <div className="w-full aspect-[9/16] sm:aspect-[4/3] md:aspect-video bg-secondary" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* زر التالي */}
        <button
          onClick={nextReel}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-accent hover:text-primary"
          aria-label={lang === "ar" ? "التالي" : "Next"}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* النقاط */}
        <div className="flex justify-center mt-6 gap-2">
          {reels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-0.5 w-8 transition-colors ${
                idx === currentIndex
                  ? "bg-primary"
                  : "bg-primary/20 hover:bg-primary/40"
              }`}
              aria-label={`${lang === "ar" ? "الريل" : "Reel"} ${idx + 1}`}
            />
          ))}
        </div>

        {/* العداد */}
        <div className="mt-4 text-center text-sm tabular-nums text-muted-foreground">
          {currentIndex + 1} / {reels.length}
        </div>
      </div>
    </div>
  );
}
