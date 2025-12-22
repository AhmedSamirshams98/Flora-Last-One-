"use client";

import { useState } from "react";

import MobileNavFilters from "./MobileNavFilters";
import MobileNavHeader from "./MobileNavHeader";
import MobileNavLinks from "./MobileNavLinks";
import MobileNavCategories from "./MobileNavCategories";
import MobileNavUser from "./MobileNavUser";
export type ProductCategory = "SHOE" | "BAG";

const MobileNavContainer = ({
  isAnimating,
  lang,
  onClose,
  onUserClick,
  toggleLang,
}: any) => {
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "SHOE" | "BAG" | null
  >(null);

  return (
    <div
      className={`absolute top-0 h-full w-full bg-primary/95 backdrop-blur-xl shadow-2xl border border-white/20 flex flex-col transition-transform duration-500 ease-in-out ${
        lang === "ar"
          ? isAnimating
            ? "translate-x-0"
            : "-translate-x-full"
          : isAnimating
          ? "translate-x-0"
          : "translate-x-full"
      }`}
      style={lang === "ar" ? { right: 0 } : { left: 0 }}
    >
      <MobileNavHeader
        lang={lang}
        toggleLang={toggleLang}
        showCategories={showCategories}
        onBack={() => {
          setShowCategories(false);
          setSelectedCategory(null);
        }}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        {showCategories ? (
          <MobileNavFilters
            lang={lang}
            selectedCategory={selectedCategory}
            onSubcategorySelected={onClose}
            onClose={onClose}
          />
        ) : (
          <>
            <MobileNavLinks lang={lang} onClose={onClose} />
            <MobileNavCategories
              lang={lang}
              onSelect={(cat: ProductCategory) => {
                setSelectedCategory(cat);
                setShowCategories(true);
              }}
            />
            <MobileNavUser
              lang={lang}
              onUserClick={onUserClick}
              onClose={onClose}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavContainer;
