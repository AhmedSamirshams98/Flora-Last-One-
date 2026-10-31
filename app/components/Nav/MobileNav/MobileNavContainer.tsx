"use client";

import { useState } from "react";

import MobileNavFilters from "./MobileNavFilters";
import MobileNavHeader from "./MobileNavHeader";
import MobileNavLinks from "./MobileNavLinks";
import MobileNavCategories from "./MobileNavCategories";
import MobileNavUser from "./MobileNavUser";
import SocialFooter from "@/app/[lang]/footer/SocialFooter";
import "@/app/components/HomeComponents/home.css";
export type ProductCategory = "SHOE" | "BAG";

/* The side panel: it hangs from the reading-start edge, 88% wide, so the dimmed page
   still shows beside it. Same cocoa gradient and gold glow as the hero. */
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
      className={`fl-menu absolute top-0 flex h-full w-[88%] max-w-sm flex-col rounded-e-[2rem] border-e border-gold/25 shadow-2xl transition-transform duration-500 ease-in-out ${
        isAnimating
          ? "translate-x-0"
          : lang === "ar"
          ? "translate-x-full"
          : "-translate-x-full"
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

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
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
            <div className="mt-auto">
              <MobileNavUser
                lang={lang}
                onUserClick={onUserClick}
                onClose={onClose}
              />
              <div className="border-t border-primary-foreground/15 px-6 py-4 text-primary-foreground/85">
                <SocialFooter />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavContainer;
