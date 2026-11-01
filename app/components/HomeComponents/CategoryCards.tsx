/* Home: shop by category, as a flip carousel (after "3D Flip Image Carousel" on 21st.dev):
   the open category lies flat in a frame, the others are folded away on its sides; under it
   the category's name and a link. The hero's "Categories" button lands here (#categories). */

import Reveal from "./Reveal";
import CategoryFlip from "./CategoryFlip";
import "./home.css";

export interface CategoryCard {
  id: string;
  image: string;
  label?: string;
  href: string;
  alt: string;
}

export default function CategoryCards({ lang, items }: { lang: "ar" | "en"; items: CategoryCard[] }) {
  if (items.length === 0) return null;
  const isAr = lang === "ar";

  return (
    <section id="categories" className="container mx-auto scroll-mt-24 px-4 py-14 md:py-20" dir={isAr ? "rtl" : "ltr"}>
      <Reveal className="mb-8 flex items-center gap-6 md:mb-12">
        <h2 lang={lang} className={`fl-display shrink-0 text-3xl text-primary ${isAr ? "md:text-5xl" : "md:text-4xl"}`}>
          {isAr ? "الأقسام" : "Categories"}
        </h2>
        <span className="fl-rule" aria-hidden="true" />
      </Reveal>

      <Reveal>
        <CategoryFlip lang={lang} items={items} />
      </Reveal>
    </section>
  );
}
