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

  return (
    <button
      onClick={handleClick}
      className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${
        isWishlisted
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-600"
      }`}
      title={
        isWishlisted
          ? lang === "ar"
            ? "إزالة من المفضلة"
            : "Remove from wishlist"
          : lang === "ar"
          ? "أضف إلى المفضلة"
          : "Add to wishlist"
      }
    >
      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-600" : ""}`} />
    </button>
  );
}