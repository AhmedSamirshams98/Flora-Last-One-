"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProductCard from "../../components/HomeComponents/products/ProductCard/ProductsCard";
import Filters from "../../components/HomeComponents/products/filters";
import { useProductsStore } from "@/store/products-store";
import { useFiltersStore, Category } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";
import { Subcategory } from "@/types/product";

export default function ProductsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = useMemo(
    () => (pathname.startsWith("/ar") ? "ar" : "en"),
    [pathname]
  );

  const { products, loading, fetchProducts, setFilteredProducts } =
    useProductsStore(
      useShallow((state) => ({
        products: state.products,
        loading: state.loading,
        fetchProducts: state.fetchProducts,
        setFilteredProducts: state.setFilteredProducts,
      }))
    );

  // Filters store
  const { category, subcategory, setFilters, reset } = useFiltersStore(
    useShallow((state) => ({
      category: state.category,
      subcategory: state.subcategory,
      setFilters: state.setFilters,
      reset: state.reset,
    }))
  );

  // ✅ أول شيء: قراءة URL params وتحديث store مباشرة
  useEffect(() => {
    const catFromQuery = searchParams.get("category") as Category | null;
    const subcatFromQuery = searchParams.get("subcategory");

    // 🔹 Convert URL string to Subcategory | null
    const normalizedSubcat: Subcategory | undefined = subcatFromQuery
      ? (subcatFromQuery as Subcategory)
      : undefined;

    if (catFromQuery) {
      setFilters(catFromQuery, normalizedSubcat);
    } else if (!catFromQuery && !subcatFromQuery) {
      reset();
    }
  }, [searchParams.toString()]);
  // ✅ مهم: استخدام toString() بدلاً من searchParams مباشرة

  // جلب المنتجات
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  // فلترة المنتجات
  const displayProducts = useMemo(() => {
    console.log("🎯 Filtering with:", {
      category,
      subcategory,
      totalProducts: products.length,
    });

    if (!category && !subcategory) {
      console.log("📦 Showing all products");
      return products;
    }

    let filtered = products;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
      console.log(`📊 After category filter (${category}):`, filtered.length);
    }

    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory === subcategory);
      console.log(
        `📊 After subcategory filter (${subcategory}):`,
        filtered.length
      );
    }

    return filtered;
  }, [products, category, subcategory]);

  // تحديث المنتجات المفلترة
  useEffect(() => {
    setFilteredProducts(displayProducts);
  }, [displayProducts, setFilteredProducts]);

  const filteredCount = displayProducts.length;
  const totalCount = products.length;

  const titleText = useMemo(
    () => (lang === "ar" ? "جميع المنتجات" : "All Products"),
    [lang]
  );

  return (
    <div
      className="min-h-screen bg-background py-8"
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-4xl font-bold text-primary font-gess mb-4 text-center md:text-left">
            {titleText}
          </h1>
          <div className="w-full md:w-auto flex items-center justify-center">
            <Filters lang={lang} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">
              {lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
            </p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {lang === "ar" ? "لا توجد منتجات" : "No products"}
            </h3>
            <p className="text-gray-500 mb-4">
              {lang === "ar"
                ? "لا توجد منتجات متاحة حالياً."
                : "No products available."}
            </p>
            {(category || subcategory) && (
              <button
                onClick={reset}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                {lang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {lang === "ar" ? (
                  <>
                    عرض <span className="font-semibold">{filteredCount}</span>{" "}
                    من <span className="font-semibold">{totalCount}</span> منتج
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold">{filteredCount}</span> of{" "}
                    <span className="font-semibold">{totalCount}</span> products
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard
                  key={`product-${product.id}`}
                  product={product}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
