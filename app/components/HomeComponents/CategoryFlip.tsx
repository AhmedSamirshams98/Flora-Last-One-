"use client";

/* The categories as a flip carousel: the open category lies flat in a frame, the others are
   folded away on either side. Under it, the open category's name and a real link. In Arabic
   the list is turned round so the first category is on the right end and the arrows follow the
   reading direction. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ViewfinderFlipCarousel, { type ViewfinderFlipItem } from "./ViewfinderFlipCarousel";
import "./home.css";

export interface FlipCategory {
  id: string;
  image: string;
  label?: string;
  href: string;
  alt: string;
}

// phones and laptops each get their own size (the carousel needs numbers, not CSS)
const SIZES = {
  phone: { size: 190, openWidth: 230, foldedWidth: 50 },
  wide: { size: 250, openWidth: 330, foldedWidth: 72 },
} as const;
const RATIO = 1.25; // photos are 4:5, like the product pictures

export default function CategoryFlip({ lang, items }: { lang: "ar" | "en"; items: FlipCategory[] }) {
  const isAr = lang === "ar";
  const router = useRouter();
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const n = items.length;

  // the strip always runs left to right; in Arabic the first category goes to the right end
  const ordered = useMemo(() => (isAr ? [...items].reverse() : items), [isAr, items]);
  // start in the middle, so there are folded photos on both sides (shows it can be moved)
  const [active, setActive] = useState(() => (isAr ? n - 1 - Math.floor((n - 1) / 2) : Math.floor((n - 1) / 2)));
  const [phone, setPhone] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const slides: ViewfinderFlipItem[] = ordered.map((c) => ({
    title: c.label ?? c.alt,
    src: c.image,
    alt: c.label ?? c.alt,
    href: c.href,
  }));

  const sz = phone === false ? SIZES.wide : SIZES.phone;
  const photoH = Math.round(sz.size * RATIO);
  const current = ordered[Math.min(active, n - 1)];
  const position = isAr ? n - active : active + 1; // place in reading order, for the screen reader

  const labels = {
    region: isAr ? "أقسام المتجر" : "Shop categories",
    // the left arrow goes to the next category in Arabic (reading runs leftwards)
    previous: isAr ? "القسم التالي" : "Previous category",
    next: isAr ? "القسم السابق" : "Next category",
    goTo: (i: number, total: number, title: string) =>
      isAr ? `القسم ${total - i} من ${total}: ${title}` : `Category ${i + 1} of ${total}: ${title}`,
    announce: (i: number, total: number, title: string) =>
      isAr ? `القسم ${total - i} من ${total}: ${title}` : `Category ${i + 1} of ${total}: ${title}`,
  };

  return (
    <div className="fl-cat overflow-hidden rounded-[1.75rem]" dir={isAr ? "rtl" : "ltr"}>
      {/* until we know the screen, keep the height so nothing jumps */}
      <div style={{ minHeight: photoH + 150 }}>
        {phone !== null && (
          <ViewfinderFlipCarousel
            items={slides}
            index={active}
            onIndexChange={setActive}
            onSelect={(item) => item.href && router.push(item.href)}
            height={`${photoH + 150}px`}
            size={sz.size}
            ratio={RATIO}
            openWidth={sz.openWidth}
            foldedWidth={sz.foldedWidth}
            radius={14}
            color="#3d2817"
            labels={labels}
          />
        )}
      </div>

      <div className="px-5 pb-8 pt-2 text-center">
        <p dir="ltr" className="text-xs uppercase tracking-[0.18em] text-primary/60">
          {String(position).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </p>
        <h3 lang={lang} className="fl-display mt-2 text-3xl text-primary md:text-4xl">
          {current?.label ?? current?.alt}
        </h3>
        {current && (
          <Link
            href={current.href}
            className={`fl-cta mt-5 ${isAr ? "font-gess" : ""}`}
            style={{ display: "inline-flex" }}
          >
            {isAr ? "عرض المنتجات" : "View Products"}
            <Arrow aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
