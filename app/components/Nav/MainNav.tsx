"use client";
import React, { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import DesktopNav from "./Desktopnav/DesktopNav";
import MobileNav from "./MobileNav/MobileNav";
import AuthPopup from "../AuthPopup";
import { usePathname, useRouter } from "next/navigation";

const MainNav = () => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };
  const lang = pathname.startsWith("/ar") ? "ar" : "en";

  const toggleLang = () => {
    const newLang = lang === "ar" ? "en" : "ar";

    document.cookie = `lang=${newLang}; path=/; max-age=31536000`;

    const newPath = pathname.replace(/^\/(ar|en)/, `/${newLang}`);
    router.push(newPath);
  };

  return (
    <div style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>

      <DesktopNav
        totalItems={totalItems}
        onUserClick={() => setShowAuthPopup(true)}
        onMenuToggle={toggleMobileMenu}
        showAuthPopup={showAuthPopup}
        lang={lang}
        toggleLang={toggleLang}
      />
      <MobileNav
      
      
        lang={lang}
        toggleLang={toggleLang}
        totalItems={totalItems}
        isOpen={showMobileMenu}
        onClose={closeMobileMenu}
        onUserClick={() => setShowAuthPopup(true)}
        showAuthPopup={showAuthPopup}
      />
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        lang={lang}
      />
    </div>
  );
};

export default MainNav;
