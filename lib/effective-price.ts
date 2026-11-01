/* The price a customer really pays, worked out at the moment it is needed, from the product's
   own prices and its offer, and not read back from the `finalPrice` column.

   Why: `finalPrice` is written only when a product is saved. Editing an offer's percentage, switching
   an offer off, or the offer's end date passing never rewrote it, so a product could keep an old
   discount for ever. This function is the one source of truth for the shop, the API and the orders.

   Order of the rules (the same as when the dashboard saves a product):
     1. a hand-set sale price (salePrice) wins,
     2. otherwise the product's offer, but only while it is active and today is inside its dates,
        and only the types that change the price (percentage, fixed amount, fixed price);
        SIMPLE, BUY_X_GET_Y and FREE_SHIPPING do not change the unit price,
     3. otherwise the base price.
   A discount can never raise the price above the base price, or below 0. */

export type OfferLike = {
  isActive: boolean;
  offerType: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  fixedPrice: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  title?: string;
  titleEn?: string | null;
};

type ProductLike = {
  basePrice: number;
  salePrice: number | null;
  offer?: OfferLike | null;
};

export type Effective = {
  finalPrice: number;
  offerPrice: number | null;
  pricingType: "SINGLE_PRICE" | "SALE_PRICE" | "WITH_OFFER";
  /** the offer that is really applied right now (null if none, or it is off / outside its dates) */
  appliedOffer: OfferLike | null;
};

const round = (n: number) => Math.round(n * 100) / 100;
const day = (d: Date | string) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

/** is the offer on today? (active, started, not ended; the end date counts as the last day) */
export function offerIsLive(offer: OfferLike | null | undefined, now = new Date()): boolean {
  if (!offer || !offer.isActive) return false;
  const today = day(now);
  if (offer.startDate && day(offer.startDate) > today) return false;
  if (offer.endDate && day(offer.endDate) < today) return false;
  return true;
}

export function effectivePrice(product: ProductLike, now = new Date()): Effective {
  const base = product.basePrice;

  if (product.salePrice !== null && product.salePrice !== undefined) {
    return {
      finalPrice: round(Math.min(Math.max(product.salePrice, 0), base)),
      offerPrice: null,
      pricingType: "SALE_PRICE",
      appliedOffer: null,
    };
  }

  const offer = product.offer;
  if (offerIsLive(offer)) {
    let price: number | null = null;
    switch (offer!.offerType) {
      case "PERCENTAGE_DISCOUNT":
        if (offer!.discountPercentage) price = base * (1 - offer!.discountPercentage / 100);
        break;
      case "FIXED_AMOUNT_DISCOUNT":
        if (offer!.discountAmount) price = base - offer!.discountAmount;
        break;
      case "FIXED_PRICE":
        if (offer!.fixedPrice !== null && offer!.fixedPrice !== undefined) price = offer!.fixedPrice;
        break;
    }
    if (price !== null) {
      const p = round(Math.min(Math.max(price, 0), base));
      return { finalPrice: p, offerPrice: p, pricingType: "WITH_OFFER", appliedOffer: offer! };
    }
    // a live offer that does not change the price (poster only, buy X get Y, free shipping)
    return { finalPrice: round(base), offerPrice: null, pricingType: "WITH_OFFER", appliedOffer: offer! };
  }

  return { finalPrice: round(base), offerPrice: null, pricingType: "SINGLE_PRICE", appliedOffer: null };
}

/** the product as the shop should show it: stored prices replaced by the live ones, and `inStock`
    true only when the flag is on AND at least one colour really has stock */
export function withLivePrice<
  T extends ProductLike & { inStock: boolean; variants?: { stock: number }[] }
>(product: T, now = new Date()): T & { finalPrice: number; offerPrice: number | null; pricingType: string; inStock: boolean } {
  const e = effectivePrice(product, now);
  const hasStock = !product.variants || product.variants.some((v) => v.stock > 0);
  return {
    ...product,
    // an offer that is switched off or past its dates is not shown at all
    offer: product.offer && offerIsLive(product.offer, now) ? product.offer : null,
    finalPrice: e.finalPrice,
    offerPrice: e.offerPrice,
    pricingType: e.pricingType,
    inStock: product.inStock && hasStock,
  };
}

/* ---------- "Buy X, get Y free" ----------
   It does not change the unit price: it takes units off the bill. For every X + Y units of the same
   product in the order, Y are free (buy 2 get 1: 3 pieces cost 2, 6 pieces cost 4, 5 pieces cost 4).
   It works with the product's normal or sale price, and only while the offer is on and in its dates. */

/** the live "buy X get Y" offer of a product, or null */
export function buyXGetYOffer(offer: OfferLike | null | undefined, now = new Date()): { buy: number; get: number } | null {
  if (!offer || offer.offerType !== "BUY_X_GET_Y" || !offerIsLive(offer, now)) return null;
  const buy = Number(offer.buyQuantity);
  const get = Number(offer.getQuantity);
  return Number.isInteger(buy) && Number.isInteger(get) && buy >= 1 && get >= 1 ? { buy, get } : null;
}

/** how many of `qty` units are free under "buy X get Y" */
export function freeUnits(qty: number, buy: number, get: number): number {
  if (buy < 1 || get < 1 || qty < 1) return 0;
  return Math.floor(qty / (buy + get)) * get;
}
