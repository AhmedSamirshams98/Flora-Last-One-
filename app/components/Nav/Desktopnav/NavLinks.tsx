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

  return (
    <div
      className="hidden lg:flex justify-center font-gess gap-10 mr-[6vw] "
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href;

        return link.type === "anchor" ? (
          <button
            key={link.href}
            onClick={(e) => handleNavLinkClick(link, pathname, lang, router)}
            className={
              isActive ? "text-accent cursor-pointer" : "cursor-pointer"
            }
          >
            {getText(link.labelKey)}
          </button>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive ? "text-accent cursor-pointer" : "cursor-pointer"
            }
          >
            {getText(link.labelKey)}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
