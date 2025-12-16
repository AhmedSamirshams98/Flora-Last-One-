"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  User2Icon,
  LogOut,
  User,
  Settings,
  Menu,
} from "lucide-react";
import logo from "@/public/images/logo.png";
import Link from "next/link";
import Image from "next/image";
import { DASHBOARD_LINKS, NAV_LINKS } from "@/constants/links";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import AuthPopup from "../AuthPopup";
import { DesktopNavProps } from "@/types/nav";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

const DesktopNav: React.FC<DesktopNavProps> = ({
  totalItems,
  onMenuToggle,
  toggleLang,
  lang,
}) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // اختيار القاموس بناءً على اللغة
  const t = lang === "ar" ? ar : en;

  // دالة بسيطة للحصول على النص من key
  const getText = (key: string): string => {
    const keys = key.split(".");
    let result: unknown = t;

    for (const k of keys) {
      if (
        result &&
        typeof result === "object" &&
        k in (result as Record<string, unknown>)
      ) {
        result = (result as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }
    }

    return typeof result === "string" ? result : key;
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    if (status === "authenticated") {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowAuthPopup(true);
    }
  };

  // ترجمة الأدوار
  const getRoleText = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return lang === "ar" ? "سوبر أدمن" : "Super Admin";
      case "ADMIN":
        return lang === "ar" ? "أدمن" : "Admin";
      default:
        return lang === "ar" ? "مستخدم" : "User";
    }
  };

  return (
    <>
      <nav className="bg-primary/85 backdrop-blur-2xl text-primary-foreground z-40">
        <div className="container mx-auto px-3 py-3 ">
          {/* UPPER NAV */}
          <div className="grid grid-cols-2 lg:grid-cols-3 items-center ">
            {/* Logo */}
            <div className="flex items-center justify-start">
              <Link
                href="/"
                className="hover:opacity-80 transition-opacity"
                aria-label={
                  lang === "ar"
                    ? "الصفحة الرئيسية لفلورا ستور  فلورا ستور كفر الشيخ فلورا للشنط والاحذيه شنط واحذيه نسائيه كفر الشيخ "
                    : "Flora Store Homepage flora store kafrelshiekh flora store for woman shoes and bags "
                }
              >
                <Image
                  className="w-18"
                  src={logo}
                  alt={
                    lang === "ar"
                      ? "الصفحة الرئيسية لفلورا ستور  فلورا ستور كفر الشيخ فلورا للشنط والاحذيه شنط واحذيه نسائيه كفر الشيخ "
                      : "Flora Store Homepage flora store kafrelshiekh flora store for woman shoes and bags "
                  }
                  priority
                />
              </Link>
            </div>
            <div
              className="hidden lg:flex items-center justify-center gap-10 h-14 mt-2"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {isDashboard
                ? DASHBOARD_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`hover:text-accent font-gess text-lg transition-all duration-300 ${
                          isActive
                            ? "text-accent border-b-2 border-accent"
                            : "text-primary-foreground"
                        }`}
                      >
                        {/* استخدام دالة getText للترجمة */}
                        {getText(link.labelKey)}
                      </Link>
                    );
                  })
                : NAV_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`hover:text-accent font-gess text-lg transition-all duration-300 ${
                          isActive
                            ? "text-accent border-b-2 border-accent"
                            : "text-primary-foreground"
                        }`}
                      >
                        {/* استخدام دالة getText للترجمة */}
                        {getText(link.labelKey)}
                      </Link>
                    );
                  })}
            </div>

            {/* Cart + User + Menu */}
            <div className="flex items-center justify-end gap-4">
              {status === "authenticated" && (
                <h1 className="font-bold text-white text-center text-xs hidden lg:block font-rubik">
                  {lang === "ar" ? "مرحباً" : "Welcome"} <br />{" "}
                  {session?.user?.name}
                </h1>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative hover:text-accent">
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleLang}
                className="px-3 py-1 hidden md:block border border-white/30 rounded-md hover:bg-white/10 text-white font-gess"
              >
                {lang === "ar" ? "الإنجليزيّة" : "العربيّة"}
              </button>

              {/* User Menu */}
              <div className="relative hidden md:block" ref={userMenuRef}>
                <div
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 cursor-pointer hover:text-accent relative"
                >
                  {status === "authenticated" && session?.user?.image ? (
                    <Image
                      src={session?.user.image}
                      alt={
                        lang === "ar"
                          ? "صورة المستخدم flora store user فلورا للاحذيه صورة المستخدم "
                          : "User image flora store user image flora for woman shoes and bags "
                      }
                      width={36}
                      height={36}
                      className="rounded-full border border-white/20"
                    />
                  ) : (
                    <User2Icon className="w-6 h-6" />
                  )}
                </div>

                {/* قائمة المستخدم */}
                {showUserMenu && status === "authenticated" && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-primary/70 text-sm">
                        {session?.user?.name}
                      </p>
                      <p className="text-primary/70 text-xs mt-1 font-gess">
                        {session?.user?.email}
                      </p>
                      {session?.user?.role && (
                        <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs text-primary/70 font-gess font-medium ">
                          {getRoleText(session.user.role)}
                        </span>
                      )}
                    </div>

                    <div className="p-2 font-gess">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-6 h-6" />
                        <span>
                          {lang === "ar" ? "الملف الشخصي" : "Profile"}
                        </span>
                      </Link>

                      {(session?.user?.role === "ADMIN" ||
                        session?.user?.role === "SUPERADMIN") && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-md transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>
                            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
                          </span>
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-2 border-t border-gray-100 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>
                          {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="lg:hidden p-1 hover:bg-white/10 rounded-lg"
                onClick={onMenuToggle}
                aria-label={lang === "ar" ? "فتح القائمة" : "Open menu"}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AuthPopup
        lang={lang}
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
      />
    </>
  );
};

export default DesktopNav;
