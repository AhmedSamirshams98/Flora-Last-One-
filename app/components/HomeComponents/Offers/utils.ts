import dayjs from "dayjs";
import "dayjs/locale/ar-sa";
import "dayjs/locale/en";
import { Offer } from "@/types/offers";
import ar from "@/messages/ar.json";

// ============== 2. تنسيق التاريخ مع cache ==============
const formatCache = new Map<string, string>();

export const formatDate = (date: Date | string, lang: "ar" | "en"): string => {
  const cacheKey = `${date.toString()}_${lang}`;

  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }

  const formatted = dayjs(date)
    .locale(lang === "ar" ? "ar-sa" : "en")
    .format("D MMMM YYYY");

  formatCache.set(cacheKey, formatted);
  return formatted;
};

// ============== 3. تفاصيل العرض ==============
export const getOfferDetails = (
  offer: Offer,
  t: typeof ar,
  lang: "ar" | "en"
): string => {
  switch (offer.offerType) {
    case "PERCENTAGE_DISCOUNT":
      return `${t.offers.specialOffer} ${offer.discountPercentage}%`;
    case "FIXED_AMOUNT_DISCOUNT":
      return `${t.offers.specialOffer} ${offer.discountAmount} ${
        lang === "ar" ? "جنية مصري" : "Egyptian Pound "
      }`;
    case "FIXED_PRICE":
      return `${t.offers.specialOffer} ${offer.fixedPrice} ${
        lang === "ar" ? "جنية مصري " : "Egyptian Pound "
      }`;
    case "BUY_X_GET_Y":
      return lang === "ar"
        ? `اشتري ${offer.buyQuantity} واحصل على ${offer.getQuantity}`
        : `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`;
    case "FREE_SHIPPING":
      return t.offers.freeShipping;
    case "SIMPLE":
      return t.offers.specialOffer;
    default:
      return t.offers.featuredOffer;
  }
};

// ============== 4. تصفية العروض النشطة ==============
export const getActiveOffers = (
  offers: Offer[],
  now: Date,
  nowDate: Date
): Offer[] => {
  return offers.filter((offer) => {
    if (!offer.isActive) return false;

    if (offer.startDate) {
      const startDate = new Date(offer.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate > nowDate) return false;
    }

    if (offer.endDate) {
      const endDate = new Date(offer.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (endDate < now) return false;
    }

    return true;
  });
};

// ============== 5. خيارات carousel ==============
export const EMBLA_OPTIONS = {
  loop: true,
  duration: 60,
} as const;

// ============== 6. أنماط CSS ==============
export const GRADIENT_STYLES = {
  withImage: "linear-gradient(135deg, #faf9f6 0%, #3d2817 100%)",
  withoutImage: "linear-gradient(135deg, #faf9f6 10%, #3d2817 100%)",
} as const;

// ============== 7. إعدادات الصور ==============
export const IMAGE_SETTINGS = {
  sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
  quality: 80,
  logoSize: { width: 176, height: 176 },
} as const;
