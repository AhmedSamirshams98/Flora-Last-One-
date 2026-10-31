"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import logo from "@/public/images/logo.png";

interface MobileNavHeaderProps {
  lang: "ar" | "en";
  toggleLang: (lang: "ar" | "en") => void;
  showCategories: boolean;
  onBack: () => void;
  onClose: () => void;
}

const round =
  "grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/20 transition-colors hover:bg-primary-foreground/10 focus-visible:outline-[#fff7ee]";

const MobileNavHeader = ({
  lang,
  toggleLang,
  showCategories,
  onBack,
  onClose,
}: MobileNavHeaderProps) => {
  const isAr = lang === "ar";
  return (
    <header className="flex items-center justify-between gap-3 border-b border-primary-foreground/15 px-5 py-4">
      <Link href={`/${lang}`} onClick={onClose} aria-label="Flora Store homepage">
        <Image
          src={logo}
          alt={isAr ? "فلورا ستور" : "Flora Store"}
          className="h-9 w-auto"
          priority
        />
      </Link>

      <div className="flex items-center gap-2 text-primary-foreground">
        {/* language: two pills; picking the language you are already on does nothing */}
        <div
          role="group"
          aria-label={isAr ? "اللغة" : "Language"}
          className="flex rounded-full border border-primary-foreground/20 p-0.5 text-sm font-gess"
        >
          {(["ar", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => l !== lang && toggleLang(l)}
              aria-pressed={l === lang}
              className={`h-10 min-w-11 rounded-full px-3 transition-colors focus-visible:outline-[#fff7ee] ${
                l === lang
                  ? "bg-gold text-[#2a1608]"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10"
              }`}
            >
              {l === "ar" ? "ع" : "EN"}
            </button>
          ))}
        </div>

        {showCategories ? (
          <button
            onClick={onBack}
            aria-label={isAr ? "رجوع" : "Back"}
            className={round}
          >
            {isAr ? <ChevronRight /> : <ChevronLeft />}
          </button>
        ) : (
          <button
            onClick={onClose}
            aria-label={isAr ? "إغلاق القائمة" : "Close menu"}
            className={round}
          >
            <X />
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileNavHeader;
