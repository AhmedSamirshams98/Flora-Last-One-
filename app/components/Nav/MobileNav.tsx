"use client";
import React, { useEffect, useState } from "react";
import {
  User2Icon,
  LogOut,
  X,
  User,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import logo from "@/public/images/logo.png";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { NAV_LINKS } from "@/constants/links";
import { MobileNavProps } from "@/types/nav";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { useRouter, usePathname } from "next/navigation";
import { handleNavLinkClick } from "@/lib/navigation";
import MobileNavFilters from "./MobileNavFilters";

const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onUserClick,
  lang,
  toggleLang,
}) => {
  const { data: session, status } = useSession();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "SHOE" | "BAG" | null
  >(null); // 🔥 متغير جديد

  const router = useRouter();
  const pathname = usePathname();

  const t = lang === "ar" ? ar : en;

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

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setShowCategories(false);
        setSelectedCategory(null); // 🔥 إعادة تعيين عند الإغلاق
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    onClose();
  };

  const handleMobileLinkClick = (link: any) => {
    if (link.type === "anchor") {
      handleNavLinkClick(link, pathname, lang, router);
    } else if (link.type === "page") {
      if (link.href === "/" && (pathname === "/" || pathname === "/ar")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push(link.href);
      }
    }
    onClose();
  };

  // 🔥 عند النقر على "أحذية" أو "شنط"
  const handleCategoryClick = (category: "SHOE" | "BAG") => {
    setSelectedCategory(category);
    setShowCategories(true); // 🔥 عرض الأنواع الفرعية مباشرة
  };

  // 🔥 عند الرجوع من الأنواع الفرعية
  const handleBackFromCategories = () => {
    setShowCategories(false);
    setSelectedCategory(null);
  };

  // 🔥 عند اختيار نوع فرعي والذهاب للصفحة
  const handleSubcategorySelected = () => {
    setShowCategories(false);
    setSelectedCategory(null);
    onClose();
  };

  if (!shouldRender) return null;

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
    <div className="fixed inset-0 z-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute top-0 h-full w-full bg-primary/95 backdrop-blur-xl shadow-2xl border border-white/20 flex flex-col transition-transform duration-500 ease-in-out ${
          lang === "ar"
            ? isAnimating
              ? "translate-x-0"
              : "translate-x-full"
            : isAnimating
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        style={lang === "ar" ? { right: 0 } : { left: 0 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-3 py-2 border-b border-white/20">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => {
                if (pathname === "/" || pathname === "/ar") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
                onClose();
              }}
            >
              <Image
                className="w-18"
                sizes="(max-width: 768px) 100vw, 1200px"
                src={logo}
                alt={lang === "ar" ? "فلورا ستور" : "Flora Store"}
              />
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="px-3 py-1 border border-white/30 rounded-md hover:bg-white/10 text-white font-gess text-sm"
              >
                {lang === "ar" ? "الإنجليزيّة" : "العربيّة"}
              </button>

              {showCategories ? (
                <button
                  onClick={handleBackFromCategories} // 🔥 تغيير الدالة
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label={lang === "ar" ? "رجوع" : "Back"}
                >
                  {lang === "ar" ? (
                    <ChevronRight className="w-6 h-6 text-white" />
                  ) : (
                    <ChevronLeft className="w-6 h-6 text-white" />
                  )}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
          </div>

          {status === "authenticated" && !showCategories && (
            <h1 className="font-bold text-center mt-2 text-white font-rubik text-sm">
              {lang === "ar" ? "مرحباً" : "Welcome"}, {session?.user?.name}
            </h1>
          )}
        </div>

        {/* المحتوى القابل للتمرير */}
        <div className="flex-1 overflow-y-auto">
          {showCategories ? (
            // 🔥 تمرير الفئة المحددة إلى MobileNavFilters
            <MobileNavFilters
              lang={lang}
              onClose={onClose}
              selectedCategory={selectedCategory} // 🔥 إضافة هذا الـ prop
              onSubcategorySelected={handleSubcategorySelected} // 🔥 دالة استدعاء
            />
          ) : (
            // القائمة الرئيسية
            <div className="p-2">
              {/* الروابط الرئيسية */}
              <nav className="flex flex-col space-y-3 mt-6">
                {NAV_LINKS.map((link) => {
                  return link.type === "anchor" ? (
                    <button
                      key={link.href}
                      onClick={() => handleMobileLinkClick(link)}
                      style={
                        lang === "ar"
                          ? { textAlign: "right" }
                          : { textAlign: "left" }
                      }
                      className="py-2 px-2 text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-gess text-lg border border-transparent hover:border-white/10 w-full text-right"
                    >
                      {getText(link.labelKey)}
                    </button>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => handleMobileLinkClick(link)}
                      style={
                        lang === "ar"
                          ? { textAlign: "right" }
                          : { textAlign: "left" }
                      }
                      className="py-2 px-2 text-right text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-gess text-lg border border-transparent hover:border-white/10"
                    >
                      {getText(link.labelKey)}
                    </Link>
                  );
                })}
              </nav>

              {/* قسم شنط وأحذية */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="space-y-4">
                  {/* أحذية */}
                  <button
                    onClick={() => handleCategoryClick("SHOE")} // 🔥 تعديل الدالة
                    className="w-full px-4 py-4 flex items-center justify-between text-white hover:bg-white/10 rounded-xl transition-all duration-200 group border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold font-gess text-xl">
                        {lang === "ar" ? "أحذية" : "Shoes"}
                      </span>
                    </div>
                    {lang === "ar" ? (
                      <ChevronLeft className="w-6 h-6 opacity-70 group-hover:opacity-100" />
                    ) : (
                      <ChevronRight className="w-6 h-6 opacity-70 group-hover:opacity-100" />
                    )}
                  </button>

                  {/* شنط */}
                  <button
                    onClick={() => handleCategoryClick("BAG")} // 🔥 تعديل الدالة
                    className="w-full px-4 py-4 flex items-center justify-between text-white hover:bg-white/10 rounded-xl transition-all duration-200 group border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold font-gess text-xl">
                        {lang === "ar" ? "شنط" : "Bags"}
                      </span>
                    </div>
                    {lang === "ar" ? (
                      <ChevronLeft className="w-6 h-6 opacity-70 group-hover:opacity-100" />
                    ) : (
                      <ChevronRight className="w-6 h-6 opacity-70 group-hover:opacity-100" />
                    )}
                  </button>
                </div>

                {/* زر عرض جميع المنتجات */}
              </div>

              {/* قسم المستخدم */}
              <div className="mt-8 pt-6 border-t border-white/20">
                {status === "authenticated" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      {session?.user?.image ? (
                        <Image
                          sizes="(max-width: 768px) 100vw, 1200px"
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={44}
                          height={44}
                          className="rounded-full border border-white/20"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                          <User2Icon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div
                        className="flex-1"
                        style={
                          lang === "ar"
                            ? { textAlign: "right" }
                            : { textAlign: "left" }
                        }
                      >
                        <p className="font-medium text-white">
                          {session?.user?.name}
                        </p>
                        <p className="text-sm text-white/70">
                          {session?.user?.email}
                        </p>
                        {session?.user?.role && (
                          <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs text-white/90 font-gess font-medium bg-white/10">
                            {getRoleText(session.user.role)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 font-gess">
                      {(session?.user?.role === "ADMIN" ||
                        session?.user?.role === "SUPERADMIN") && (
                        <Link
                          href="/dashboard"
                          className="w-full py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-3"
                          onClick={onClose}
                          style={
                            lang === "ar"
                              ? { flexDirection: "row" }
                              : { flexDirection: "row-reverse" }
                          }
                        >
                          <Settings className="w-5 h-5" />
                          <span
                            className="flex-1"
                            style={
                              lang === "ar"
                                ? { textAlign: "right" }
                                : { textAlign: "left" }
                            }
                          >
                            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
                          </span>
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full py-3 px-4 text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 flex items-center gap-3 border border-transparent hover:border-red-400/30"
                        style={
                          lang === "ar"
                            ? { flexDirection: "row" }
                            : { flexDirection: "row-reverse" }
                        }
                      >
                        <LogOut className="w-5 h-5" />
                        <span
                          className="flex-1"
                          style={
                            lang === "ar"
                              ? { textAlign: "right" }
                              : { textAlign: "left" }
                          }
                        >
                          {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onUserClick}
                    className="w-full py-4 px-4 text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-gess text-lg flex items-center gap-3 border border-transparent hover:border-white/20"
                    style={
                      lang === "ar"
                        ? { flexDirection: "row" }
                        : { flexDirection: "row-reverse" }
                    }
                  >
                    <User2Icon className="w-5 h-5" />
                    <span
                      className="flex-1"
                      style={
                        lang === "ar"
                          ? { textAlign: "right" }
                          : { textAlign: "left" }
                      }
                    >
                      {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
