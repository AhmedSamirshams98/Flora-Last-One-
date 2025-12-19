// app/wishlist/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Home,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist-store";
import AuthPopup from "@/app/components/AuthPopup";

export default function WishlistPage() {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [lang, setLang] = useState<"ar" | "en">("ar"); // افتراضي عربي
  const { data: session } = useSession();
  const {
    items,
    loading,
    fetchWishlist,
    removeFromWishlist,
    getWishlistCount,
    clearWishlist,
  } = useWishlistStore();

  useEffect(() => {
    // الكشف عن اللغة من localStorage أو المتصفح
    const savedLang =
      localStorage.getItem("lang") ||
      (navigator.language.startsWith("ar") ? "ar" : "en");
    setLang(savedLang as "ar" | "en");
  }, []);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session, fetchWishlist]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success(
        lang === "ar"
          ? "تمت إزالة المنتج من المفضلة"
          : "Product removed from wishlist"
      );
    } catch (error) {
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء الإزالة"
          : "An error occurred while removing"
      );
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        lang === "ar"
          ? "هل أنت متأكد من حذف جميع المنتجات من المفضلة؟"
          : "Are you sure you want to remove all items from wishlist?"
      )
    ) {
      try {
        // مسح كل العناصر واحداً تلو الآخر
        for (const item of items) {
          await removeFromWishlist(item.productId);
        }
        clearWishlist();
        toast.success(
          lang === "ar"
            ? "تم مسح قائمة المفضلة"
            : "Wishlist cleared successfully"
        );
      } catch (error) {
        toast.error(
          lang === "ar"
            ? "حدث خطأ أثناء مسح المفضلة"
            : "An error occurred while clearing wishlist"
        );
      }
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {lang === "ar" ? "قائمة المفضلة" : "Wishlist"}
            </h1>
            <p className="text-gray-600 mb-8">
              {lang === "ar"
                ? "يجب تسجيل الدخول لعرض قائمة المفضلة الخاصة بك"
                : "Please sign in to view your wishlist"}
            </p>
            <button
              onClick={() => setShowAuthPopup(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
            </button>
          </div>
        </div>

        <AuthPopup
          lang={lang}
          isOpen={showAuthPopup}
          onClose={() => setShowAuthPopup(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">
              {lang === "ar" ? "جاري تحميل المفضلة..." : "Loading wishlist..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {lang === "ar" ? "قائمة المفضلة فارغة" : "Your wishlist is empty"}
            </h1>
            <p className="text-gray-600 mb-8">
              {lang === "ar"
                ? "لم تقم بإضافة أي منتجات إلى المفضلة بعد. ابدأ بالتسوق الآن!"
                : "You haven't added any products to your wishlist yet. Start shopping now!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                {lang === "ar" ? "الصفحة الرئيسية" : "Home"}
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft
                  className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`}
                />
                {lang === "ar" ? "تصفح المتجر" : "Browse Shop"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {lang === "ar" ? "قائمة المفضلة" : "My Wishlist"}
              </h1>
              <p className="text-gray-600">
                {lang === "ar"
                  ? `لديك ${getWishlistCount()} منتج في المفضلة`
                  : `You have ${getWishlistCount()} items in your wishlist`}
              </p>
            </div>

            <div className="flex gap-4">
              {items.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {lang === "ar" ? "مسح الكل" : "Clear All"}
                </button>
              )}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {lang === "ar" ? "متابعة التسوق" : "Continue Shopping"}
              </Link>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const mainVariant = item.product.variants[0];
            const hasDiscount =
              item.product.pricingType === "SALE_PRICE" ||
              item.product.pricingType === "WITH_OFFER";

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group relative hover:shadow-md transition-shadow duration-300"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-gray-600 hover:text-red-600 hover:bg-white transition-colors"
                  title={
                    lang === "ar" ? "إزالة من المفضلة" : "Remove from wishlist"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Image */}
                <Link href={`/product/${item.productId}`}>
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {mainVariant.images[0] ? (
                      <Image
                        fill
                        src={mainVariant.images[0]}
                        alt={item.product.name}
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="px-2 py-1 rounded-lg font-bold text-xs bg-red-600 text-white">
                          {lang === "ar" ? "خصم" : "Discount"}
                        </div>
                      </div>
                    )}

                    {/* New badge */}
                    {item.product.isNew && (
                      <div className="absolute top-3 left-3 z-10 mt-8">
                        <div className="px-2 py-1 rounded-lg font-bold text-xs bg-green-600 text-white">
                          {lang === "ar" ? "جديد" : "New"}
                        </div>
                      </div>
                    )}

                    {/* Featured badge */}
                    {item.product.isFeatured && (
                      <div className="absolute top-3 left-3 z-10 mt-16">
                        <div className="px-2 py-1 rounded-lg font-bold text-xs bg-yellow-600 text-white flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {lang === "ar" ? "مميز" : "Featured"}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-medium text-gray-800 mb-1 hover:text-primary transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-2">
                    {mainVariant.color}
                  </p>

                  {/* Stock status */}
                  <div className="mb-3">
                    {mainVariant.stock === 0 ? (
                      <span className="text-xs text-red-600">
                        {lang === "ar" ? "نفذ من المخزون" : "Out of Stock"}
                      </span>
                    ) : mainVariant.stock < 10 ? (
                      <span className="text-xs text-yellow-600">
                        {lang === "ar"
                          ? `باقي ${mainVariant.stock} فقط`
                          : `Only ${mainVariant.stock} left`}
                      </span>
                    ) : (
                      <span className="text-xs text-green-600">
                        {lang === "ar" ? "متوفر" : "In Stock"}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-primary">
                      {item.product.finalPrice.toLocaleString()} EGP
                    </span>

                    {item.product.basePrice > item.product.finalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {item.product.basePrice.toLocaleString()} EGP
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/product/${item.productId}`}
                      className="flex-1 py-2 text-center border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      {lang === "ar" ? "عرض المنتج" : "View Product"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              {lang === "ar" ? "الصفحة الرئيسية" : "Home"}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft
                className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`}
              />
              {lang === "ar" ? "متابعة التسوق" : "Continue Shopping"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
