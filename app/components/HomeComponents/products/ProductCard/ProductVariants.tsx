"use client";
import { ProductVariant } from "@/types/product";
import Image from "next/image";

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onVariantChange: (variant: ProductVariant) => void;
  onShowAllVariants: () => void;
}

export default function ProductVariants({
  variants,
  selectedVariantId,
  onVariantChange,
  onShowAllVariants,
}: ProductVariantsProps) {
  const visibleVariants = variants.slice(0, 4);
  const remainingVariants = variants.length - 4;

  return (
    <div className="flex items-center justify-center gap-1 mt-2 px-2">
      {visibleVariants.map((variant) => (
        <button
          key={variant.id}
          onClick={(e) => {
            e.stopPropagation();
            onVariantChange(variant);
          }}
          className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
            selectedVariantId === variant.id
              ? "border-primary"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Image
            quality={75}
            loading="eager"
            src={variant.images[0] || "/placeholder.jpg"}
            alt={variant.color}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
          {variant.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-white rotate-45"></div>
            </div>
          )}
        </button>
      ))}

      {remainingVariants > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowAllVariants();
          }}
          className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-200"
        >
          +{remainingVariants}
        </button>
      )}
    </div>
  );
}
