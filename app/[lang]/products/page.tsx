"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProductCard from "../../components/HomeComponents/products/ProductCard/ProductsCard";
import Filters from "../../components/HomeComponents/products/filters";
import { useProductsStore } from "@/store/products-store";
import { useFiltersStore, Category } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";
import { Subcategory } from "@/types/product";
import "../../components/HomeComponents/home.css";

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
      className="min-h-screen bg-background pb-20 pt-10 md:pt-14"
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
    >
      <div className="container mx-auto px-4">
        {/* the title, a thin gold line, and how many are shown */}
        <header className="mb-8 md:mb-12">
          <span className="mb-4 block h-px w-12 bg-gold" aria-hidden="true" />
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h1 lang={lang} className="fl-display text-4xl text-primary md:text-6xl">
              {titleText}
            </h1>
            {!loading && displayProducts.length > 0 && (
              <p className={`text-sm text-muted-foreground ${lang === "ar" ? "font-gess" : ""}`}>
                {lang === "ar" ? (
                  <>
                    عرض <span className="font-medium text-primary">{filteredCount}</span> من{" "}
                    <span className="font-medium text-primary">{totalCount}</span> منتج
                  </>
                ) : (
                  <>
                    Showing <span className="font-medium text-primary">{filteredCount}</span> of{" "}
                    <span className="font-medium text-primary">{totalCount}</span> products
                  </>
                )}
              </p>
            )}
          </div>
        </header>

        <div className="fl-shop">
          <aside>
            <Filters lang={lang} />
          </aside>

          <div className="min-w-0">
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                <p className={`mt-4 text-muted-foreground ${lang === "ar" ? "font-gess" : ""}`}>
                  {lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
                </p>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="py-24 text-center">
                <h2 lang={lang} className="fl-display text-2xl text-primary md:text-3xl">
                  {lang === "ar" ? "لا توجد منتجات" : "No products"}
                </h2>
                <p className={`mt-2 text-muted-foreground ${lang === "ar" ? "font-gess" : ""}`}>
                  {lang === "ar"
                    ? "لا توجد منتجات متاحة حالياً."
                    : "No products available."}
                </p>
                {(category || subcategory) && (
                  <button
                    onClick={reset}
                    className={`mt-6 inline-flex h-11 items-center rounded-full border border-primary/30 px-6 text-primary transition-colors hover:border-primary ${
                      lang === "ar" ? "font-gess" : ""
                    }`}
                  >
                    {lang === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                  </button>
                )}
              </div>
            ) : (
              <div className="fl-products-grid">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={`product-${product.id}`}
                    product={product}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
