"use client";

/* The size picker that opens before a product goes into the cart: the shop's pop-up (drawn into
   <body>, Esc closes), the shop's colours and buttons, and both languages. The old one was in English
   only and had a "Size Guide" button that did nothing, so it is gone. */

import Image from "next/image";
import { Check, ShoppingCart, X } from "lucide-react";
import AdminModal from "@/app/components/AdminModal";

interface ProductSizesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantColor: string;
  variantImages: string[];
  finalPrice: number;
  sizes?: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  stock: number;
  lang: "ar" | "en";
}

export default function ProductSizesPopup({
  isOpen,
  onClose,
  productName,
  variantColor,
  variantImages,
  finalPrice,
  sizes,
  selectedSize,
  onSizeSelect,
  onAddToCart,
  stock,
  lang,
}: ProductSizesPopupProps) {
  if (!isOpen) return null;

  const isAr = lang === "ar";
  const hasSizes = !!sizes && sizes.length > 0;
  const isOutOfStock = stock === 0;
  const blocked = isOutOfStock || (hasSizes && !selectedSize);
  const T = isAr
    ? {
        pick: "اختر المقاس",
        chosen: "المقاس",
        none: "لا توجد مقاسات لهذا المنتج",
        out: "هذا المنتج غير متوفر حاليًا",
        left: `باقي ${stock} قطع فقط`,
        inStock: "متوفر",
        add: "أضف إلى السلة",
        outBtn: "غير متوفر",
        pickFirst: "اختر المقاس أولًا",
        cancel: "إلغاء",
        close: "إغلاق",
      }
    : {
        pick: "Select Size",
        chosen: "Size",
        none: "No sizes available for this product",
        out: "This item is currently out of stock",
        left: `Only ${stock} left`,
        inStock: "In stock",
        add: "Add to Cart",
        outBtn: "Out of Stock",
        pickFirst: "Select a size first",
        cancel: "Cancel",
        close: "Close",
      };

  return (
    <AdminModal onClose={onClose} label={productName} narrow dir={isAr ? "rtl" : "ltr"}>
      <div className={`p-5 ${isAr ? "font-gess" : ""}`}>
        <div className="flex items-start gap-4">
          <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
            {variantImages[0] && <Image src={variantImages[0]} alt="" fill sizes="80px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-lg text-primary">{productName}</h3>
            <p className="mt-0.5 text-sm text-primary/70">{variantColor}</p>
            <p dir="ltr" className={`mt-2 text-lg font-medium text-primary ${isAr ? "text-end" : ""}`}>
              EGP {finalPrice.toLocaleString("en-US")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={T.close}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 border-t border-gold/40 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-primary">{T.pick}</h4>
            {selectedSize && (
              <span className="text-sm text-primary/75">
                {T.chosen}: {selectedSize}
              </span>
            )}
          </div>

          {hasSizes ? (
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={T.pick}>
              {sizes!.map((size) => {
                const on = selectedSize === size;
                return (
                  <button
                    key={size}
                    role="radio"
                    aria-checked={on}
                    onClick={() => onSizeSelect(size)}
                    className={`flex min-h-12 items-center justify-center gap-1 rounded-xl border transition-colors ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/25 text-primary hover:border-gold hover:bg-gold/10"
                    }`}
                  >
                    {size}
                    {on && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-3 text-center text-primary/70">{T.none}</p>
          )}
        </div>

        <p className={`mt-4 text-sm ${isOutOfStock ? "text-[#9b2c1f]" : "text-primary/75"}`} aria-live="polite">
          {isOutOfStock ? T.out : stock < 10 ? T.left : T.inStock}
        </p>

        <button onClick={onAddToCart} disabled={blocked} className={`fl-cta mt-5 w-full ${isAr ? "font-gess" : ""}`}>
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {isOutOfStock ? T.outBtn : hasSizes && !selectedSize ? T.pickFirst : T.add}
        </button>
        <button onClick={onClose} className="mt-2 min-h-11 w-full text-primary/70 transition-colors hover:text-primary">
          {T.cancel}
        </button>
      </div>
    </AdminModal>
  );
}
