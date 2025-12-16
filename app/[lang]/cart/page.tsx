"use client";
import { usePathname, useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useState } from "react";

// استيراد ملفات الترجمة
import arTranslations from "@/messages/ar.json";
import enTranslations from "@/messages/en.json";

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();

  // تحديد اللغة بناءً على المسار
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  // استخدام الترجمات المناسبة
  const translations = lang === "ar" ? arTranslations : enTranslations;
  const t = translations.cart;
  const isRTL = lang === "ar";

  const {
    items: cart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
    getTotalItems,
  } = useCartStore();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t.cartIsEmptyToast || "Cart is empty!");
      return;
    }
    router.push(`/${lang}/checkout`); // 🔹 تصحيح: إضافة اللغة إلى المسار
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col bg-gray-50"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8">
            <button
              onClick={() => router.push(`/${lang}/products`)}
              className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6 ${
                isRTL ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? "" : "rotate-180"}`} />
              <span className="font-medium">{t.backToShopping}</span>
            </button>

            <h1 className="text-2xl font-bold text-center text-gray-900">
              {t.pageTitle}
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {t.emptyTitle}
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                {t.emptyMessage}
              </p>

              <button
                onClick={() => router.push(`/${lang}/products`)}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                {t.browseProducts}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${lang}/products`)}
            className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4 ${
              isRTL ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
            <span className="font-medium">{t.continueShopping}</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>

            <div className="flex items-center gap-4">
              <span className="text-lg text-gray-600">
                {getTotalItems()} {getTotalItems() === 1 ? t.item : t.items}
              </span>

              <button
                onClick={() => {
                  clearCart();
                  toast.success(t.cartCleared);
                }}
                className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                {t.clearCart}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "/api/placeholder/96/96"}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = "/api/placeholder/96/96";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    {item.color && (
                      <span className="text-gray-600">
                        {t.color}:{" "}
                        <span className="text-gray-800 font-medium">
                          {item.color}
                        </span>
                      </span>
                    )}
                    {item.size && (
                      <span className="text-gray-600">
                        {t.size}:{" "}
                        <span className="text-gray-800 font-medium">
                          {item.size}
                        </span>
                      </span>
                    )}
                    {item.category && (
                      <span className="text-gray-600">
                        {t.category}:{" "}
                        <span className="text-gray-800 font-medium">
                          {item.category}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-8">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeFromCart(item.id);
                            toast.success(t.itemRemoved);
                          }
                        }}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-8 text-center font-semibold text-gray-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success(t.itemRemoved);
                      }}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">{t.itemRemoved}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="text-xl font-bold text-blue-600">
                    {item.price?.toFixed(2)}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {t.total}: {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {t.orderSummary}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {t.items} ({getTotalItems()}):
                  </span>
                  <span className="text-gray-800 font-semibold">
                    {getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {t.total}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="w-full bg-primary text-white font-medium py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-3"
                onClick={handleCheckout}
              >
                {t.proceedToCheckout}
              </button>

              <button
                className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                onClick={() => router.push(`/${lang}/products`)}
              >
                {t.continueShopping}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
