"use client";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  isOutOfStock: boolean;
  onClick: (e: React.MouseEvent) => void;
  lang: "ar" | "en";
}

/* Quiet on purpose: on a laptop a bar rises over the bottom of the picture on hover (or
   focus); on a phone a small round bag button sits in its corner, always there. */
export default function AddToCartButton({
  isOutOfStock,
  onClick,
  lang,
}: AddToCartButtonProps) {
  if (isOutOfStock) return null;
  const label = lang === "ar" ? "أضف إلى السلة" : "Add to Cart";

  return (
    <>
      <button
        onClick={onClick}
        className={`absolute inset-x-3 bottom-3 z-10 hidden h-11 translate-y-2 items-center justify-center gap-2 rounded-full bg-primary/95 text-sm text-primary-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-primary focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:flex motion-reduce:transition-none ${
          lang === "ar" ? "font-gess" : "tracking-wide"
        }`}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
      <button
        onClick={onClick}
        aria-label={label}
        className="absolute bottom-2 end-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md md:hidden"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  );
}
