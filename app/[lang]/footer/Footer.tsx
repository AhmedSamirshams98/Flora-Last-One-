"use client";

/* Footer (after the UFA Distro footer and the "Modern Footer" SaaS shot):
   quiet columns with small muted headings over a huge faded brand word, and a thin
   bottom bar. Only facts the owner confirmed. */

import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/public/images/logo.png";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { NAV_LINKS } from "@/constants/links";
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

  return (
    <footer
      id="contact"
      className={`relative border-t border-gold/25 bg-[linear-gradient(180deg,var(--primary)_0%,#34200f_100%)] text-primary-foreground ${
        isAr ? "font-gess" : ""
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="fl-ft-grid">
          <div className="fl-ft-brand">
            <Image
              sizes="(max-width: 768px) 50vw, 200px"
              src={logo}
              quality={75}
              alt="Flora فلورا"
              className="w-36 md:w-44"
            />
            <p className="mt-5 max-w-xs text-[0.98rem] leading-8 text-primary-foreground/75">
              {isAr
                ? "مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب الفاخرة."
                : "Welcome to Flora Egypt, your premier destination for luxurious shoes and bags."}
            </p>
            <div className="fl-ft-social">
              <SocialFooter />
            </div>
          </div>

          <nav aria-label={isAr ? "روابط الموقع" : "Site links"}>
            <h2 className="fl-ft-title">{isAr ? "روابط سريعة" : "Quick Links"}</h2>
            <ul className="fl-ft-list">
              {NAV_LINKS.filter((link) => !(link.type === "anchor" && link.anchorId === "contact")).map((link) => (
                <li key={link.href}>
                  {link.type === "anchor" ? (
                    <button onClick={() => handleNavLinkClick(link, pathname, lang, router)}>
                      {getText(link.labelKey)}
                    </button>
                  ) : (
                    <Link href={`/${lang}${link.href}`}>{getText(link.labelKey)}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={isAr ? "تسوق حسب القسم" : "Shop by category"}>
            <h2 className="fl-ft-title">{isAr ? "تسوق" : "Shop"}</h2>
            <ul className="fl-ft-list">
              {(["SHOE", "BAG"] as const).map((c) => (
                <li key={c}>
                  <Link href={`/${lang}/products?category=${c}`}>{productTranslations.category[c][lang]}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="fl-ft-contact">
            <h2 className="fl-ft-title">{isAr ? "تواصل معنا" : "Contact Us"}</h2>
            <ul className="fl-ft-list">
              <li className="fl-ft-row">
                <MapPin aria-hidden="true" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("شارع الخليفة المأمون بجوار فرع ڤودافون وبنك وفا التجاري")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isAr ? "عرض العنوان على الخريطة" : "Show the address on the map"}
                >
                  {isAr ? "شارع الخليفة المأمون بجوار فرع ڤودافون وبنك وفا التجاري" : "Al-Khalifa Al-Maamoun Street next to Vodafone Branch & Wafa Bank"}
                </a>
              </li>
              {["01090770881", "01090770883"].map((p) => (
                <li key={p} className="fl-ft-row">
                  <Phone aria-hidden="true" />
                  <a href={`tel:+2${p}`} dir="ltr" aria-label={`${isAr ? "اتصل" : "Call"} ${p}`}>
                    {p}
                  </a>
                </li>
              ))}
              <li className="fl-ft-row">
                <Mail aria-hidden="true" />
                <a href="mailto:flora.leather.product@gmail.com" dir="ltr" style={{ overflowWrap: "anywhere" }}>
                  flora.leather.product@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="fl-ft-rule" />
        <div className="fl-ft-bar">
          <p>{isAr ? "© 2026 فلورا. جميع الحقوق محفوظة." : "© 2026 Flora. All Rights Reserved."}</p>
          <a href="https://wa.me/201040151413" target="_blank" rel="noopener noreferrer" className="transition-colors">
            {isAr ? "تصميم وبرمجة د. أحمد شمس" : "Designed & Developed by Dr. Ahmed Shams"}
          </a>
        </div>
      </div>
    </footer>
  );
}
