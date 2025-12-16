// types/cart.ts أو في نفس ملف store
export interface CartItem {
  id: string; // ID للعنصر في السلة
  productId: string; // ⚠️ أضف هذا الحقل
  variantId?: string;
  name: string;
  price: number;
  originalPrice?: number; // السعر قبل الخصم
  image: string;
  quantity: number;
  code?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  category: string;
  
  // حقول للعروض
  isOffer?: boolean;
  offerId?: string;
  discountedPrice?: number;
  
  // ⚠️ حقول إضافية قد تحتاجها
  productName?: string; // للحفظ في الطلب
  variantDetails?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}