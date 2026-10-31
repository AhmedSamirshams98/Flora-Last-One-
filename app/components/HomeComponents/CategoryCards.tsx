/* Home: shop by category, as a mosaic of photo tiles (after "Menu categories in sushi
   restaurant"): tiles of different sizes with thin even gaps, the name centred on a soft
   veil. With exactly 8 categories the mosaic is laid out by hand so it has no holes
   (one big tile first, a tall one, small ones, and a big one to close); any other count
   falls back to an even grid. The brand name, big and vertical, flanks it on wide screens.
   The hero's "Categories" button lands here (#categories). */

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import "./home.css";

export interface CategoryCard {
  id: string;
  image: string;
  label?: string;
  href: string;
  alt: string;
}

/* grid-area is row-start / col-start / row-end / col-end.
   Phones and tablets: 2 columns x 8 rows. Laptops: 4 columns x 4 rows. */
const MOSAIC = [
  "[grid-area:1/1/3/3] lg:[grid-area:1/1/3/3]", // big
  "[grid-area:3/2/5/3] lg:[grid-area:1/3/3/4]", // tall
  "[grid-area:3/1/4/2] lg:[grid-area:1/4/2/5]",
  "[grid-area:4/1/5/2] lg:[grid-area:2/4/3/5]",
  "[grid-area:5/1/7/2] lg:[grid-area:3/1/5/2]", // tall
  "[grid-area:5/2/6/3] lg:[grid-area:3/2/4/3]",
  "[grid-area:6/2/7/3] lg:[grid-area:4/2/5/3]",
  "[grid-area:7/1/9/3] lg:[grid-area:3/3/5/5]", // big, closes the mosaic
];

export default function CategoryCards({ lang, items }: { lang: "ar" | "en"; items: CategoryCard[] }) {
  if (items.length === 0) return null;
  const isAr = lang === "ar";
  const mosaic = items.length === 8;
  const word = isAr ? "فلورا" : "FLORA";

  return (
    <section id="categories" className="container mx-auto scroll-mt-24 px-4 py-14 md:py-20" dir={isAr ? "rtl" : "ltr"}>
      <Reveal className="mb-8 flex items-center gap-6 md:mb-12">
        <h2 lang={lang} className={`fl-display shrink-0 text-3xl text-primary ${isAr ? "md:text-5xl" : "md:text-4xl"}`}>
          {isAr ? "تسوّقي حسب القسم" : "Shop by category"}
        </h2>
        <span className="fl-rule" aria-hidden="true" />
      </Reveal>

      <div className="relative">
        {/* the two big decorative words, only where there is room for them */}
        {mosaic && (
          <>
            {[0, 1].map((side) => (
              <span
                key={side}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 hidden w-32 place-items-center xl:grid ${
                  side === 0 ? "start-0" : "end-0"
                }`}
              >
                <span
                  lang={lang}
                  className={`fl-display whitespace-nowrap text-[6.5rem] leading-none text-gold/40 [writing-mode:vertical-rl] ${
                    side === 1 ? "rotate-180" : ""
                  }`}
                >
                  {word}
                </span>
              </span>
            ))}
          </>
        )}

        <div
          className={
            mosaic
              ? "grid grid-cols-2 grid-rows-[repeat(8,7.5rem)] gap-2 md:grid-rows-[repeat(8,11rem)] md:gap-3 lg:grid-cols-4 lg:grid-rows-[repeat(4,15rem)] lg:gap-3 xl:mx-36"
              : "grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4"
          }
        >
          {items.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 70} className={mosaic ? `${MOSAIC[i]} min-h-0` : ""}>
              <Link
                href={c.href}
                className={`fl-tile group relative block overflow-hidden rounded-xl bg-secondary md:rounded-2xl ${
                  mosaic ? "h-full" : "aspect-[3/4]"
                }`}
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes={mosaic ? "(max-width: 1024px) 60vw, 33vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:transition-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(36_16_5/0.62),rgb(36_16_5/0.22)_78%)] transition-opacity duration-500 group-hover:opacity-70"
                />
                <span className="absolute inset-0 grid place-items-center p-3 text-center">
                  <span className="flex flex-col items-center gap-2">
                    <span
                      lang={lang}
                      className={`fl-display text-lg leading-snug text-[#fff7ee] [text-shadow:0_1px_14px_rgb(0_0_0/0.5)] md:text-2xl ${
                        isAr ? "font-bold" : "!text-base md:!text-xl"
                      }`}
                    >
                      {c.label ?? c.alt}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px w-8 origin-center scale-x-50 bg-gold transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none"
                    />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
