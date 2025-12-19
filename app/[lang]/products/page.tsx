"use client";
import { useState, useEffect } from "react";
import ProductCard from "../../components/HomeComponents/products/ProductsCard";
import { usePathname } from "next/navigation";
import Filters from "../../components/HomeComponents/products/filters"; // استيراد الفلاتر
import { useProductsStore } from "@/store/products-store";
import { useFiltersStore } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";

export default function ProductsPage() {
  const pathname = usePathname();

  // تحديد اللغة بناءً على المسار
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  // استخدام Zustand store
  const {
    products,
    filteredProducts,
    loading,
    fetchProducts,
    setFilteredProducts,
  } = useProductsStore();

  const { category, subcategory } = useFiltersStore(
    useShallow((s) => ({
      category: s.category,
      subcategory: s.subcategory,
    }))
  );

  // جلب المنتجات عند تحميل الصفحة
  useEffect(() => {
    fetchProducts(); // جلب المنتجات باستخدام `Zustand`
  }, [fetchProducts]);

  // تطبيق الفلاتر على المنتجات
  useEffect(() => {
    let filtered = products;

    // فلاتر الفئة
    if (category) {
      filtered = filtered.filter((p) => p.category === category);

      if (subcategory) {
        filtered = filtered.filter((p) => p.subcategory === subcategory);
      }
    }

    setFilteredProducts(filtered);
  }, [products, category, subcategory]);

  // المنتجات التي سيتم عرضها
  const displayProducts = filteredProducts;

  return (
    <div
      className="min-h-screen bg-background py-8"
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }} // تغيير اتجاه النص بناءً على اللغة
    >
      {" "}
      <div className="container mx-auto px-4">
        {/* العنوان */}
        <div className="mb-8 flex flex-col md:flex-row justify-between  items-center">
          {/* العنوان في الشاشات الكبيرة على اليسار */}
          {lang === "ar" ? (
            <h1 className="text-4xl font-bold text-primary font-gess mb-4 text-center md:text-left">
              جميع المنتجات
            </h1>
          ) : (
            <h1 className="text-4xl font-bold text-primary font-gess mb-4 text-center md:text-left">
              All Products
            </h1>
          )}

          {/* الفلاتر في الشاشات الكبيرة على اليمين */}
          <div className="w-full md:w-auto   flex items-center justify-center">
            <Filters lang={lang} />
          </div>
        </div>

        {/* عرض المنتجات */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المنتجات...</p>
          </div>
        ) : (
          <div>
            {displayProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  لا توجد منتجات
                </h3>
                <p className="text-gray-500 mb-4">
                  لا توجد منتجات متاحة حالياً.
                </p>
              </div>
            ) : (
              <>
                {/* عدد النتائج */}
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">
                    عرض{" "}
                    <span className="font-semibold">
                      {displayProducts.length}
                    </span>{" "}
                    من <span className="font-semibold">{products.length}</span>{" "}
                    منتج
                  </p>
                </div>

                {/* شبكة المنتجات */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      lang={lang}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
