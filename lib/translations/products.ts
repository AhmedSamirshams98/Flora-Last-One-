export const productTranslations = {
  category: {
    SHOE: { ar: "أحذية", en: "Shoes" },
    BAG: { ar: "شنط", en: "Bags" },
  },
  subcategory: {
    WINTER_BOOTS: { ar: "أحذية شتوية", en: "Winter Boots" },
    SNEAKERS: { ar: "أحذية رياضية", en: "Sneakers" },
    PUMPS: { ar: "كعب عالي", en: "Pumps" },
    // the shop treats ballerinas + loafers, and slippers + sandals, as one section each; the old
    // LOAFERS / SANDALS values stay in the database and simply show the merged name
    BALLERINAS: { ar: "باليرينا ولوفرس", en: "Ballerinas & Loafers" },
    LOAFERS: { ar: "باليرينا ولوفرس", en: "Ballerinas & Loafers" },
    SLIPPERS: { ar: "شباشب وصنادل", en: "Slippers & Sandals" },
    SANDALS: { ar: "شباشب وصنادل", en: "Slippers & Sandals" },
    HAND_BAGS: { ar: "شنط يد", en: "Hand Bags" },
    SHOULDER_BAGS: { ar: "شنط كتف", en: "Shoulder Bags" },
    CROSSBODY_BAGS: { ar: "شنط كروس", en: "Crossbody Bags" },
    CLUTCH_BAGS: { ar: "كلاتش", en: "Clutch Bags" },
    BACKPACKS: { ar: "حقائب ظهر", en: "Backpacks" },
    WALLETS: { ar: "محافظ", en: "Wallets" },
  },
} as const;
