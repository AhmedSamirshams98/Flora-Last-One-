"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

interface AboutSectionProps {
  lang: "ar" | "en";
}

interface ReelType {
  id: string;
  url: string;
}

export default function ReelsCarousel({ lang }: AboutSectionProps) {
  const [reels, setReels] = useState<ReelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* =========================
     Fetch Reels
  ========================= */
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch("/api/reels");
        const data = await res.json();
        setReels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  /* =========================
     AOS
  ========================= */
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [reels]);

  /* =========================
     Navigation
  ========================= */
  const nextReel = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === reels.length - 1 ? 0 : prev + 1
    );
  }, [reels.length]);

  const prevReel = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? reels.length - 1 : prev - 1
    );
  }, [reels.length]);

  const goToReel = (index: number) => setCurrentIndex(index);

  /* =========================
     Touch Handling
  ========================= */
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStart(e.targetTouches[0].clientX);

  const handleTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      distance > 0 ? nextReel() : prevReel();
    }
  };

  /* =========================
     States
  ========================= */
  if (loading) return <LoadingSkeleton />;

  if (!reels.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {lang === "ar"
            ? "لا توجد Reels متاحة حالياً"
            : "No Reels available"}
        </p>
      </div>
    );
  }

  /* =========================
     Render
  ========================= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2
          className={`text-3xl font-bold mb-2 ${
            lang === "ar" ? "font-gess" : "font-sans"
          }`}
        >
          {lang === "ar" ? "أحدث الريلز" : "Latest Reels"}
        </h2>
      </div>

      <div className="relative" data-aos="fade-right">
        {/* Previous */}
        <button
          onClick={prevReel}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110"
          aria-label={lang === "ar" ? "السابق" : "Previous"}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            }}
          >
            {reels.map((reel, index) => (
              <Reel
                key={reel.id}
                reel={reel}
                index={index}
                currentIndex={currentIndex}
                totalReels={reels.length}
              />
            ))}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={nextReel}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110"
          aria-label={lang === "ar" ? "التالي" : "Next"}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {reels.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReel(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`${
                lang === "ar" ? "انتقل إلى الريل" : "Go to reel"
              } ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Reel Component
========================= */
const Reel = React.memo(
  ({
    reel,
    index,
    currentIndex,
    totalReels,
  }: {
    reel: ReelType;
    index: number;
    currentIndex: number;
    totalReels: number;
  }) => {
    const shouldRender =
      index === currentIndex ||
      index === currentIndex - 1 ||
      index === currentIndex + 1;

    return (
      <div className="w-full flex-shrink-0 px-2 relative">
        {shouldRender ? (
          <div className="relative aspect-[9/16] w-full">
            <iframe
              src={`https://www.instagram.com/reel/${extractInstagramId(
                reel.url
              )}/embed`}
              className="rounded-xl shadow-2xl w-full h-full"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder={0}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              title={`Instagram Reel ${index + 1}`}
            />
          </div>
        ) : (
          <div className="w-full aspect-[9/16] bg-gray-200 animate-pulse rounded-xl" />
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm pointer-events-none">
          {index + 1} / {totalReels}
        </div>
      </div>
    );
  }
);

/* =========================
   Helpers
========================= */
function extractInstagramId(url: string) {
  const match = url.match(/\/reel\/([^\/?]+)/);
  return match ? match[1] : "";
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-center">
        <div className="w-[350px] h-[620px] animate-pulse rounded-xl bg-gray-200" />
      </div>
      <div className="flex justify-center mt-6 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-gray-300" />
        ))}
      </div>
    </div>
  );
}
