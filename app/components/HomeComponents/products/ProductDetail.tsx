"use client";

/* One product. After the products page: soft ivory picture tile, quiet text, no coloured
   boxes. The gallery has no auto-sliding; on a phone the price and the add-to-cart button
   stay in a bar at the bottom. All words are in the page's language. */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductSubtype, ProductType } from "@prisma/client";

import { useCartStore } from "@/store/cart-store";
import { useProductsStore } from "@/store/products-store";
import { ProductVariant, PricingType } from "@/types/product";
import AuthPopup from "@/app/components/AuthPopup";
import ProductsList from "@/app/components/ProductsList";
import { productTranslations } from "@/lib/translations/products";
import { TRUST_ITEMS } from "../trustItems";
import "../home.css";

const TEXT = {
  ar: {
    back: "رجوع",
    loading: "جاري تحميل المنتج...",
    notFound: "المنتج غير موجود",
    home: "العودة للرئيسية",
    description: "الوصف",
    color: "اللون",
    size: "المقاس",
    add: "أضف إلى السلة",
    out: "نفذ",
    available: "متاح",
    low: "الكمية محدودة",
    soldOut: "نفذ",
    added: "تمت إضافة المنتج إلى السلة",
    off: "خصم",
    prev: "الصورة السابقة",
    next: "الصورة التالية",
    similar: "قد يعجبك أيضاً",
    error: "تعذّر تحميل المنتج",
  },
  en: {
    back: "Back",
    loading: "Loading product...",
    notFound: "Product not found",
    home: "Back to home",
    description: "Description",
    color: "Colour",
    size: "Size",
    add: "Add to Cart",
    out: "Out of stock",
    available: "available",
    low: "Limited stock",
    soldOut: "Sold out",
    added: "added to cart",
    off: "off",
    prev: "Previous picture",
    next: "Next picture",
    similar: "You may also like",
    error: "Error loading product",
  },
} as const;

export default function ProductDetail({ id }: { id: string }) {
  const pathname = usePathname();
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";
  const isAr = lang === "ar";
  const t = TEXT[lang];
  const Back = isAr ? ArrowRight : ArrowLeft;

  const router = useRouter();
  const { data: session } = useSession();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const { currentProduct, getProductById, loading } = useProductsStore();
  const addToCart = useCartStore((s) => s.addToCart);

  const fetchProduct = useCallback(async () => {
    try {
      await getProductById(id);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error(t.error);
    }
  }, [id, getProductById, t.error]);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id, fetchProduct]);

  // open on the colour that was picked on the card (?color=...), else the first one
  useEffect(() => {
    const variants = currentProduct?.variants;
    if (!variants || variants.length === 0) return;
    const wanted = new URLSearchParams(window.location.search).get("color");
    const v = variants.find((x) => x.color === wanted) ?? variants[0];
    setSelectedVariant(v);
    setSelectedSize(v.sizes && v.sizes.length > 0 ? v.sizes[0] : "");
    setImageIndex(0);
  }, [currentProduct]);

  const pickVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedSize(variant.sizes && variant.sizes.length > 0 ? variant.sizes[0] : "");
    setImageIndex(0);
  };

  const discount = () => {
    if (!currentProduct) return 0;
    if (currentProduct.pricingType === PricingType.SALE_PRICE && currentProduct.salePrice) {
      return Math.round(
        ((currentProduct.basePrice - currentProduct.salePrice) / currentProduct.basePrice) * 100
      );
    }
    return 0;
  };

  const handleAddToCart = () => {
    if (!session) {
      setShowAuthPopup(true);
      return;
    }
    if (!currentProduct || !selectedVariant) return;

    const cartItem = {
      id: selectedVariant.id,
      productId: currentProduct.id,
      variantId: selectedVariant.id,
      name: currentProduct.name,
      variantName: selectedVariant.color,
      price: currentProduct.finalPrice,
      originalPrice: currentProduct.basePrice,
      image: selectedVariant.images[0] || "/placeholder.jpg",
      quantity: 1,
      color: selectedVariant.color,
      size: selectedSize,
      category: currentProduct.category,
      hasOffer: currentProduct.pricingType === PricingType.WITH_OFFER,
      offerMessage: currentProduct.offer?.title,
      discountPercentage: discount(),
    };
    addToCart(cartItem);
    toast.success(isAr ? `${t.added}` : `${currentProduct.name} ${t.added}`);
  };

  const categoryLabel = (c?: ProductType) => (c ? productTranslations.category[c][lang] : "");
  const subcategoryLabel = (s?: ProductSubtype) =>
    s && s in productTranslations.subcategory
      ? productTranslations.subcategory[s as keyof typeof productTranslations.subcategory][lang]
      : "";

  const centred = "flex min-h-[60vh] items-center justify-center px-4 text-center";

  if (loading) {
    return (
      <div className={centred}>
        <div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className={`mt-4 text-muted-foreground ${isAr ? "font-gess" : ""}`}>{t.loading}</p>
        </div>
      </div>
    );
  }
  if (!currentProduct) {
    return (
      <div className={centred}>
        <div>
          <h1 lang={lang} className="fl-display text-3xl text-primary">{t.notFound}</h1>
          <button
            onClick={() => router.push(`/${lang}`)}
            className={`mt-6 inline-flex h-11 items-center rounded-full border border-primary/30 px-6 text-primary hover:border-primary ${isAr ? "font-gess" : ""}`}
          >
            {t.home}
          </button>
        </div>
      </div>
    );
  }
  if (!selectedVariant) {
    return (
      <div className={centred}>
        <p className={`text-muted-foreground ${isAr ? "font-gess" : ""}`}>{t.loading}</p>
      </div>
    );
  }

  const images = selectedVariant.images.length > 0 ? selectedVariant.images : ["/placeholder.jpg"];
  const safeIndex = Math.min(imageIndex, images.length - 1);
  const isOut = selectedVariant.stock === 0;
  const isLow = selectedVariant.stock > 0 && selectedVariant.stock < 10;
  const pct = discount();
  const now =
    currentProduct.pricingType === PricingType.SALE_PRICE
      ? currentProduct.salePrice ?? currentProduct.finalPrice
      : currentProduct.finalPrice;
  const hasOld = currentProduct.pricingType !== PricingType.SINGLE_PRICE && currentProduct.basePrice > now;
  const label = pct > 0 ? `${t.off} ${pct}%` : currentProduct.offer?.title || (currentProduct.isNew ? (isAr ? "جديد" : "New") : "");

  const step = (d: number) => setImageIndex((i) => (i + d + images.length) % images.length);
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) step(isAr ? (dx > 0 ? 1 : -1) : dx < 0 ? 1 : -1);
  };

  const price = (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
      <span dir="ltr" className="text-3xl font-medium text-primary md:text-4xl">
        EGP {now.toLocaleString("en-US")}
      </span>
      {hasOld && (
        <span dir="ltr" className="text-lg text-muted-foreground line-through">
          EGP {currentProduct.basePrice.toLocaleString("en-US")}
        </span>
      )}
    </div>
  );

  const addButton = (extra: string) => (
    <button onClick={handleAddToCart} disabled={isOut} className={`fl-cta ${extra} ${isAr ? "font-gess" : ""}`}>
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {isOut ? t.out : t.add}
    </button>
  );

  const round =
    "grid h-11 w-11 place-items-center rounded-full bg-white/85 text-primary transition-colors hover:bg-white";

  return (
    <>
      <div className="fl-pdp-wrap bg-background" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 pt-6 md:pt-8">
          <button
            onClick={() => router.back()}
            className={`inline-flex h-11 items-center gap-2 text-primary/80 transition-colors hover:text-primary ${isAr ? "font-gess" : ""}`}
          >
            <Back size={18} aria-hidden="true" />
            {t.back}
          </button>

          <div className="fl-pdp mt-2 md:mt-4">
            {/* ---- pictures ---- */}
            <div className="fl-pdp-gallery">
              <div className="fl-pcard !p-2">
              <div
                className="fl-pdp-main relative aspect-square min-h-64 touch-pan-y overflow-hidden rounded-xl bg-[#f3eee6] md:aspect-[4/5]"
                onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
                onTouchEnd={onTouchEnd}
              >
                <Image
                  key={images[safeIndex]}
                  src={images[safeIndex]}
                  alt={`${currentProduct.name} - ${selectedVariant.color} ${safeIndex + 1}/${images.length}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 448px"
                  className="object-cover"
                />
                {label && (
                  <span
                    className={`absolute start-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-medium ${
                      pct > 0 ? "bg-gold text-[#2a1608]" : "bg-[#fff7ee]/95 text-primary"
                    } ${isAr ? "font-gess" : "tracking-wide"}`}
                  >
                    {label}
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => step(isAr ? 1 : -1)} aria-label={t.prev} className={`${round} absolute left-3 top-1/2 -translate-y-1/2 max-md:hidden`}>
                      <ChevronLeft aria-hidden="true" />
                    </button>
                    <button onClick={() => step(isAr ? -1 : 1)} aria-label={t.next} className={`${round} absolute right-3 top-1/2 -translate-y-1/2 max-md:hidden`}>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => setImageIndex(i)}
                      aria-label={`${i + 1}/${images.length}`}
                      aria-current={i === safeIndex}
                      className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f3eee6] ring-offset-2 ring-offset-background transition-shadow ${
                        i === safeIndex ? "ring-1 ring-primary" : "ring-1 ring-primary/15 hover:ring-primary/45"
                      }`}
                    >
                      <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ---- words ---- */}
            <div className="fl-pdp-info fl-pcard !p-6 md:!p-8">
              <p className={`text-sm text-primary/70 ${isAr ? "font-gess" : "tracking-wide"}`}>
                {[categoryLabel(currentProduct.category), subcategoryLabel(currentProduct.subcategory)]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
              <h1 lang={lang} className="fl-display mt-2 text-4xl leading-tight text-primary md:text-5xl">
                {currentProduct.name}
              </h1>
              <div className="mt-5">{price}</div>

              {selectedVariant.description && (
                <div className="mt-7">
                  <h2 className={`mb-2 text-xs uppercase tracking-[0.18em] text-primary/70 ${isAr ? "font-gess" : ""}`}>
                    {t.description}
                  </h2>
                  <p className={`leading-[1.9] text-primary/80 ${isAr ? "font-gess" : ""}`}>{selectedVariant.description}</p>
                </div>
              )}

              {/* colours: round pictures, the picked one with a ring and its name */}
              <div className="mt-8">
                <h2 className={`mb-3 text-xs uppercase tracking-[0.18em] text-primary/70 ${isAr ? "font-gess" : ""}`}>
                  {t.color}: <span className="text-sm normal-case tracking-normal text-primary">{selectedVariant.color}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => pickVariant(variant)}
                      aria-label={variant.stock === 0 ? `${variant.color} (${t.soldOut})` : variant.color}
                      aria-pressed={selectedVariant.id === variant.id}
                      className="grid h-14 w-14 place-items-center rounded-full"
                    >
                      <span
                        className={`relative block h-11 w-11 overflow-hidden rounded-full ring-offset-2 ring-offset-background transition-shadow ${
                          selectedVariant.id === variant.id ? "ring-2 ring-primary" : "ring-1 ring-primary/20 hover:ring-primary/50"
                        }`}
                      >
                        <Image src={variant.images[0] || "/placeholder.jpg"} alt="" fill sizes="44px" className="object-cover" />
                        {variant.stock === 0 && (
                          <span className="absolute inset-0 grid place-items-center bg-black/45">
                            <span className="h-px w-8 rotate-45 bg-white" />
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedVariant.sizes && selectedVariant.sizes.length > 0 && (
                <div className="mt-6">
                  <h2 className={`mb-3 text-xs uppercase tracking-[0.18em] text-primary/70 ${isAr ? "font-gess" : ""}`}>{t.size}</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={`inline-flex h-11 min-w-12 items-center justify-center rounded-full border px-4 text-sm transition-colors ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-primary/25 text-primary hover:border-primary/60"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* stock: one quiet line */}
              <p className={`mt-6 text-sm ${isOut ? "text-red-700" : isLow ? "text-[#9a5b12]" : "text-primary/75"} ${isAr ? "font-gess" : ""}`}>
                {isOut ? t.out : isLow ? `${t.low} · ${selectedVariant.stock} ${t.available}` : `${selectedVariant.stock} ${t.available}`}
              </p>

              {addButton("fl-pdp-cta-inline mt-6")}

              <ul className={`mt-6 grid gap-2.5 border-t border-gold/40 pt-5 text-sm text-primary/80 sm:grid-cols-2 ${isAr ? "font-gess" : ""}`}>
                {TRUST_ITEMS.map((item) => (
                  <li key={item.en} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    {isAr ? item.ar : item.en}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* phones: price and the button stay at the bottom */}
        <div className="fl-pdp-bar" dir={isAr ? "rtl" : "ltr"}>
          <div className="min-w-0 shrink-0">{price}</div>
          {addButton("flex-1")}
        </div>

        <section className="container mx-auto px-4 pt-16 md:pt-24">
          <div className="mb-8 flex items-center gap-6" dir={isAr ? "rtl" : "ltr"}>
            <h2 lang={lang} className="fl-display shrink-0 text-3xl text-primary md:text-4xl">{t.similar}</h2>
            <span className="fl-rule" aria-hidden="true" />
          </div>
          <ProductsList
            category={currentProduct.category}
            subcategory={currentProduct.subcategory}
            excludeId={currentProduct.id}
            lang={lang}
          />
        </section>
      </div>

      <AuthPopup lang={lang} isOpen={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
    </>
  );
}
