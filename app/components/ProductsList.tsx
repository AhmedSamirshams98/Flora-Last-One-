"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/app/components/HomeComponents/products/ProductCard/ProductsCard";
import { Product, ProductType } from "@/types/product";

interface ProductsListProps {
  category?: ProductType;
  subcategory?: string;
  excludeId?: string; // لإمكانية استبعاد منتج معين
  lang?: "ar" | "en";
}

export default function ProductsList({
  category,
  subcategory,
  excludeId,
  lang = "en",
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (subcategory) params.append("subcategory", subcategory);
      if (excludeId) params.append("exclude", excludeId);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, subcategory, excludeId]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">
          {lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">
        {lang === "ar"
          ? "حدث خطأ عند تحميل المنتجات"
          : "Failed to load products"}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        {lang === "ar" ? "لا توجد منتجات" : "No products available"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 container mx-auto lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} lang={lang} />
      ))}
    </div>
  );
}
