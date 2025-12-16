// services/pricing.service.ts
import { PricingType } from "@/types/product";
import { Offer, Offer as PrismaOffer } from "@prisma/client";

export interface PriceCalculationInput {
  basePrice: number;
  pricingType: PricingType;
  salePrice?: number;
  offer?: Offer | PrismaOffer | null;
}

export interface PriceCalculationResult {
  finalPrice: number;
  offerPrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
}

export class PricingService {
  static calculatePrice(input: PriceCalculationInput): PriceCalculationResult {
    let finalPrice = input.basePrice;
    let offerPrice: number | undefined;
    let discountPercentage: number | undefined;
    let discountAmount: number | undefined;

    switch (input.pricingType) {
      case PricingType.SALE_PRICE:
        if (input.salePrice && input.salePrice > 0) {
          finalPrice = input.salePrice;
          discountAmount = input.basePrice - input.salePrice;
          discountPercentage = (discountAmount / input.basePrice) * 100;
        }
        break;

      case PricingType.WITH_OFFER:
        if (input.offer) {
          const offerCalculation = this.calculateOfferPrice(
            input.basePrice,
            input.offer
          );
          finalPrice = offerCalculation.finalPrice;
          offerPrice = offerCalculation.finalPrice;
          discountAmount = offerCalculation.discountAmount;
          discountPercentage = offerCalculation.discountPercentage;
        }
        break;

      case PricingType.SINGLE_PRICE:
      default:
        finalPrice = input.basePrice;
        break;
    }

    return {
      finalPrice: Math.round(finalPrice * 100) / 100,
      offerPrice: offerPrice ? Math.round(offerPrice * 100) / 100 : undefined,
      discountPercentage: discountPercentage
        ? Math.round(discountPercentage * 10) / 10
        : undefined,
      discountAmount: discountAmount
        ? Math.round(discountAmount * 100) / 100
        : undefined,
    };
  }

  static calculateOfferPrice(
    basePrice: number,
    offer: Offer | PrismaOffer
  ): {
    finalPrice: number;
    discountAmount?: number;
    discountPercentage?: number;
  } {
    let finalPrice = basePrice;
    let discountAmount: number | undefined;
    let discountPercentage: number | undefined;

    switch (offer.offerType) {
      case "PERCENTAGE_DISCOUNT":
        if (offer.discountPercentage) {
          finalPrice = basePrice * (1 - offer.discountPercentage / 100);
          discountPercentage = offer.discountPercentage;
          discountAmount = basePrice - finalPrice;
        }
        break;

      case "FIXED_AMOUNT_DISCOUNT":
        if (offer.discountAmount) {
          finalPrice = Math.max(0, basePrice - offer.discountAmount);
          discountAmount = offer.discountAmount;
          discountPercentage = (discountAmount / basePrice) * 100;
        }
        break;

      case "FIXED_PRICE":
        if (offer.fixedPrice) {
          finalPrice = offer.fixedPrice;
          discountAmount = basePrice - finalPrice;
          discountPercentage = (discountAmount / basePrice) * 100;
        }
        break;

      case "BUY_X_GET_Y":
      case "FREE_SHIPPING":
      case "SIMPLE":
      default:
        // هذه العروض لا تؤثر على السعر المباشر للمنتج
        finalPrice = basePrice;
        break;
    }

    return {
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountAmount: discountAmount
        ? Math.round(discountAmount * 100) / 100
        : undefined,
      discountPercentage: discountPercentage
        ? Math.round(discountPercentage * 10) / 10
        : undefined,
    };
  }
}
