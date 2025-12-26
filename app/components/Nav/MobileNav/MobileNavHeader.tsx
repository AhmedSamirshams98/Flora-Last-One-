"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import logo from "@/public/images/logo.png";

interface MobileNavHeaderProps {
  lang: "ar" | "en";
  toggleLang: (lang: "ar" | "en") => void;
  showCategories: boolean;
  onBack: () => void;
  onClose: () => void;
}

const MobileNavHeader = ({
  lang,
  toggleLang,
  showCategories,
  onBack,
  onClose,
}: MobileNavHeaderProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="px-3 py-2 border-b  border-white/20">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}`} aria-label="Flora Store homepage">
          <Image
            src={logo}
            alt={lang === "ar" ? "فلورا ستور" : "Flora Store"}
            className="w-18"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 text-white">
          {/* Language Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 font-gess text-md"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Change language"
            >
              {lang === "ar" ? "العربيّة" : "English"}
              <ChevronDown className="w-4 h-4" />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-32 bg-primary border border-white/20 rounded-lg shadow-lg overflow-hidden z-50"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    toggleLang("ar");
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-right hover:bg-white/10 font-gess text-sm ${
                    lang === "ar" ? "bg-white/10" : ""
                  }`}
                >
                  العربيّة
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    toggleLang("en");
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-white/10 font-gess text-sm ${
                    lang === "en" ? "bg-white/10" : ""
                  }`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          {/* Back / Close */}
          {showCategories ? (
            <button
              onClick={onBack}
              aria-label={lang === "ar" ? "رجوع" : "Back"}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              {lang === "ar" ? <ChevronRight /> : <ChevronLeft />}
            </button>
          ) : (
            <button
              onClick={onClose}
              aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <X />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileNavHeader;
