import { useState, useEffect, useMemo, useCallback } from "react";
import { Product, ProductVariant, PricingType } from "@/types/product";

export function useProductLogic(product: Product) {
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (product.variants?.length) {
      const first = product.variants[0];
      setSelectedVariant(first);
      setSelectedSize(first.sizes?.[0] || "");
    }
  }, [product]);

  const currentImages = useMemo(() => {
    return selectedVariant?.images?.length
      ? selectedVariant.images
      : ["/placeholder.jpg"];
  }, [selectedVariant]);

  const discountPercentage = useMemo(() => {
    // from the two prices the customer actually sees (the API sends the live ones), so the label can
    // never disagree with them: an offer that ended, or is switched off, shows no discount at all
    return product.basePrice > product.finalPrice && product.basePrice > 0
      ? Math.round(((product.basePrice - product.finalPrice) / product.basePrice) * 100)
      : 0;
  }, [product]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((i) =>
      i === currentImages.length - 1 ? 0 : i + 1
    );
  }, [currentImages]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((i) =>
      i === 0 ? currentImages.length - 1 : i - 1
    );
  }, [currentImages]);

  return {
    selectedVariant,
    setSelectedVariant,
    selectedSize,
    setSelectedSize,
    currentImageIndex,
    setCurrentImageIndex, // ✅ أضف هذا
    currentImages,
    nextImage,
    prevImage,
    discountPercentage,
  };
}