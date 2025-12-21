"use client";
import { Star } from "lucide-react";

interface ProductBadgeProps {
  discountPercentage: number;
  isNew: boolean;
  isFeatured: boolean;
  lang: "ar" | "en";
}

export default function ProductBadge({
  discountPercentage,
  isNew,
  isFeatured,
  lang,
}: ProductBadgeProps) {
  const hasDiscount = discountPercentage > 0;

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      {hasDiscount && (
        <div className="px-2 py-1 rounded-lg font-bold text-xs bg-red-600 text-white flex items-center gap-1">
          <span className={lang === "ar" ? "font-gess" : "font-sans"}>
            {lang === "ar" ? "خصم" : "Discount"}
          </span>
        </div>
      )}

      {isNew && (
        <div
          className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
            lang === "ar"
              ? "bg-green-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          <span className={lang === "ar" ? "font-gess" : "font-sans"}>
            {lang === "ar" ? "جديد" : "New"}
          </span>
        </div>
      )}

      {isFeatured && (
        <div
          className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
            lang === "ar"
              ? "bg-yellow-600 text-white"
              : "bg-yellow-600 text-white"
          }`}
        >
          <Star className="w-3 h-3" />
          <span className={lang === "ar" ? "font-gess" : "font-sans"}>
            {lang === "ar" ? "مميز" : "Featured"}
          </span>
        </div>
      )}
    </div>
  );
}
