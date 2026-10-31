"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/constants/links";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { handleNavLinkClick } from "@/lib/navigation";

const MobileNavLinks = ({ lang, onClose }: any) => {
  const pathname = usePathname();
  const router = useRouter();

  const t = useMemo(() => (lang === "ar" ? ar : en), [lang]);

  const getText = useCallback(
    (key: string) => key.split(".").reduce((obj: any, k) => obj?.[k], t) ?? key,
    [t]
  );

  const row =
    "fl-display flex w-full items-center justify-between gap-3 border-b border-primary-foreground/12 px-1 py-4 text-start text-[1.7rem] leading-tight transition-colors focus-visible:outline-[#fff7ee]";

  return (
    <nav aria-label="Main navigation" className="px-5 pt-3">
      {NAV_LINKS.map((link) => {
        const isActive =
          (pathname.replace(/^\/(ar|en)/, "") || "/") === link.href;
        const tone = isActive
          ? "text-gold"
          : "text-primary-foreground hover:text-gold";
        const mark = isActive ? (
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rotate-45 bg-gold" />
        ) : null;

        return link.type === "anchor" ? (
          <button
            key={link.href}
            lang={lang}
            onClick={() => {
              handleNavLinkClick(link, pathname, lang, router);
              onClose();
            }}
            className={`${row} ${tone}`}
          >
            {getText(link.labelKey)}
            {mark}
          </button>
        ) : (
          <Link
            key={link.href}
            lang={lang}
            href={`/${lang}${link.href === "/" ? "" : link.href}`}
            onClick={onClose}
            aria-current={isActive ? "page" : undefined}
            className={`${row} ${tone}`}
          >
            {getText(link.labelKey)}
            {mark}
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNavLinks;
