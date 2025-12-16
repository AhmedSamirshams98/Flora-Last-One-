// lib/translations/products.ts
export const productTranslations = {
  // ترجمة أنواع المنتجات
  category: {
    SHOE: { ar: "أحذية", en: "Shoes" },
    BAG: { ar: "شنط", en: "Bags" },
  },
  
  // ترجمة الأنواع الفرعية
  subcategory: {
    // أحذية
    ALL_SHOES: { ar: "جميع الأحذية", en: "All Shoes" },
    WINTER_BOOTS: { ar: "أحذية شتوية", en: "Winter Boots" },
    SNEAKERS: { ar: "أحذية رياضية", en: "Sneakers" },
    PUMPS: { ar: "كعب عالي", en: "Pumps" },
    BALLERINAS: { ar: "باليرينا", en: "Ballerinas" },
    LOAFERS: { ar: "لوفرس", en: "Loafers" },
    SLIPPERS: { ar: "شباشب", en: "Slippers" },
    SANDALS: { ar: "صنادل", en: "Sandals" },
    
    // شنط
    ALL_BAGS: { ar: "جميع الشنط", en: "All Bags" },
    HAND_BAGS: { ar: "شنط يد", en: "Hand Bags" },
    SHOULDER_BAGS: { ar: "شنط كتف", en: "Shoulder Bags" },
    CROSSBODY_BAGS: { ar: "شنط كروس", en: "Crossbody Bags" },
    CLUTCH_BAGS: { ar: "كلاتش", en: "Clutch Bags" },
    BACKPACKS: { ar: "حقائب ظهر", en: "Backpacks" },
    WALLETS: { ar: "محافظ", en: "Wallets" },
  },
} as const;

// دالة الترجمة المساعدة
export function translateCategory(category: string, lang: "ar" | "en"): string {
  return productTranslations.category[category as keyof typeof productTranslations.category]?.[lang] || category;
}

export function translateSubcategory(subcategory: string, lang: "ar" | "en"): string {
  return productTranslations.subcategory[subcategory as keyof typeof productTranslations.subcategory]?.[lang] || subcategory;
}