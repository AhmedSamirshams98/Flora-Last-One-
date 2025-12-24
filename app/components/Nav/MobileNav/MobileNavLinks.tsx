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
    (key: string) =>
      key.split(".").reduce((obj: any, k) => obj?.[k], t) ?? key,
    [t]
  );

  return (
    <nav aria-label="Main navigation" className="p-2 mt-6 space-y-3">
      {NAV_LINKS.map((link) =>
        link.type === "anchor" ? (
          <button
            key={link.href}
            onClick={(e) => {
              handleNavLinkClick(link, pathname, lang, router);
              onClose();
            }}
            className="block w-full text-right py-2 px-2 text-white hover:bg-white/10 rounded-xl"
          >
            {getText(link.labelKey)}
          </button>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block py-2 px-2 text-white hover:bg-white/10 rounded-xl"
          >
            {getText(link.labelKey)}
          </Link>
        )
      )}
    </nav>
  );
};

export default MobileNavLinks;
