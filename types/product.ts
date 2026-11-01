import { productTranslations } from "@/lib/translations/products";
import { Offer } from "./offers";

export interface Product {
  id: string;
  name: string;
  category: ProductType;
  subcategory?: ProductSubtype; // ⚠️ غير مطلوب

  // ===== التسعير =====
  basePrice: number;
  salePrice?: number;

  // ===== العرض =====
  offerId?: string;
  offerPrice?: number;

  // ===== نوع التسعير =====
  pricingType: PricingType;
  finalPrice: number;

  // ===== معلومات إضافية =====
  isNew: boolean;
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;

  createdAt: string;
  updatedAt: string;

  // ===== العلاقات =====
  variants: ProductVariant[];
  offer?: Offer;
}

export interface ProductVariant {
  id: string;
  productId: string;
  price: number;

  code: string;
  color: string;
  sizes?: string[]; // بدل size?: string;
  images: string[];
  stock: number;
  description?: string;
}

export interface CreateProductInput {
  name: string;
  category: ProductType;
  subcategory?: ProductSubtype;
  description?: string;
  image?: string;
  size?: string;
  basePrice: number;
  salePrice?: number;
  offerId?: string;
  pricingType?: PricingType;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  variants?: CreateVariantInput[];
}

export interface CreateVariantInput {
  code?: string; // ← أضف هذا
  color: string;
  colorHex?: string;
  sizes?: string[]; // ⚠️ تغيير من size?: string إلى sizes?: string[]
  price: number;
  images: string[];
  stock?: number;
  description?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;
export interface ProductUpdateData {
  name?: string;
  code?: string;
  category?: string;
  subcategory?: string | null;
  description?: string | null;
  image?: string | null;
  size?: string | null;
  basePrice?: number;
  salePrice?: number | null;
  offerId?: string | null;
  offerPrice?: number | null;
  pricingType?: string;
  finalPrice?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  variants?: {
    create: Array<{
      color: string;
      colorHex?: string | null;
      size?: string | null;
      price: number;
      images: string[];
      stock: number;
    }>;
  };
}

// ===== الأنواع =====
export enum ProductType {
  BAG = "BAG",
  SHOE = "SHOE",
}

export enum ProductSubtype {
  WINTER_BOOTS = "WINTER_BOOTS",
  SNEAKERS = "SNEAKERS",
  PUMPS = "PUMPS",
  BALLERINAS = "BALLERINAS",
  LOAFERS = "LOAFERS",
  SLIPPERS = "SLIPPERS",
  SANDALS = "SANDALS",
  HAND_BAGS = "HAND_BAGS",
  SHOULDER_BAGS = "SHOULDER_BAGS",
  CROSSBODY_BAGS = "CROSSBODY_BAGS",
  CLUTCH_BAGS = "CLUTCH_BAGS",
  BACKPACKS = "BACKPACKS",
  WALLETS = "WALLETS",
}

export enum ProductFilter {
  ALL_SHOES = "ALL_SHOES",
  ALL_BAGS = "ALL_BAGS",
}
export type Subcategory = ProductSubtype | ProductFilter | null;

export function translateSubcategory(
  subcategory: Subcategory,
  lang: "ar" | "en"
) {
  if (!subcategory) return lang === "ar" ? "النوع" : "Type";

  if (subcategory === ProductFilter.ALL_SHOES) 
    return lang === "ar" ? "كل الأحذية" : "All Shoes";
    
  if (subcategory === ProductFilter.ALL_BAGS) 
    return lang === "ar" ? "كل الشنط" : "All Bags";

  return productTranslations.subcategory[subcategory as ProductSubtype][lang];
}


/* Ballerinas + loafers are one section, slippers + sandals are one section. The database keeps
   all four values (old products), the shop shows two names and filters both values together. */
const MERGED: Record<string, ProductSubtype[]> = {
  [ProductSubtype.BALLERINAS]: [ProductSubtype.BALLERINAS, ProductSubtype.LOAFERS],
  [ProductSubtype.LOAFERS]: [ProductSubtype.BALLERINAS, ProductSubtype.LOAFERS],
  [ProductSubtype.SLIPPERS]: [ProductSubtype.SLIPPERS, ProductSubtype.SANDALS],
  [ProductSubtype.SANDALS]: [ProductSubtype.SLIPPERS, ProductSubtype.SANDALS],
};

/** the one value the shop and the forms use for a section (LOAFERS -> BALLERINAS, SANDALS -> SLIPPERS) */
export function canonicalSubtype<T extends string | null | undefined>(s: T): T | ProductSubtype {
  if (s === ProductSubtype.LOAFERS) return ProductSubtype.BALLERINAS;
  if (s === ProductSubtype.SANDALS) return ProductSubtype.SLIPPERS;
  return s;
}

/** every stored value that belongs to a section */
export function subtypesOf(s: string): string[] {
  return MERGED[s] ?? [s];
}

/** does a product with this subtype belong to the chosen section? (no section, or "all", matches everything) */
export function matchesSubcategory(productSub: string | null | undefined, filter: string | null | undefined): boolean {
  if (!filter || filter === ProductFilter.ALL_SHOES || filter === ProductFilter.ALL_BAGS) return true;
  return !!productSub && subtypesOf(filter).includes(productSub);
}

export enum PricingType {
  SINGLE_PRICE = "SINGLE_PRICE",
  SALE_PRICE = "SALE_PRICE",
  WITH_OFFER = "WITH_OFFER",
}

// ===== دوال مساعدة =====
export const PRODUCT_TYPES = [
  { value: ProductType.BAG, label: "شنط" },
  { value: ProductType.SHOE, label: "أحذية" },
];

export const SHOE_SUBTYPES = [
  { value: ProductSubtype.WINTER_BOOTS, label: "أحذية شتوية" },
  { value: ProductSubtype.SNEAKERS, label: "أحذية رياضية" },
  { value: ProductSubtype.PUMPS, label: "كعب عالي" },
  { value: ProductSubtype.BALLERINAS, label: "باليرينا ولوفرس" },
  { value: ProductSubtype.SLIPPERS, label: "شباشب وصنادل" },
];

export const BAG_SUBTYPES = [
  { value: ProductSubtype.HAND_BAGS, label: "شنط يد" },
  { value: ProductSubtype.SHOULDER_BAGS, label: "شنط كتف" },
  { value: ProductSubtype.CROSSBODY_BAGS, label: "شنط كروس" },
  { value: ProductSubtype.CLUTCH_BAGS, label: "كلاتش" },
  { value: ProductSubtype.BACKPACKS, label: "حقائب ظهر" },
  { value: ProductSubtype.WALLETS, label: "محافظ" },
];

export const PRICING_TYPES = [
  { value: PricingType.SINGLE_PRICE, label: "سعر واحد" },
  { value: PricingType.SALE_PRICE, label: "سعر مخفض" },
  { value: PricingType.WITH_OFFER, label: "مع عرض" },
];

// ===== دوال التحويل =====
export function toPrismaProductType(type: ProductType): string {
  return type; // لأن ProductType عندك string
}

export function fromPrismaProductType(type: string): ProductType {
  return type as ProductType;
}
