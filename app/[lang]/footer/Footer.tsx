"use client";

/* Footer (after the UFA Distro footer and the "Modern Footer" SaaS shot):
   quiet columns with small muted headings over a huge faded brand word, and a thin
   bottom bar. Only facts the owner confirmed. */

import logo from "@/public/images/logo.png";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { NAV_LINKS } from "@/constants/links";
import { TRUST_ITEMS } from "@/app/components/HomeComponents/trustItems";
import SocialFooter from "./SocialFooter";

import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { handleNavLinkClick } from "@/lib/navigation";
import Link from "next/link";
import "@/app/components/HomeComponents/home.css";

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";
  const isAr = lang === "ar";

  const t = isAr ? ar : en;

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

  const linkClass =
    "bg-transparent border-0 p-0 cursor-pointer text-start text-primary-foreground/80 transition-colors hover:text-gold focus-visible:outline-[#fff7ee]";
  const heading =
    "mb-5 text-xs uppercase tracking-[0.18em] text-primary-foreground/55";

  return (
    <footer
      id="contact"
      className={`relative isolate overflow-hidden border-t border-gold/25 bg-[linear-gradient(180deg,var(--primary)_0%,#34200f_100%)] text-primary-foreground ${
        isAr ? "font-gess" : ""
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="relative">
      <div className="container relative mx-auto px-4 pt-14 md:pt-20">
        {/* columns */}
        <div className="grid gap-12 pb-20 md:grid-cols-[1.4fr_1fr_1fr] md:gap-16 md:pb-36">
          <div>
            <Image
              sizes="(max-width: 768px) 60vw, 240px"
              src={logo}
              quality={75}
              alt="Flora فلورا "
              className="w-40 md:w-48"
            />
            <p className="mt-6 max-w-sm text-base leading-relaxed text-primary-foreground/75">
              {isAr
                ? "مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب الفاخرة."
                : "Welcome to Flora Egypt, your premium destination for luxurious shoes and bags."}
            </p>
            <div className="mt-7">
              <SocialFooter />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
          <nav aria-label={isAr ? "روابط الموقع" : "Site links"}>
            <p className={heading}>{isAr ? "تصفّحي" : "Browse"}</p>
            <ul className="flex flex-col items-start gap-3.5 text-base">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.type === "anchor" ? (
                    <button
                      onClick={() => handleNavLinkClick(link, pathname, lang, router)}
                      className={linkClass}
                    >
                      {getText(link.labelKey)}
                    </button>
                  ) : (
                    <Link href={`/${lang}${link.href}`} className={linkClass}>
                      {getText(link.labelKey)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={heading}>{isAr ? "خدمتنا" : "Our service"}</p>
            <ul className="flex flex-col gap-3.5 text-base text-primary-foreground/80">
              {TRUST_ITEMS.map((item) => (
                <li key={item.en}>{isAr ? item.ar : item.en}</li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      </div>

      {/* the brand word: a huge, faint backdrop behind the columns, cut by the bottom bar */}
      <p
        aria-hidden="true"
        lang="en"
        dir="ltr"
        className="fl-display pointer-events-none absolute inset-x-0 bottom-0 -z-10 select-none text-center text-[min(27vw,22rem)] leading-[0.82] text-gold/[0.09]"
      >
        FLORA
      </p>
      </div>

      <div className="relative border-t border-primary-foreground/15 bg-[#2b1a0c]/60 backdrop-blur-[2px]">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-primary-foreground/80 md:flex-row md:items-center md:justify-between">
          <p>
            {isAr
              ? "© 2026 فلورا. جميع الحقوق محفوظة."
              : "© 2026 Flora. All Rights Reserved."}
          </p>
          <a
            href="https://wa.me/201040151413"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gold"
          >
            {isAr
              ? "تصميم وبرمجة د. أحمد شمس"
              : "Designed & Developed by Dr. Ahmed Shams"}
          </a>
        </div>
      </div>
    </footer>
  );
}
