import { productTranslations } from "@/lib/translations/products";

export interface CategoryItem {
  id: string;
  image: string;
  category: string;
  subcategory?: string | null;
}

/** Label, link and alt text for a home category (shared by the hero collage). */
export function categoryMeta(item: CategoryItem, lang: "ar" | "en") {
  const cat =
    productTranslations.category[
      item.category as keyof typeof productTranslations.category
    ];
  const sub = item.subcategory
    ? productTranslations.subcategory[
        item.subcategory as keyof typeof productTranslations.subcategory
      ]
    : null;
  const params = new URLSearchParams({ category: item.category });
  if (item.subcategory) params.set("subcategory", item.subcategory);
  return {
    label: lang === "ar" ? sub?.ar || cat?.ar : sub?.en || cat?.en,
    href: `/${lang}/products?${params.toString()}`,
    alt: cat?.en ?? item.category,
  };
}
