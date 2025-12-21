"use client";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  isOutOfStock: boolean;
  onClick: (e: React.MouseEvent) => void;
  lang: "ar" | "en";
}

export default function AddToCartButton({
  isOutOfStock,
  onClick,
  lang,
}: AddToCartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isOutOfStock}
      className={`w-full mt-3 py-2 rounded-lg font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors ${
        isOutOfStock
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary/90"
      }`}
    >
      <ShoppingCart className="w-4 h-4" />
      {isOutOfStock
        ? lang === "ar"
          ? "نفذ"
          : "Out of Stock"
        : lang === "ar"
        ? "أضف إلى السلة"
        : "Add to Cart"}
    </button>
  );
}