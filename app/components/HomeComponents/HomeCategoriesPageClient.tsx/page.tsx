"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css"; // استيراد CSS الخاص بـ AOS
import { productTranslations } from "@/lib/translations/products";

interface CategoryItem {
  id: string;
  image: string;
  category: string;
  subcategory?: string | null;
}

interface HomeCategoriesPageProps {
  lang: "ar" | "en";
  categories: CategoryItem[];
}

export default function HomeCategoriesPageClient({
  lang,
  categories = [],
}: HomeCategoriesPageProps) {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <section className="container mx-auto px-4 py-4">
      <h1
        className={`text-3xl text-center text-primary mb-4 ${
          lang === "ar" ? "font-gess font-medium" : "font-sans "
        }`}
      >
        {lang === "ar" ? "الأقسام" : "Categories"}
      </h1>

      {categories.length === 0 && (
        <p className="text-center text-gray-500">
          {lang === "ar" ? "لا توجد أقسام حالياً" : "No categories available"}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3  gap-6">
        {categories.map((item, index) => {
          const categoryLabel =
            productTranslations.category[
              item.category as keyof typeof productTranslations.category
            ];
          const subcategoryLabel = item.subcategory
            ? productTranslations.subcategory[
                item.subcategory as keyof typeof productTranslations.subcategory
              ]
            : null;

          const basePath = lang === "ar" ? "/ar/products" : "/en/products";
          const params = new URLSearchParams();
          params.set("category", item.category);
          if (item.subcategory) {
            params.set("subcategory", item.subcategory);
          }
          const href = `${basePath}?${params.toString()}`;

          // تحديد اتجاه الـ animation بالتناوب
          const animation = index % 2 === 0 ? "fade-left" : "fade-right";

          return (
            <Link
              key={item.id}
              href={href}
              className="relative h-72 md:h-92 rounded-xl overflow-hidden group"
              data-aos={animation}
            >
              <Image
                src={item.image}
                alt={categoryLabel?.en ?? item.category}
                fill
                fetchPriority="high"
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 bg-black/20 flex items-end p-4 ${
                  lang === "ar"
                    ? "justify-end text-right"
                    : "justify-start text-left"
                }`}
              >
                <h2
                  className={`text-white text-xl md:text-2xl bg-primary backdrop-blur-2xl p-2 rounded-sm font-medium drop-shadow-lg ${
                    lang === "ar" ? "font-gess" : "font-sans"
                  }`}
                >
                  {lang === "ar"
                    ? subcategoryLabel?.ar || categoryLabel?.ar
                    : subcategoryLabel?.en || categoryLabel?.en}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
