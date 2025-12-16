// components/ProductsFooter.tsx
"use client";

import { useRouter } from "next/navigation";

export default function ProductsFooter() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="text-center">
      <button
        onClick={() => navigate("/products")}
        className="bg-primary text-white px-6 py-3 font-gess rounded-lg hover:bg-primary/90 transition-colors"
      >
        عرض كل المنتجات
      </button>
    </div>
  );
}
