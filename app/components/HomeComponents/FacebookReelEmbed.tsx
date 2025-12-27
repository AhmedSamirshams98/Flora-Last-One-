"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  function ReelsCarouselSkeleton({ lang }: { lang: "ar" | "en" }) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        {/* العنوان */}
        <div className="h-8 w-48 mx-auto mb-8 bg-gray-200 rounded" />

        {/* الكاروسيل */}
        <div className="relative">
          {/* زر السابق */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200 rounded-full" />

          {/* الفيديو */}
          <div className="w-full aspect-[9/16] sm:aspect-[4/3] md:aspect-video bg-gray-200 rounded-xl" />

          {/* زر التالي */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200 rounded-full" />
        </div>

        {/* النقاط */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
          ))}
        </div>

        {/* العداد */}
        <div className="h-4 w-16 mx-auto mt-4 bg-gray-200 rounded" />
      </div>
    );
  }

  if (loading) {
    return <ReelsCarouselSkeleton lang={lang} />;
  }

  if (!reels.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        {lang === "ar" ? "لا توجد Reels متاحة" : "No Reels available"}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* العنوان */}
      <h2
        className={`text-3xl text-center mb-8 ${
          lang === "ar" ? "font-medium" : ""
        }`}
      >
        {lang === "ar" ? "أحدث الريلز" : "Latest Reels"}
      </h2>

      {/* الكاروسيل */}
      <div className="relative">
        {/* زر السابق */}
        <button
          onClick={prevReel}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label={lang === "ar" ? "السابق" : "Previous"}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* محتوى الكاروسيل */}
        <div
          className="overflow-hidden rounded-xl"
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
                    className="w-full aspect-[9/16] sm:aspect-[4/3] md:aspect-video rounded-xl"
                    loading="lazy"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`Reel ${idx + 1}`}
                  />
                ) : (
                  <div className="w-full aspect-[9/16] sm:aspect-[4/3] md:aspect-video bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* زر التالي */}
        <button
          onClick={nextReel}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
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
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`${lang === "ar" ? "الريل" : "Reel"} ${idx + 1}`}
            />
          ))}
        </div>

        {/* العداد */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {currentIndex + 1} / {reels.length}
        </div>
      </div>
    </div>
  );
}
