"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "@/constants/links";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { useMemo, useCallback } from "react";
import { handleNavLinkClick } from "@/lib/navigation";

const NavLinks = ({ lang }: { lang: "ar" | "en" }) => {
  const pathname = usePathname();
  const router = useRouter();

  const t = useMemo(() => (lang === "ar" ? ar : en), [lang]);

  const getText = useCallback(
    (key: string) => {
      return key.split(".").reduce((obj: any, k) => obj?.[k], t) ?? key;
    },
    [t]
  );

  const pill =
    "cursor-pointer whitespace-nowrap rounded-full px-5 py-2 transition-colors focus-visible:outline-[#fff7ee]";

  return (
    <div
      className={`hidden items-center gap-1 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 p-1 text-[0.95rem] tracking-wide xl:flex ${
        lang === "ar" ? "font-gess" : ""
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {NAV_LINKS.map((link) => {
        const isActive =
          (pathname.replace(/^\/(ar|en)/, "") || "/") === link.href;
        const tone = isActive
          ? "bg-gold text-[#2a1608]"
          : "text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground";

        return link.type === "anchor" ? (
          <button
            key={link.href}
            onClick={() => handleNavLinkClick(link, pathname, lang, router)}
            aria-current={isActive ? "page" : undefined}
            className={`${pill} ${tone}`}
          >
            {getText(link.labelKey)}
          </button>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`${pill} ${tone}`}
          >
            {getText(link.labelKey)}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
