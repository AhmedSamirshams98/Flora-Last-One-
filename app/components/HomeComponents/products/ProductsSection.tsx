// app/components/HomeComponents/products/ProductsSection.tsx
"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductsCard";
import Filters from "./filters";

interface ProductsSectionProps {
  lang?: "ar" | "en";
}

export default function ProductsSection({ lang = "ar" }: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  // تطبيق الفلاتر عند التغيير
  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );

      if (selectedSubcategory) {
        filtered = filtered.filter(
          (product) => product.subcategory === selectedSubcategory
        );
      }
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubcategory]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }} // تغيير اتجاه النص بناءً على اللغة
    >
      <div className="flex flex-col md:flex-row md:justify-between items-center">
        <h2
          className={`text-3xl font-bold mb-6 text-center ${
            lang === "ar" ? "font-gess" : "font-sans"
          }`}
        >
          {lang === "ar" ? "أحدث المنتجات" : "Latest Products"}
        </h2>

        {/* ⚠️ تصحيح: تمرير جميع الـ props المطلوبة */}
        <Filters
          lang={lang}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategoryChange={setSelectedCategory}
          onSubcategoryChange={setSelectedSubcategory}
        />
      </div>

      {/* عرض عدد النتائج */}
      <div className="mb-4 text-gray-600 text-center">
        {lang === "ar"
          ? `عرض ${filteredProducts.length} من ${products.length} منتج`
          : `Showing ${filteredProducts.length} of ${products.length} products`}
      </div>

      {/* قائمة المنتجات */}
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
          {/* عرض أول 8 منتجات فقط في الصفحة الرئيسية */}
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}

      {/* زر عرض المزيد (إذا كان هناك أكثر من 8 منتجات) */}
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
