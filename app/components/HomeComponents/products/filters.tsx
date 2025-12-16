// components/products/Filters.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { productTranslations } from "@/lib/translations/products";

interface FiltersProps {
  lang: "ar" | "en";
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
}

export default function Filters({
  lang,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}: FiltersProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  // قائمة الفئات مع الترجمات
  const categories = [
    { value: "SHOE", label: productTranslations.category.SHOE[lang] },
    { value: "BAG", label: productTranslations.category.BAG[lang] },
  ];

  // الأنواع الفرعية بناءً على الفئة المختارة
  const getSubcategories = () => {
    if (!selectedCategory) return [];

    const subcategoryMap = {
      SHOE: [
        "ALL_SHOES",
        "WINTER_BOOTS",
        "SNEAKERS",
        "PUMPS",
        "BALLERINAS",
        "LOAFERS",
        "SLIPPERS",
        "SANDALS",
      ],
      BAG: [
        "ALL_BAGS",
        "HAND_BAGS",
        "SHOULDER_BAGS",
        "CROSSBODY_BAGS",
        "CLUTCH_BAGS",
        "BACKPACKS",
        "WALLETS",
      ],
    };

    return subcategoryMap[selectedCategory as keyof typeof subcategoryMap].map(
      (sub) => ({
        value: sub,
        label:
          productTranslations.subcategory[
            sub as keyof typeof productTranslations.subcategory
          ][lang],
      })
    );
  };

  const subcategories = getSubcategories();

  // الحصول على تسمية الفئة المختارة
  const getSelectedCategoryLabel = () => {
    if (!selectedCategory) return lang === "ar" ? "الفئة" : "Category";
    return (
      categories.find((c) => c.value === selectedCategory)?.label ||
      selectedCategory
    );
  };

  // الحصول على تسمية النوع الفرعي المختار
  const getSelectedSubcategoryLabel = () => {
    if (!selectedSubcategory) return lang === "ar" ? "النوع" : "Type";
    return (
      subcategories.find((s) => s.value === selectedSubcategory)?.label ||
      selectedSubcategory
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 font-gess flex-wrap">
        {/* Dropdown الفئة */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsSubcategoryOpen(false);
            }}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm flex items-center gap-2 hover:border-gray-400 transition-colors min-w-[120px]"
          >
            <span className="truncate">{getSelectedCategoryLabel()}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isCategoryOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown قائمة الفئات */}
          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[180px] max-h-60 overflow-y-auto">
              {/* خيار "الكل" */}
              <button
                onClick={() => {
                  onCategoryChange(null);
                  onSubcategoryChange(null);
                  setIsCategoryOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  !selectedCategory
                    ? "bg-gray-50 text-gray-900"
                    : "text-gray-700"
                }`}
              >
                {lang === "ar" ? "الكل" : "All Categories"}
              </button>

              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    onCategoryChange(category.value);
                    onSubcategoryChange(null);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    selectedCategory === category.value
                      ? "bg-gray-50 text-gray-900 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown النوع الفرعي (يظهر فقط عند اختيار فئة) */}
        {selectedCategory && (
          <div className="relative">
            <button
              onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm flex items-center gap-2 hover:border-gray-400 transition-colors min-w-[120px]"
            >
              <span className="truncate">{getSelectedSubcategoryLabel()}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isSubcategoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown قائمة الأنواع الفرعية */}
            {isSubcategoryOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[180px] max-h-60 overflow-y-auto">
                {/* خيار "الكل" للنوع الفرعي */}
                <button
                  onClick={() => {
                    onSubcategoryChange(null);
                    setIsSubcategoryOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    !selectedSubcategory
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {lang === "ar" ? "الكل" : "All Types"}
                </button>

                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory.value}
                    onClick={() => {
                      onSubcategoryChange(subcategory.value);
                      setIsSubcategoryOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      selectedSubcategory === subcategory.value
                        ? "bg-gray-50 text-gray-900 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {subcategory.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* زر إعادة التعيين (صغير وبسيط) */}
        {(selectedCategory || selectedSubcategory) && (
          <button
            onClick={() => {
              onCategoryChange(null);
              onSubcategoryChange(null);
              setIsCategoryOpen(false);
              setIsSubcategoryOpen(false);
            }}
            className="px-3 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
            title={lang === "ar" ? "إعادة التعيين" : "Reset filters"}
          >
            {lang === "ar" ? "مسح" : "Clear"}
          </button>
        )}
      </div>
    </div>
  );
}
