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
    if (product.pricingType === PricingType.SALE_PRICE && product.salePrice) {
      return Math.round(
        ((product.basePrice - product.salePrice) / product.basePrice) * 100
      );
    }

    if (product.pricingType === PricingType.WITH_OFFER && product.offer) {
      if (product.offer.discountPercentage)
        return product.offer.discountPercentage;
      if (product.offer.discountAmount) {
        return Math.round(
          (product.offer.discountAmount / product.basePrice) * 100
        );
      }
    }
    return 0;
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