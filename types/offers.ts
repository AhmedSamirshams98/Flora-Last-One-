// ============================
// 📌 OFFER TYPES - النظام المبسط
// ============================
import { OfferType as PrismaOfferType, Product } from "@prisma/client";


export interface OfferCardProps {
  offer: Offer;
  onEdit: (offer: Offer) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}
export interface offerListProps {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}



export interface Offer {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  description?: string;
  descriptionEn?: string;
  image?: string | null; // بدلاً من image?: string;
  isActive: boolean;

  // نوع العرض الأساسي
  offerType: OfferType;

  // تفاصيل حسب نوع العرض
  discountPercentage?: number; // 20 لخصم 20%
  discountAmount?: number; // 50 لخصم 50 ريال
  fixedPrice?: number; // 199 سعر ثابت
  buyQuantity?: number; // اشتر 2
  getQuantity?: number; // احصل على 1

  // الفترة الزمنية
  startDate?: Date | null;
  endDate?: Date | null;

  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface CreateOfferInput {
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  description?: string;
  descriptionEn?: string;
  image?: string | null; // بدلاً من image?: string;
  isActive?: boolean;

  offerType: PrismaOfferType;
  discountPercentage?: number;
  discountAmount?: number;
  fixedPrice?: number;
  buyQuantity?: number;
  getQuantity?: number;

  startDate?: string | Date; // ⚠️ تقبل الاثنين
  endDate?: string | Date; // ⚠️ تقبل الاثنين
}

export type UpdateOfferInput = Partial<CreateOfferInput>;

// ⚠️ الأنواع الجديدة المبسطة
export enum OfferType {
  SIMPLE = "SIMPLE", // عرض بسيط (صورة فقط)
  PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT", // خصم نسبة مئوية
  FIXED_AMOUNT_DISCOUNT = "FIXED_AMOUNT_DISCOUNT", // خصم مبلغ ثابت
  FIXED_PRICE = "FIXED_PRICE", // سعر ثابت
  BUY_X_GET_Y = "BUY_X_GET_Y", // اشتر X احصل على Y
  FREE_SHIPPING = "FREE_SHIPPING", // شحن مجاني
}
