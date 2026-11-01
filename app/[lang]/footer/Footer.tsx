"use client";

/* Footer (after the UFA Distro footer and the "Modern Footer" SaaS shot):
   quiet columns with small muted headings over a huge faded brand word, and a thin
   bottom bar. Only facts the owner confirmed. */

import logo from "@/public/images/logo.png";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Check, Mail, MapPin, Phone } from "lucide-react";

import { NAV_LINKS } from "@/constants/links";
import { TRUST_ITEMS } from "@/app/components/HomeComponents/trustItems";
import { productTranslations } from "@/lib/translations/products";
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
    "bg-transparent border-0 p-0 cursor-pointer text-center text-primary-foreground/80 transition-colors hover:text-gold focus-visible:outline-[#fff7ee]";
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
        {/* three columns of the same height; each one spreads its content top to bottom */}
        <div className="fl-fcols pb-20 text-center md:pb-36 md:text-start">
          <div className="fl-fcol">
            <div>
              <Image
                sizes="(max-width: 768px) 60vw, 240px"
                src={logo}
                quality={75}
                alt="Flora فلورا "
                className="mx-auto w-40 md:mx-0 md:w-48"
              />
              <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-primary-foreground/75 md:mx-0">
                {isAr
                  ? "مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب الفاخرة."
                  : "Welcome to Flora Egypt, your premier destination for luxurious shoes and bags."}
              </p>
            </div>
            <ul className="fl-fchecks">
              {TRUST_ITEMS.map((item) => (
                <li key={item.en}>
                  <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  {isAr ? item.ar : item.en}
                </li>
              ))}
            </ul>
          </div>

          <nav className="fl-fcol fl-fcol-center" style={{ alignItems: "center", textAlign: "center" }} aria-label={isAr ? "روابط الموقع" : "Site links"}>
            <div>
              <p className={heading} style={{ textAlign: "center" }}>{isAr ? "روابط سريعة" : "Quick Links"}</p>
              <ul className="flex flex-col items-center gap-3.5 text-base md:items-start" style={{ alignItems: "center" }}>
                {NAV_LINKS.filter((link) => !(link.type === "anchor" && link.anchorId === "contact")).map((link) => (
                  <li key={link.href}>
                    {link.type === "anchor" ? (
                      <button onClick={() => handleNavLinkClick(link, pathname, lang, router)} className={linkClass}>
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
            </div>
            <div>
              <p className={heading} style={{ textAlign: "center" }}>{isAr ? "تسوق حسب القسم" : "Shop by category"}</p>
              <ul className="flex flex-col items-center gap-3.5 text-base md:items-start" style={{ alignItems: "center" }}>
                {(["SHOE", "BAG"] as const).map((c) => (
                  <li key={c}>
                    <Link href={`/${lang}/products?category=${c}`} className={linkClass}>
                      {productTranslations.category[c][lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="fl-fcol">
            <p className={`${heading} !mb-0`}>{isAr ? "تواصل معنا" : "Contact Us"}</p>
            <ul className="fl-fcontact">
              <li>
                <span className="fl-ficon"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("شارع الخليفة المأمون بجوار فرع ڤودافون وبنك وفا التجاري")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isAr ? "عرض العنوان على الخريطة" : "Show the address on the map"}
                  className="fl-faddr fl-faddrlink"
                >
                  {isAr ? "شارع الخليفة المأمون بجوار فرع ڤودافون وبنك وفا التجاري" : "Al-Khalifa Al-Maamoun Street next to Vodafone Branch & Wafa Bank"}
                </a>
              </li>
              <li>
                <span className="fl-ficon"><Phone className="h-4 w-4" aria-hidden="true" /></span>
                <div className="fl-fphones">
                  {["01090770881", "01090770883"].map((p) => (
                    <a key={p} href={`tel:+2${p}`} dir="ltr" aria-label={`${isAr ? "اتصل" : "Call"} ${p}`} className="fl-fphone">
                      {p}
                    </a>
                  ))}
                </div>
              </li>
              <li>
                <span className="fl-ficon"><Mail className="h-4 w-4" aria-hidden="true" /></span>
                <a href="mailto:flora.leather.product@gmail.com" dir="ltr" className="fl-fphone fl-femail">
                  flora.leather.product@gmail.com
                </a>
              </li>
              <li className="fl-fsocial">
                <SocialFooter />
              </li>
            </ul>
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
        <div className="fl-footer-bar container mx-auto flex flex-col gap-3 px-4 py-6 text-center text-sm text-primary-foreground/80 md:flex-row md:items-center md:justify-between md:text-start">
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
