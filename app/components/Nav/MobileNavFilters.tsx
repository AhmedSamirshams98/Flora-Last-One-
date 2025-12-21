"use client";

import { useState, useEffect } from "react"; // 🔥 إضافة useEffect
import { ChevronRight, ChevronLeft } from "lucide-react";
import { productTranslations } from "@/lib/translations/products";
import { Category, Subcategory, useFiltersStore } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";

interface MobileNavFiltersProps {
  lang: "ar" | "en";
  onClose?: () => void;
  selectedCategory: "SHOE" | "BAG" | null; // 🔥 إضافة prop جديد
  onSubcategorySelected?: () => void; // 🔥 callback عند اختيار النوع الفرعي
}

export default function MobileNavFilters({
  lang,
  onClose,
  selectedCategory, // 🔥 استقبال الفئة المحددة
  onSubcategorySelected, // 🔥 استقبال callback
}: MobileNavFiltersProps) {
  const router = useRouter();

  // 🔥 عند تلقي selectedCategory، اجعلها مباشرة النظرة النشطة
  useEffect(() => {
    if (selectedCategory) {
      setActiveView(selectedCategory === "SHOE" ? "shoes" : "bags");
    }
  }, [selectedCategory]);

  const [activeView, setActiveView] = useState<"main" | "shoes" | "bags">(
    selectedCategory ? (selectedCategory === "SHOE" ? "shoes" : "bags") : "main"
  );

  const { setCategory, setSubcategory, reset } = useFiltersStore(
    useShallow((s) => ({
      setCategory: s.setCategory,
      setSubcategory: s.setSubcategory,
      reset: s.reset,
    }))
  );

  // تعريف الفئات الرئيسية
  const mainCategories = [
    {
      id: "SHOE",
      title: productTranslations.category.SHOE[lang],
      icon: "👟",
      subcategories: [
        {
          id: "WINTER_BOOTS",
          label: productTranslations.subcategory.WINTER_BOOTS[lang],
        },
        {
          id: "SNEAKERS",
          label: productTranslations.subcategory.SNEAKERS[lang],
        },
        { id: "PUMPS", label: productTranslations.subcategory.PUMPS[lang] },
        {
          id: "BALLERINAS",
          label: productTranslations.subcategory.BALLERINAS[lang],
        },
        { id: "LOAFERS", label: productTranslations.subcategory.LOAFERS[lang] },
        {
          id: "SLIPPERS",
          label: productTranslations.subcategory.SLIPPERS[lang],
        },
        { id: "SANDALS", label: productTranslations.subcategory.SANDALS[lang] },
      ],
    },
    {
      id: "BAG",
      title: productTranslations.category.BAG[lang],
      subcategories: [
        {
          id: "HAND_BAGS",
          label: productTranslations.subcategory.HAND_BAGS[lang],
        },
        {
          id: "SHOULDER_BAGS",
          label: productTranslations.subcategory.SHOULDER_BAGS[lang],
        },
        {
          id: "CROSSBODY_BAGS",
          label: productTranslations.subcategory.CROSSBODY_BAGS[lang],
        },
        {
          id: "CLUTCH_BAGS",
          label: productTranslations.subcategory.CLUTCH_BAGS[lang],
        },
        {
          id: "BACKPACKS",
          label: productTranslations.subcategory.BACKPACKS[lang],
        },
        { id: "WALLETS", label: productTranslations.subcategory.WALLETS[lang] },
      ],
    },
  ];

  const handleCategoryClick = (categoryId: Category) => {
    setActiveView(categoryId === "SHOE" ? "shoes" : "bags");
  };

  const handleSubcategoryClick = (subcategoryId: Subcategory) => {
    setCategory(activeView === "shoes" ? "SHOE" : "BAG");
    setSubcategory(subcategoryId);
    router.push("/products");

    if (onSubcategorySelected) {
      onSubcategorySelected(); // 🔥 استدعاء callback
    }

    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    setActiveView("main");
  };

  const currentCategory = mainCategories.find(
    (cat) => cat.id === (activeView === "shoes" ? "SHOE" : "BAG")
  );

  if (!currentCategory) {
    // 🔥 إذا لم تكن هناك فئة محددة، ارجع للقائمة الرئيسية
    return (
      <div className="py-6">
        <div className="space-y-4">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id as Category)}
              className="w-full px-4 py-5 flex items-center justify-between text-white hover:bg-white/10 rounded-xl transition-all duration-200 group border border-white/10"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-bold font-gess text-xl">
                  {category.title}
                </span>
              </div>
              {lang === "ar" ? (
                <ChevronLeft className="w-6 h-6 opacity-70 group-hover:opacity-100" />
              ) : (
                <ChevronRight className="w-6 h-6 opacity-70 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* الهيدر مع زر الرجوع واسم الفئة */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={lang === "ar" ? "رجوع" : "Back"}
          >
            {lang === "ar" ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white font-gess">
              {currentCategory.title}
            </h3>
          </div>
        </div>
      </div>

      {/* قائمة الأنواع الفرعية */}
      <div className="space-y-3 px-4">
        {currentCategory.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => handleSubcategoryClick(sub.id as Subcategory)}
            className="w-full px-4 py-4 text-white hover:bg-white/10 text-left font-gess text-lg rounded-lg border border-white/10 flex items-center justify-between"
          >
            <span>{sub.label}</span>
            {lang === "ar" ? (
              <ChevronLeft className="w-4 h-4 opacity-70" />
            ) : (
              <ChevronRight className="w-4 h-4 opacity-70" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
