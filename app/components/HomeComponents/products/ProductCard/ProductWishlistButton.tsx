"use client";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface ProductWishlistButtonsProps {
  isWishlisted: boolean;
  onToggleWishlist: () => Promise<void>;
  lang: "ar" | "en";
}

export default function ProductWishlistButtons({
  isWishlisted,
  onToggleWishlist,
  lang,
}: ProductWishlistButtonsProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onToggleWishlist();
      toast.success(
        isWishlisted
          ? lang === "ar"
            ? "تمت إزالة المنتج من المفضلة"
            : "Product removed from wishlist"
          : lang === "ar"
          ? "تمت إضافة المنتج إلى المفضلة"
          : "Product added to wishlist"
      );
    } catch (error) {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const label = isWishlisted
    ? lang === "ar"
      ? "إزالة من المفضلة"
      : "Remove from wishlist"
    : lang === "ar"
    ? "أضف إلى المفضلة"
    : "Add to wishlist";

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isWishlisted}
      title={label}
      className="absolute end-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full text-primary transition-colors hover:bg-white/70"
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${
          isWishlisted ? "bg-primary text-gold" : "bg-white/85"
        }`}
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? "fill-gold" : ""}`} aria-hidden="true" />
      </span>
    </button>
  );
}
