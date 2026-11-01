"use client";

/* Wishlist, in the shop's look. The language now comes from the address (/ar, /en) like every
   other page, and every link carries it; before, the language came from the browser's storage
   and the buttons pointed at /shop, a page that does not exist. */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist-store";
import AuthPopup from "@/app/components/AuthPopup";
import { ConfirmHost, confirmAction } from "@/app/components/AdminConfirm";
import "@/app/components/HomeComponents/home.css";

const money = (n: number) => `EGP ${n.toLocaleString("en-US")}`;

export default function WishlistPage() {
  const pathname = usePathname();
  const lang: "ar" | "en" = pathname.startsWith("/en") ? "en" : "ar";
  const isAr = lang === "ar";
  const font = isAr ? "font-gess" : "";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { data: session } = useSession();
  const { items, loading, fetchWishlist, removeFromWishlist, getWishlistCount, clearWishlist } = useWishlistStore();

  useEffect(() => {
    if (session) fetchWishlist();
  }, [session, fetchWishlist]);

  const T = isAr
    ? {
        title: "قائمة المفضلة",
        empty: "قائمة المفضلة فارغة",
        emptyMsg: "لم تقم بإضافة أي منتجات إلى المفضلة بعد.",
        signIn: "تسجيل الدخول",
        signInMsg: "سجّل الدخول لعرض قائمة المفضلة الخاصة بك",
        loading: "جاري تحميل المفضلة...",
        count: (n: number) => `${n} ${n === 1 ? "منتج" : "منتجات"}`,
        clear: "مسح الكل",
        confirmClear: "هل أنت متأكد من حذف جميع المنتجات من المفضلة؟",
        shop: "متابعة التسوق",
        browse: "تصفح المنتجات",
        remove: "إزالة من المفضلة",
        removed: "تمت إزالة المنتج من المفضلة",
        removeErr: "حدث خطأ أثناء الإزالة",
        cleared: "تم مسح قائمة المفضلة",
        clearErr: "حدث خطأ أثناء مسح المفضلة",
        view: "عرض المنتج",
        out: "نفذ من المخزون",
        left: (n: number) => `باقي ${n} فقط`,
        inStock: "متوفر",
        discount: "خصم",
        isNew: "جديد",
        noImage: "لا توجد صورة",
      }
    : {
        title: "My Wishlist",
        empty: "Your wishlist is empty",
        emptyMsg: "You haven't added any products to your wishlist yet.",
        signIn: "Sign In",
        signInMsg: "Sign in to view your wishlist",
        loading: "Loading wishlist...",
        count: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
        clear: "Clear All",
        confirmClear: "Are you sure you want to remove all items from your wishlist?",
        shop: "Continue Shopping",
        browse: "Browse Products",
        remove: "Remove from wishlist",
        removed: "Product removed from wishlist",
        removeErr: "An error occurred while removing",
        cleared: "Wishlist cleared",
        clearErr: "An error occurred while clearing the wishlist",
        view: "View Product",
        out: "Out of stock",
        left: (n: number) => `Only ${n} left`,
        inStock: "In stock",
        discount: "Sale",
        isNew: "New",
        noImage: "No image",
      };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success(T.removed);
    } catch {
      toast.error(T.removeErr);
    }
  };

  const handleClearAll = async () => {
    if (!(await confirmAction(T.confirmClear, T.clear))) return;
    try {
      for (const item of items) await removeFromWishlist(item.productId);
      clearWishlist();
      toast.success(T.cleared);
    } catch {
      toast.error(T.clearErr);
    }
  };

  const shell = `container mx-auto px-4 ${font}`;

  if (!session) {
    return (
      <div className={`${shell} min-h-[60vh] py-16 text-center`} dir={isAr ? "rtl" : "ltr"}>
        <Heart className="mx-auto mb-6 h-16 w-16 text-gold" aria-hidden="true" />
        <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">{T.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-primary/75">{T.signInMsg}</p>
        <button onClick={() => setShowAuthPopup(true)} className={`fl-cta mt-8 ${font}`}>{T.signIn}</button>
        <AuthPopup lang={lang} isOpen={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${shell} flex min-h-[60vh] items-center justify-center`} aria-busy="true">
        <p className="text-primary/70">{T.loading}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${shell} min-h-[60vh] py-16 text-center`} dir={isAr ? "rtl" : "ltr"}>
        <Heart className="mx-auto mb-6 h-16 w-16 text-gold" aria-hidden="true" />
        <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">{T.empty}</h1>
        <p className="mx-auto mt-4 max-w-md text-primary/75">{T.emptyMsg}</p>
        <Link href={`/${lang}/products`} className={`fl-cta mt-8 ${font}`}>{T.browse}</Link>
      </div>
    );
  }

  return (
    <div className={`${shell} py-8 md:py-12`} dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">{T.title}</h1>
          <span className="pb-1 text-primary/70">{T.count(getWishlistCount())}</span>
        </div>
        <button
          onClick={handleClearAll}
          className="min-h-11 px-2 text-primary/70 underline decoration-gold underline-offset-4 transition-colors hover:text-primary"
        >
          {T.clear}
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
        {items.map((item) => {
          const v = item.product.variants?.[0];
          if (!v) return null;
          const href = `/${lang}/product/${item.productId}`;
          const sale = item.product.basePrice > item.product.finalPrice;
          return (
            <li key={item.id} className="fl-pcard fl-glow relative flex flex-col">
              <button
                onClick={() => handleRemoveItem(item.productId)}
                aria-label={`${T.remove}: ${item.product.name}`}
                className="absolute end-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>

              <Link href={href} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
                {v.images[0] ? (
                  <Image src={v.images[0]} alt="" fill sizes="(max-width: 768px) 46vw, 24vw" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-sm text-primary/50">{T.noImage}</span>
                )}
                <span className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
                  {sale && <span className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">{T.discount}</span>}
                  {item.product.isNew && <span className="rounded-full bg-gold px-3 py-1 text-xs text-[#2a1608]">{T.isNew}</span>}
                </span>
              </Link>

              <div className="flex flex-1 flex-col px-1 pt-3">
                <h2 className="line-clamp-2 text-base text-primary">
                  <Link href={href} className="hover:underline hover:decoration-gold hover:underline-offset-4">
                    {item.product.name}
                  </Link>
                </h2>
                <p className="mt-0.5 text-sm text-primary/70">
                  {v.color} ·{" "}
                  {v.stock === 0 ? T.out : v.stock < 10 ? T.left(v.stock) : T.inStock}
                </p>
                <p dir="ltr" className={`mt-2 flex flex-wrap items-baseline gap-x-2 ${isAr ? "justify-end" : ""}`}>
                  <span className="text-base font-medium text-primary">{money(item.product.finalPrice)}</span>
                  {sale && <span className="text-sm text-primary/60 line-through">{money(item.product.basePrice)}</span>}
                </p>
                <Link href={href} className={`fl-btn-oval mt-4 w-full ${font}`}>{T.view}</Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 text-center">
        <Link href={`/${lang}/products`} className={`fl-cta ${font}`}>
          {T.shop}
          <Arrow aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <ConfirmHost />
    </div>
  );
}
