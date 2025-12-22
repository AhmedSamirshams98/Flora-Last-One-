"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/constants/links";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

const MobileNavLinks = ({ lang, onClose }: any) => {
  const t = lang === "ar" ? ar : en;
  const getText = (k: string) =>
    k.split(".").reduce((o: any, i) => o?.[i], t);

  return (
    <nav aria-label="Main navigation" className="p-2 mt-6 space-y-3">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className="block py-2 px-2 text-white hover:bg-white/10 rounded-xl"
        >
          {getText(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavLinks;
