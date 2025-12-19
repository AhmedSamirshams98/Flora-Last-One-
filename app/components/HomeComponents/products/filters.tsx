"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { productTranslations } from "@/lib/translations/products";
import { Category, Subcategory, useFiltersStore } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";
interface FiltersProps {
  lang: "ar" | "en";
  onFilterChange?: (
    category: Category | null,
    subcategory: Subcategory | null
  ) => void;
}

export default function Filters({ lang, onFilterChange }: FiltersProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  const { category, subcategory, setCategory, setSubcategory, reset } =
    useFiltersStore(
      useShallow((s) => ({
        category: s.category,
        subcategory: s.subcategory,
        setCategory: s.setCategory,
        setSubcategory: s.setSubcategory,
        reset: s.reset,
      }))
    );

  const categories: { value: Category; label: string }[] = [
    { value: "SHOE", label: productTranslations.category.SHOE[lang] },
    { value: "BAG", label: productTranslations.category.BAG[lang] },
  ];

  const handleSelect = (
    category: Category | null,
    subcategory: Subcategory | null
  ) => {
    if (!category || !subcategory) return; // تجاهل إذا كانت null

    setCategory(category);
    setSubcategory(subcategory);

    if (onFilterChange) {
      onFilterChange(category, subcategory);
    }
  };

  const getSubcategories = () => {
    if (!category) return [];

    const subcategoryMap = {
      SHOE: [
        "WINTER_BOOTS",
        "SNEAKERS",
        "PUMPS",
        "BALLERINAS",
        "LOAFERS",
        "SLIPPERS",
        "SANDALS",
      ],
      BAG: [
        "HAND_BAGS",
        "SHOULDER_BAGS",
        "CROSSBODY_BAGS",
        "CLUTCH_BAGS",
        "BACKPACKS",
        "WALLETS",
      ],
    };

    return subcategoryMap[category as keyof typeof subcategoryMap].map(
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

  const getSelectedCategoryLabel = () => {
    if (!category) return lang === "ar" ? "الفئة" : "Category";
    return categories.find((c) => c.value === category)?.label || category;
  };

  const getSelectedSubcategoryLabel = () => {
    if (!subcategory) return lang === "ar" ? "النوع" : "Type";
    return (
      subcategories.find((s) => s.value === subcategory)?.label || subcategory
    );
  };

  return (
    <div className="mb-6 z-11">
      <div className="flex items-center gap-4 font-gess flex-wrap">
        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsSubcategoryOpen(false);
            }}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm flex items-center gap-2 min-w-[120px]"
          >
            <span className="truncate">{getSelectedCategoryLabel()}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isCategoryOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[180px]">
              <button
                onClick={() => {
                  reset();
                  setIsCategoryOpen(false);
                  if (onFilterChange) onFilterChange(null, null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                {lang === "ar" ? "الكل" : "All Categories"}
              </button>

              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    setCategory(c.value);
                    setSubcategory(null); // إعادة ضبط النوع
                    setIsCategoryOpen(false);

                    if (onFilterChange) onFilterChange(c.value, null);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    category === c.value ? "font-medium" : ""
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subcategory */}
        {category && (
          <div className="relative">
            <button
              onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
              className="px-4 py-2 rounded-md border bg-white text-sm flex items-center gap-2 min-w-[120px]"
            >
              <span className="truncate">{getSelectedSubcategoryLabel()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isSubcategoryOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[180px]">
                <button
                  onClick={() => {
                    setSubcategory(null);
                    setIsSubcategoryOpen(false);
                    if (onFilterChange && category) {
                      onFilterChange(category, null);
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {lang === "ar" ? "الكل" : "All Types"}
                </button>

                {subcategories.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      setSubcategory(s.value);
                      setIsSubcategoryOpen(false);

                      if (onFilterChange && category) {
                        onFilterChange(category, s.value);
                      }
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      subcategory === s.value ? "font-medium" : ""
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(category || subcategory) && (
          <button
            onClick={reset}
            className=" text-sm  bg-white  px-4 py-2 rounded-md border "
          >
            {lang === "ar" ? "مسح" : "Clear"}
          </button>
        )}
      </div>
    </div>
  );
}
