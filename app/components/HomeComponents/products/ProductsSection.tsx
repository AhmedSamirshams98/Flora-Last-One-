"use client";

import { useEffect, useState, useMemo } from "react";
import { shallow, useShallow } from "zustand/shallow";
import ProductCard from "./ProductCard/ProductsCard";
import Filters from "./filters";
import { useProductsStore } from "@/store/products-store";
import { useFiltersStore } from "@/store/filters-store";

interface ProductsSectionProps {
  lang?: "ar" | "en";
}

export default function ProductsSection({ lang = "ar" }: ProductsSectionProps) {
  const { category, subcategory } = useFiltersStore(
    useShallow((s) => ({
      category: s.category,
      subcategory: s.subcategory,
    }))
  );

  const { products, loading, fetchProducts } = useProductsStore(
    useShallow((state) => ({
      products: state.products,
      loading: state.loading,
      fetchProducts: state.fetchProducts,
    }))
  );

  // جلب المنتجات عند التحميل
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // استخدام useMemo لحساب filteredProducts
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);

      if (subcategory) {
        filtered = filtered.filter((p) => p.subcategory === subcategory);
      }
    }

    return filtered;
  }, [products, category, subcategory]);

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
    >
      <div className="flex flex-col md:flex-row md:justify-between items-center">
        <h2
          className={`text-3xl font-bold mb-6 text-center ${
            lang === "ar" ? "font-gess" : "font-sans"
          }`}
        >
          {lang === "ar" ? "أحدث المنتجات" : "Latest Products"}
        </h2>

        <Filters lang={lang} />
      </div>

      <div className="mb-4 text-gray-600 text-center">
        {lang === "ar"
          ? `عرض ${filteredProducts.length} من ${products.length} منتج`
          : `Showing ${filteredProducts.length} of ${products.length} products`}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>
            {lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {lang === "ar" ? "لا توجد منتجات" : "No products available"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <a
          href={`/${lang}/products`}
          className="inline-block bg-primary text-white px-6 py-3 font-gess rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          {lang === "ar" ? "عرض كل المنتجات" : "View All Products"}
        </a>
      </div>
    </div>
  );
}
