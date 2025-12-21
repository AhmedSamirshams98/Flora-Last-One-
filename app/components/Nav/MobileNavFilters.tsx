"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { productTranslations } from "@/lib/translations/products";
import { Category, Subcategory, useFiltersStore } from "@/store/filters-store";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";

interface MobileNavFiltersProps {
  lang: "ar" | "en";
  onClose?: () => void;
}

export default function MobileNavFilters({
  lang,
  onClose,
}: MobileNavFiltersProps) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"main" | "shoes" | "bags">(
    "main"
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const { setCategory, setSubcategory, reset } = useFiltersStore(
    useShallow((s) => ({
      setCategory: s.setCategory,
      setSubcategory: s.setSubcategory,
      reset: s.reset,
    }))
  );

  // تعريف الفئات الرئيسية - فقط شنط وأحذية
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
      icon: "👜",
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
    setSelectedCategory(categoryId);

    if (categoryId === "SHOE") {
      setActiveView("shoes");
    } else if (categoryId === "BAG") {
      setActiveView("bags");
    }
  };

  const handleSubcategoryClick = (subcategoryId: Subcategory) => {
    setCategory(selectedCategory!);
    setSubcategory(subcategoryId);
    router.push("/products");
    if (onClose) onClose();
  };

  const handleBack = () => {
    setActiveView("main");
    setSelectedCategory(null);
  };

  const handleViewAllProducts = () => {
    reset();
    router.push("/products");
    if (onClose) onClose();
  };

  // عرض الشاشة الرئيسية - فقط كلمتي "شنط" و "أحذية"
  if (activeView === "main") {
    return (
      <div className="py-6">
        {/* لا يوجد عنوان، فقط القائمتان */}
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

        {/* زر عرض جميع المنتجات */}
        <div className="mt-10 px-4">
          <button
            onClick={handleViewAllProducts}
            className="w-full py-4 px-4 text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 font-medium border border-white/20"
          >
            {lang === "ar" ? "عرض جميع المنتجات" : "View All Products"}
          </button>
        </div>
      </div>
    );
  }

  // عرض شاشة التفاصيل (أحذية أو شنط)
  const currentCategory = mainCategories.find(
    (cat) => cat.id === selectedCategory
  );

  if (!currentCategory) {
    return null;
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
            <span className="text-2xl">{currentCategory.icon}</span>
            <h3 className="text-xl font-bold text-white font-gess">
              {currentCategory.title}
            </h3>
          </div>
        </div>
        <p className="text-sm text-white/70 pr-14">
          {lang === "ar" ? "اختر النوع" : "Select type"}
        </p>
      </div>

      {/* قائمة الأنواع الفرعية */}
      <div className="space-y-3 px-4">
        <button
          onClick={() => {
            setCategory(selectedCategory!);
            setSubcategory(null);
            router.push("/products");
            if (onClose) onClose();
          }}
          className="w-full px-4 py-4 text-white hover:bg-white/10 text-left font-gess text-lg rounded-lg border border-white/10"
        >
          {lang === "ar" ? "الكل" : "All"} {currentCategory.title}
        </button>

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

      {/* زر عرض الجميع */}
      <div className="mt-10 px-4">
        <button
          onClick={() => {
            setCategory(selectedCategory!);
            setSubcategory(null);
            router.push("/products");
            if (onClose) onClose();
          }}
          className="w-full py-4 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
        >
          {lang === "ar" ? "عرض كل" : "View All"} {currentCategory.title}
        </button>
      </div>
    </div>
  );
}
