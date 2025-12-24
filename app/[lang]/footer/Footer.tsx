"use client";

import logo from "@/public/images/logo.png";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { NAV_LINKS } from "@/constants/links";
import SocialFooter from "./SocialFooter";

import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { handleNavLinkClick } from "@/lib/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

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

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <footer
      id="contact"
      className="bg-primary text-primary-foreground mt-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 py-8">
        <div
          className={`grid ${
            isDashboard
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 lg:grid-cols-2"
          } items-center place-items-center gap-8 font-gess`}
        >
          {/* BRAND */}
          <div className="flex flex-col items-center lg:items-start">
            <Image
              sizes="(max-width: 768px) 100vw, 1200px"
              src={logo}
              quality={75}
              alt="Flora فلورا "
              className="w-[30vw] md:w-[14vw]"
            />
            <p className="text-primary-foreground/80 mt-4 text-center lg:text-start font-medium">
              {lang === "ar" ? (
                <span>
                  مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب
                  الفاخرة
                  <br />
                  ارتق بأناقتك مع فلورا
                </span>
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: `Welcome To Flora Egypt, Your premium destination for luxurious shoes and bags <br/> Elevate Your Elegance With Flora`,
                  }}
                />
              )}
            </p>

            <div className="mt-4 lg:block">
              <SocialFooter />
            </div>
          </div>

          <div>
            <ul className="space-y-2 text-center underline text-primary-foreground/80 flex flex-row gap-3">
              {NAV_LINKS.map((link) => {
                const isAnchor = link.type === "anchor";

                return (
                  <li key={link.href}>
                    {isAnchor ? (
                      <button
                        onClick={() =>
                          handleNavLinkClick(link, pathname, lang, router)
                        }
                        className="hover:text-accent underline bg-transparent border-0 cursor-pointer"
                      >
                        {getText(link.labelKey)}
                      </button>
                    ) : (
                      <Link
                        href={`/${lang}${link.href}`}
                        className="hover:text-accent underline"
                      >
                        {getText(link.labelKey)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

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
            className={`flex items-center justify-center gap-2 mt-3 hover:text-accent  underline font-medium ${
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
