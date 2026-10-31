"use client";

interface OutOfStockBadgeProps {
  isOutOfStock: boolean;
  lang: "ar" | "en";
}

export default function OutOfStockBadge({ isOutOfStock, lang }: OutOfStockBadgeProps) {
  if (!isOutOfStock) return null;

  return (
    <span
      className={`absolute bottom-3 start-3 z-10 rounded-full bg-primary/85 px-3 py-1 text-xs text-primary-foreground ${
        lang === "ar" ? "font-gess" : "tracking-wide"
      }`}
    >
      {lang === "ar" ? "نفذ" : "Out of stock"}
    </span>
  );
}
