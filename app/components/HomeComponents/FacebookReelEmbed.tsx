"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AboutSectionProps {
  lang: "ar" | "en";
}

export default function ReelsCarousel({ lang }: AboutSectionProps) {
  const [reels, setReels] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = useMemo(() => {
    return () => {
      fetch("/api/reels")
        .then((res) => res.json())
        .then((data) => {
          setReels(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
  }, []); // Empty array means this function will not change after initial render

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);
  const nextReel = useCallback(() => {
    setCurrentIndex((prev) => (prev === reels.length - 1 ? 0 : prev + 1));
  }, [reels.length]);

  const prevReel = () => {
    setCurrentIndex((prev) => (prev === 0 ? reels.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextReel(); // سحب لليسار
      } else {
        prevReel(); // سحب لليمين
      }
    }
  };

  const goToReel = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (reels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">لا توجد Reels متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2
          className={`text-3xl font-bold mb-2 ${
            lang === "ar" ? "font-gess" : "font-sans"
          }`}
        >
          {" "}
          {lang === "ar" ? "أحدث الريلز" : "latest reels"}
        </h2>
      </div>

      <div className="relative">
        {/* زر التنقل السابق */}
        <button
          onClick={prevReel}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110"
          aria-label="السابق"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reels.map((reel, index) => (
              <div key={reel.id} className="w-full flex-shrink-0">
                <div className="relative">
                  {/* Instagram Embed */}
                  <div className="flex justify-center">
                    <iframe
                      src={`https://www.instagram.com/reel/${extractInstagramId(
                        reel.url
                      )}/embed`}
                      width="350"
                      height="620"
                      className="rounded-xl shadow-2xl"
                      style={{ border: "none", overflow: "hidden" }}
                      scrolling="no"
                      frameBorder={0}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                      title={`Instagram Reel ${index + 1}`}
                    />
                  </div>

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 pointer-events-auto">
                      <span className="text-white text-sm">
                        {index + 1} / {reels.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* زر التنقل التالي */}
        <button
          onClick={nextReel}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110"
          aria-label="التالي"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Navigation */}
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
              aria-label={`انتقل إلى الريل ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function extractInstagramId(url: string) {
  const match = url.match(/\/reel\/([^\/?]+)/);
  return match ? match[1] : "";
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative">
        <div className="flex justify-center">
          <div className="w-[350px] h-[620px]  animate-pulse rounded-xl" />
        </div>

        <div className="flex justify-center mt-6 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
