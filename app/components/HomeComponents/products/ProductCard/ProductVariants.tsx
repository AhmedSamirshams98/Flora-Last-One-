"use client";
import { ProductVariant } from "@/types/product";
import Image from "next/image";

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onVariantChange: (variant: ProductVariant) => void;
  onShowAllVariants: () => void;
}

/* The colours as small round pictures under the name; the picked one has a thin ring. */
export default function ProductVariants({
  variants,
  selectedVariantId,
  onVariantChange,
  onShowAllVariants,
}: ProductVariantsProps) {
  const visibleVariants = variants.slice(0, 4);
  const remainingVariants = variants.length - 4;

  return (
    <div className="mt-2 flex items-center gap-1">
      {visibleVariants.map((variant) => (
        <button
          key={variant.id}
          onClick={(e) => {
            e.stopPropagation();
            onVariantChange(variant);
          }}
          aria-label={variant.color}
          aria-pressed={selectedVariantId === variant.id}
          className="grid h-8 w-8 place-items-center rounded-full"
        >
          <span
            className={`relative block h-6 w-6 overflow-hidden rounded-full ring-offset-2 ring-offset-background transition-shadow ${
              selectedVariantId === variant.id
                ? "ring-1 ring-primary"
                : "ring-1 ring-primary/15 hover:ring-primary/45"
            }`}
          >
            <Image
              quality={60}
              src={variant.images[0] || "/placeholder.jpg"}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
            {variant.stock === 0 && (
              <span className="absolute inset-0 grid place-items-center bg-black/45">
                <span className="h-px w-5 rotate-45 bg-white" />
              </span>
            )}
          </span>
        </button>
      ))}

      {remainingVariants > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowAllVariants();
          }}
          className="grid h-8 min-w-8 place-items-center rounded-full px-1 text-xs text-muted-foreground hover:text-primary"
        >
          +{remainingVariants}
        </button>
      )}
    </div>
  );
}
