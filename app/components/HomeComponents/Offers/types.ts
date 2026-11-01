export type DealOffer = {
  id: string;
  title: string;
  titleEn: string | null;
  image: string | null;
  offerType: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  fixedPrice: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  endDate: string | null;
};

/** A product as the home hero needs it. */
export interface HomeProduct {
  id: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  isNew: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  image: string;
  hoverImage?: string;
}
