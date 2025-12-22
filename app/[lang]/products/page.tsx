"use client";
import { useEffect, useMemo } from "react";
import ProductCard from "../../components/HomeComponents/products/ProductCard/ProductsCard";
import { usePathname } from "next/navigation";
import Filters from "../../components/HomeComponents/products/filters";
import { useProductsStore } from "@/store/products-store";
import { useFiltersStore } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";

export default function ProductsPage() {
  const pathname = usePathname();

  const lang = useMemo(
    () => (pathname.startsWith("/ar") ? "ar" : "en"),
    [pathname]
  );

  const { products, loading } = useProductsStore(
    useShallow((state) => ({
      products: state.products,
      loading: state.loading,
    }))
  );

  // استخراج الدوال بشكل منفصل لتجنب إعادة التقديم غير الضرورية
  const { fetchProducts, setFilteredProducts } = useProductsStore(
    useShallow((state) => ({
      fetchProducts: state.fetchProducts,
      setFilteredProducts: state.setFilteredProducts,
    }))
  );

  const { category, subcategory } = useFiltersStore(
    useShallow((state) => ({
      category: state.category,
      subcategory: state.subcategory,
    }))
  );

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  const displayProducts = useMemo(() => {
    if (!category && !subcategory) {
      return products;
    }

    let filtered = products;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);

      if (subcategory) {
        filtered = filtered.filter((p) => p.subcategory === subcategory);
      }
    }

    return filtered;
  }, [products, category, subcategory]);

  useEffect(() => {
    setFilteredProducts(displayProducts);
  }, [displayProducts, setFilteredProducts]);

  // استخدام useMemo للعناصر المشتقة
  const filteredCount = displayProducts.length;
  const totalCount = products.length;

  const titleText = useMemo(
    () => (lang === "ar" ? "جميع المنتجات" : "All Products"),
    [lang]
  );

  const LoadingSpinner = () => (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600">
        {lang === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
      </p>
    </div>
  );

  const NoProductsMessage = () => (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {lang === "ar" ? "لا توجد منتجات" : "No products"}
      </h3>
      <p className="text-gray-500 mb-4">
        {lang === "ar"
          ? "لا توجد منتجات متاحة حالياً."
          : "No products available at the moment."}
      </p>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-background py-8"
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }} // تغيير اتجاه النص بناءً على اللغة
    >
      {" "}
      <div className="container mx-auto px-4">
        {/* العنوان والفلاتر */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-4xl font-bold text-primary font-gess mb-4 text-center md:text-left">
            {titleText}
          </h1>

          <div className="w-full md:w-auto flex items-center justify-center">
            <Filters lang={lang} />
          </div>
        </div>

        {/* محتوى الصفحة */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div>
            {displayProducts.length === 0 ? (
              <NoProductsMessage />
            ) : (
              <>
                {/* عداد النتائج - ميمويز لتجنب إعادة التقديم */}
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">
                    {lang === "ar" ? (
                      <>
                        عرض{" "}
                        <span className="font-semibold">{filteredCount}</span>{" "}
                        من <span className="font-semibold">{totalCount}</span>{" "}
                        منتج
                      </>
                    ) : (
                      <>
                        Showing{" "}
                        <span className="font-semibold">{filteredCount}</span>{" "}
                        of <span className="font-semibold">{totalCount}</span>{" "}
                        products
                      </>
                    )}
                  </p>
                </div>

                {/* شبكة المنتجات - استخدام key ثابت للمنتجات */}
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
        )}
      </div>
    </div>
  );
}
