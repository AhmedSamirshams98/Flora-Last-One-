export const languages = ["en", "ar"] as const;

export const defaultLang = "ar";

export const messages = {
  en: () => import("./messages/en.json").then(res => res.default),
  ar: () => import("./messages/ar.json").then(res => res.default),
};

export type Lang = (typeof languages)[number];
