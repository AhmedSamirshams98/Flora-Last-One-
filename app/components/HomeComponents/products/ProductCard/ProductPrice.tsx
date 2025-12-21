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

export default function ProductPrice({
  pricingType,
  basePrice,
  finalPrice,
  salePrice,
  discountPercentage,
  lang,
}: ProductPriceProps) {
  const currency = "EGP";

  switch (pricingType) {
    case PricingType.SINGLE_PRICE:
      return (
        <div className="text-xl font-bold text-primary text-center">
          {finalPrice.toLocaleString()} {currency}
        </div>
      );

    case PricingType.SALE_PRICE:
      return (
        <div className="space-y-1">
          <div className="flex flex-col md:flex-row w-full justify-center items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {basePrice.toLocaleString()} {currency}
            </span>
            <span className="text-sm font-bold text-green-600">
              {salePrice?.toLocaleString()} {currency}
            </span>
          </div>
          <div className="text-xs text-center text-red-500">
            {lang === "ar" ? "خصم" : "Discount"} {discountPercentage}%
          </div>
        </div>
      );

    case PricingType.WITH_OFFER:
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              {basePrice.toLocaleString()} {currency}
            </span>
            <span className="text-xl font-bold text-green-600">
              {finalPrice.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      );
  }
}