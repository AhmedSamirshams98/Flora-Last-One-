"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/public/images/logo.png";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "@/constants/links";
import SocialFooter from "./SocialFooter";

// Import translations
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

export default function Footer() {
  const pathname = usePathname();

  // نفس طريقة MainNav
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  // Choose dictionary
  const t = lang === "ar" ? ar : en;

  // Translation function
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

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <footer
      id="contact"
      className="bg-primary text-primary-foreground mt-6"
      dir={lang === "ar" ? "rtl" : "ltr"} // 👈 هذا يجعل الاتجاه حسب اللغة فقط داخل الفوتر
    >
      <div className="container mx-auto px-4 py-8">
        <div
          className={`grid ${
            isDashboard
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 lg:grid-cols-3"
          } items-center place-items-center gap-8 font-gess`}
        >
          {/* BRAND */}
          <div className="flex flex-col items-center lg:items-start">
            <Image
              sizes="(max-width: 768px) 100vw, 1200px"
              src={logo}
              quality={75}
              alt="Flora Logo"
              className="w-[30vw] md:w-[14vw]"
            />

            <p className="text-primary-foreground/80 mt-4 text-center lg:text-start font-bold ">
              {lang === "ar"
                ? "وجهتك المتميزة للحصول على الأحذية والحقائب الفاخرة"
                : "Your premium destination for luxurious shoes and bags."}
            </p>

            <div className="mt-4 lg:block">
              <SocialFooter />
            </div>
          </div>

          {/* CONTACT */}
          <div className={isDashboard ? "lg:col-span-2" : ""}>
            <ul className="space-y-4 text-right">
              <li className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-5 h-5 mt-1" />
                <span
                  className={`${
                    lang === "ar"
                      ? "text-right font-bold "
                      : "text-left font-bold "
                  }`}
                >
                  {lang === "ar"
                    ? "كفر الشيخ شارع الخليفة المأمون بجوار فرع ڤودافون وبنك وفا التجاري"
                    : "Kafr El Sheikh, Al-Khalifa Al-Maamoun Street next to Vodafone Branch & Wafa Bank"}
                </span>
              </li>

              <li className="flex items-center gap-3 font-bold  text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+201090770881"
                  className={`${
                    lang === "ar" ? "font-gess" : "font-sans"
                  } hover:text-accent`}
                >
                  01090770881
                </a>
                <Phone className="w-4 h-4" />
                <a
                  href="tel:+201090770883"
                  className={`${
                    lang === "ar" ? "font-gess" : "font-sans"
                  } hover:text-accent`}
                >
                  01090770883
                </a>
              </li>

              <li>
                <a
                  href="mailto:flora.leather.product@gmail.com"
                  className="flex items-center gap-2 hover:text-accent font-sans  text-primary-foreground/80 font-bold "
                >
                  <Mail className="w-4 h-4" />
                  flora.leather.product@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* NAVIGATION (TRANSLATED) */}
          {!isDashboard && (
            <div>
              <ul className="space-y-2 text-center underline flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={`/${lang}${link.href}`}
                      className="hover:text-accent"
                    >
                      {getText(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* BOTTOM */}
        <div
          className={` ${
            lang === "ar" ? "font-gess" : "font-sans"
          } border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80`}
        >
          <p>
            {lang === "ar"
              ? "© 2026 فلورا. جميع الحقوق محفوظة."
              : "© 2026 Flora. All Rights Reserved."}
          </p>

          <a
            href="https://wa.me/201040151413"
            target="_blank"
            className={`flex items-center justify-center gap-2 mt-3 hover:text-accent  underline font-bold ${
              lang === "ar" ? "font-gess text-md" : "font-sans text-xs"
            }`}
          >
            {lang === "ar"
              ? "تصميم وبرمجة د. أحمد شمس"
              : "Designed & Developed by Dr. Ahmed Shams"}
          </a>
        </div>
      </div>
    </footer>
  );
}
