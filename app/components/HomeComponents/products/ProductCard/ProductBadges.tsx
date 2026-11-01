"use client";

interface ProductBadgeProps {
  discountPercentage: number;
  isNew: boolean;
  isFeatured: boolean;
  /** "buy 2, get 1 free" when the product has a live buy-X-get-Y offer */
  offerText?: string;
  lang: "ar" | "en";
}

/* One small label at most, the most useful one: a buy-X-get-Y offer, else a discount, else "new", else "featured". */
export default function ProductBadge({
  discountPercentage,
  isNew,
  isFeatured,
  offerText,
  lang,
}: ProductBadgeProps) {
  const isAr = lang === "ar";
  let text = "";
  let sale = false;
  if (offerText) {
    // "buy 2, get 1 free" first: the price cut, if any, is already shown by the struck-through price
    text = offerText;
    sale = true;
  } else if (discountPercentage > 0) {
    text = isAr ? `خصم ${discountPercentage}%` : `${discountPercentage}% off`;
    sale = true;
  } else if (isNew) {
    text = isAr ? "جديد" : "New";
  } else if (isFeatured) {
    text = isAr ? "مميز" : "Featured";
  }
  if (!text) return null;

  return (
    <span
      className={`absolute start-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-medium ${
        sale ? "bg-gold text-[#2a1608]" : "bg-[#fff7ee]/95 text-primary"
      } ${isAr ? "font-gess" : "tracking-wide"}`}
    >
      {text}
    </span>
  );
}
