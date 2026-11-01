"use client";

/* Cart, in the shop's own look: white cards with the thin gold line, the product photo, the same
   gold primary button. Same store, same translations, same checkout link as before. */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import arTranslations from "@/messages/ar.json";
import enTranslations from "@/messages/en.json";
import "@/app/components/HomeComponents/home.css";

const money = (n: number) => `EGP ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const roundBtn =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-primary-foreground";

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";
  const isAr = lang === "ar";
  const t = (isAr ? arTranslations : enTranslations).cart;
  const Back = isAr ? ArrowRight : ArrowLeft;

  const { items: cart, removeFromCart, updateQuantity, getTotalPrice, clearCart, getTotalItems } = useCartStore();

  // the cart lives in the browser's storage, so draw it only once we are in the browser
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t.cartIsEmptyToast || "Cart is empty!");
      return;
    }
    router.push(`/${lang}/checkout`);
  };

  const font = isAr ? "font-gess" : "";

  if (!isClient) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (cart.length === 0) {
    return (
      <div className={`container mx-auto min-h-[60vh] px-4 py-16 text-center ${font}`} dir={isAr ? "rtl" : "ltr"}>
        <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-gold" aria-hidden="true" />
        <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">
          {t.emptyTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-primary/75">{t.emptyMessage}</p>
        <Link href={`/${lang}/products`} className={`fl-cta mt-8 ${font}`}>
          {t.browseProducts}
        </Link>
      </div>
    );
  }

  const count = getTotalItems();

  return (
    <div className={`container mx-auto px-4 py-8 md:py-12 ${font}`} dir={isAr ? "rtl" : "ltr"}>
      <Link
        href={`/${lang}/products`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-primary/80 transition-colors hover:text-primary"
      >
        <Back className="h-4 w-4" aria-hidden="true" />
        {t.continueShopping}
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">
            {t.pageTitle}
          </h1>
          <span className="pb-1 text-primary/70">
            {count} {count === 1 ? t.item : t.items}
          </span>
        </div>
        <button
          onClick={() => {
            clearCart();
            toast.success(t.cartCleared);
          }}
          className="min-h-11 px-2 text-primary/70 underline decoration-gold underline-offset-4 transition-colors hover:text-primary"
        >
          {t.clearCart}
        </button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
        <ul className="space-y-4">
          {cart.map((item) => {
            const discounted = item.originalPrice && item.originalPrice > item.price;
            return (
              <li key={item.id} className="fl-pcard flex gap-4 !p-3 sm:gap-5 sm:!p-4">
                <Link
                  href={`/${lang}/product/${item.productId}`}
                  className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl bg-secondary sm:w-32"
                >
                  {item.image && (
                    <Image src={item.image} alt="" fill sizes="128px" className="object-cover" />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-base text-primary sm:text-lg">
                      <Link href={`/${lang}/product/${item.productId}`} className="hover:underline hover:decoration-gold hover:underline-offset-4">
                        {item.name}
                      </Link>
                    </h2>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success(t.itemRemoved);
                      }}
                      aria-label={`${t.remove}: ${item.name}`}
                      className={`${roundBtn} border-transparent`}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="mt-1 text-sm text-primary/70">
                    {[item.color && `${t.color}: ${item.color}`, item.size && `${t.size}: ${item.size}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-2" role="group" aria-label={t.items}>
                      <button
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                          else {
                            removeFromCart(item.id);
                            toast.success(t.itemRemoved);
                          }
                        }}
                        aria-label="-"
                        className={roundBtn}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center font-medium text-primary" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="+" className={roundBtn}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <p dir="ltr" className="flex items-baseline gap-2">
                      <span className="text-lg font-medium text-primary">{money(item.price * item.quantity)}</span>
                      {discounted && (
                        <span className="text-sm text-primary/60 line-through">
                          {money((item.originalPrice as number) * item.quantity)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="fl-pcard !p-6 lg:sticky lg:top-24">
          <h2 lang={lang} className="fl-display mb-5 text-2xl text-primary">
            {t.orderSummary}
          </h2>
          <div className="flex items-center justify-between text-primary/80">
            <span>
              {t.items} ({count})
            </span>
            <span dir="ltr">{money(getTotalPrice())}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gold/40 pt-4">
            <span className="text-lg text-primary">{t.total}</span>
            <span dir="ltr" className="fl-display text-3xl text-primary" lang="en">
              {money(getTotalPrice())}
            </span>
          </div>
          <button className={`fl-cta mt-6 w-full ${font}`} onClick={handleCheckout}>
            {t.proceedToCheckout}
          </button>
          <Link href={`/${lang}/products`} className={`fl-btn-oval mt-3 w-full ${font}`}>
            {t.continueShopping}
          </Link>
        </aside>
      </div>
    </div>
  );
}
