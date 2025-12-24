import { prisma } from "@/lib/prisma";
import { PricingType, OfferType } from "@prisma/client";

interface CalculateFinalPriceInput {
  basePrice: number;
  salePrice?: number | null;
  offerId?: string | null;
}

interface CalculateFinalPriceResult {
  pricingType: PricingType;
  finalPrice: number;
  offerPrice: number | null;
  offerId: string | null;
}

export async function calculateFinalPrice(
  input: CalculateFinalPriceInput
): Promise<CalculateFinalPriceResult> {
  const { basePrice, salePrice, offerId } = input;

  let finalPrice = basePrice;
  let pricingType: PricingType = PricingType.SINGLE_PRICE;
  let offerPrice: number | null = null;

  // سعر مخفض يدوي
  if (salePrice !== undefined && salePrice !== null) {
    return {
      pricingType: PricingType.SALE_PRICE,
      finalPrice: round(salePrice),
      offerPrice: null,
      offerId: null,
    };
  }

  // إذا كان هناك عرض
  if (offerId) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId, isActive: true },
    });

    if (offer) {
      pricingType = PricingType.WITH_OFFER;

      switch (offer.offerType) {
        case OfferType.PERCENTAGE_DISCOUNT:
          if (offer.discountPercentage) {
            offerPrice = basePrice * (1 - offer.discountPercentage / 100);
          }
          break;

        case OfferType.FIXED_AMOUNT_DISCOUNT:
          if (offer.discountAmount) {
            offerPrice = Math.max(0, basePrice - offer.discountAmount);
          }
          break;

        case OfferType.FIXED_PRICE:
          if (offer.fixedPrice !== null && offer.fixedPrice !== undefined) {
            offerPrice = offer.fixedPrice;
          }
          break;

        default:
          offerPrice = basePrice;
      }

      if (offerPrice !== null) finalPrice = offerPrice;

      return {
        pricingType,
        finalPrice: round(finalPrice),
        offerPrice: offerPrice !== null ? round(offerPrice) : null,
        offerId: offer.id,
      };
    }
  }

  // الحالة الافتراضية
  return {
    pricingType: PricingType.SINGLE_PRICE,
    finalPrice: round(finalPrice),
    offerPrice: null,
    offerId: null,
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
