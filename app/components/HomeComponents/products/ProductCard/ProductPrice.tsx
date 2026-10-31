"use client";
import { PricingType } from "@/types/product";

interface ProductPriceProps {
  pricingType: PricingType;
  basePrice: number;
  finalPrice: number;
  salePrice?: number;
  discountPercentage: number;
  lang: "ar" | "en";
}

/* The price you pay, in the dark brown; the old price small and struck through beside it.
   The percentage is on the picture's label, so it is not repeated here. */
export default function ProductPrice({
  pricingType,
  basePrice,
  finalPrice,
  salePrice,
}: ProductPriceProps) {
  const currency = "EGP";
  const now =
    pricingType === PricingType.SALE_PRICE ? salePrice ?? finalPrice : finalPrice;
  const hasOld = pricingType !== PricingType.SINGLE_PRICE && basePrice > now;

  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-start tabular-nums">
      <span dir="ltr" className="text-base font-medium text-primary">
        {currency} {now.toLocaleString("en-US")}
      </span>
      {hasOld && (
        <span dir="ltr" className="text-sm text-muted-foreground line-through">
          {currency} {basePrice.toLocaleString("en-US")}
        </span>
      )}
    </p>
  );
}
