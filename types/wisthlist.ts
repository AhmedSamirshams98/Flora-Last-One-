// types/wishlist.ts
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    category: string;
    finalPrice: number;
    basePrice: number;
    pricingType: string;
    isNew?: boolean;
    isFeatured?: boolean;
    variants: {
      id: string;
      color: string;
      images: string[];
      sizes?: string[];
      stock: number;
    }[];
    offer?: {
      id: string;
      title: string;
      offerType: string;
      discountPercentage?: number;
    };
  };
}

export interface WishlistResponse {
  items: WishlistItem[];
  count: number;
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface RemoveFromWishlistRequest {
  productId: string;
}