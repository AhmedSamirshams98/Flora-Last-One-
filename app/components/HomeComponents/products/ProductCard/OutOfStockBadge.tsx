"use client";

interface OutOfStockBadgeProps {
  isOutOfStock: boolean;
  lang: "ar" | "en";
}

export default function OutOfStockBadge({ isOutOfStock, lang }: OutOfStockBadgeProps) {
  if (!isOutOfStock) return null;

  return (
    <div className="absolute top-3 right-3 z-10">
      <div
        className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
          lang === "ar" ? "bg-red-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        <span className={lang === "ar" ? "font-gess" : "font-sans"}>
          {lang === "ar" ? "نفذ" : "Out of Stock"}
        </span>
      </div>
    </div>
  );
}