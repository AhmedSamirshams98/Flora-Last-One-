/* Home: a short grid of products with their real prices, between the categories and our story.
   Server component, no script: plain links. Four on a phone, eight on a laptop.
   The title says only what is true: "Featured Products" when the owner marked at least 4, "New
   Arrivals" when at least 4 carry the new flag, otherwise the neutral "Our Products" (the grid is
   then in stock first, featured next, newest after). Prices are the shop's
   own (the old one is struck through only when the product really is cheaper now). */

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import type { HomeProduct } from "./Offers/types";
import "./home.css";

const money = (n: number) => `EGP ${n.toLocaleString("en-US")}`;

export default function HomeProducts({
  lang,
  products,
  kind,
}: {
  lang: "ar" | "en";
  products: HomeProduct[];
  /** how the products were picked; the title says only what is true */
  kind: "featured" | "new" | "mixed";
}) {
  if (products.length === 0) return null;
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const title = {
    featured: isAr ? "منتجات مميزة" : "Featured Products",
    new: isAr ? "وصل حديثًا" : "New Arrivals",
    mixed: isAr ? "منتجاتنا" : "Our Products",
  }[kind];

  return (
    <section id="new" className="container mx-auto px-4 py-14 md:py-20" dir={isAr ? "rtl" : "ltr"}>
      <Reveal className="mb-8 flex items-center gap-6 md:mb-12">
        <h2 lang={lang} className={`fl-display shrink-0 text-3xl text-primary ${isAr ? "md:text-5xl" : "md:text-4xl"}`}>
          {title}
        </h2>
        <span className="fl-rule" aria-hidden="true" />
      </Reveal>

      <Reveal>
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {products.map((p, i) => {
            const discounted = p.finalPrice < p.basePrice;
            return (
              <li key={p.id} className={i >= 4 ? "hidden md:block" : undefined}>
                <Link href={`/${lang}/product/${p.id}`} className="group fl-pcard fl-glow block h-full">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 46vw, 24vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                    {p.isNew && (
                      <span className="absolute start-3 top-3 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                        {isAr ? "جديد" : "New"}
                      </span>
                    )}
                    {!p.inStock && (
                      <span className="absolute inset-x-0 bottom-0 bg-primary/80 py-1.5 text-center text-xs text-primary-foreground">
                        {isAr ? "غير متوفر" : "Out of stock"}
                      </span>
                    )}
                  </div>
                  <h3 className={`mt-3 px-1 line-clamp-1 text-base text-primary ${isAr ? "font-gess" : ""}`}>{p.name}</h3>
                  <p dir="ltr" className={`mt-1 px-1 flex flex-wrap items-baseline gap-x-2 ${isAr ? "justify-end" : ""}`}>
                    <span className="text-base font-medium text-primary">{money(p.finalPrice)}</span>
                    {discounted && <span className="text-sm text-primary/60 line-through">{money(p.basePrice)}</span>}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal className="mt-10 flex justify-center md:mt-14">
        <Link
          href={`/${lang}/products`}
          className={`fl-cta ${isAr ? "font-gess" : ""}`}
        >
          {isAr ? "عرض كل المنتجات" : "View All Products"}
          <Arrow aria-hidden="true" className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
