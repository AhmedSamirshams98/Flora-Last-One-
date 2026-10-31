"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Category, useFiltersStore } from "@/store/filters-store";
import {
  Subcategory,
  translateSubcategory,
  ProductSubtype,
} from "@/types/product";

interface FiltersProps {
  lang: "ar" | "en";
}

const subcategoryMap: Record<NonNullable<Category>, Subcategory[]> = {
  SHOE: [
    ProductSubtype.WINTER_BOOTS,
    ProductSubtype.SNEAKERS,
    ProductSubtype.PUMPS,
    ProductSubtype.BALLERINAS,
    ProductSubtype.LOAFERS,
    ProductSubtype.SLIPPERS,
    ProductSubtype.SANDALS,
  ],
  BAG: [
    ProductSubtype.HAND_BAGS,
    ProductSubtype.SHOULDER_BAGS,
    ProductSubtype.CROSSBODY_BAGS,
    ProductSubtype.CLUTCH_BAGS,
    ProductSubtype.BACKPACKS,
    ProductSubtype.WALLETS,
  ],
};

/* The same two filters as before (category, then type), the same URL and store, drawn two
   ways: a quiet text list down the side on a laptop (after the minimalist category page),
   and a row of round chips that scrolls sideways on a phone. */
export default function Filters({ lang }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAr = lang === "ar";
  const [sheet, setSheet] = useState(false);
  const T = isAr
    ? { filter: "تصفية", category: "القسم", type: "النوع", done: "تم", clear: "مسح", close: "إغلاق" }
    : { filter: "Filter", category: "Category", type: "Type", done: "Done", clear: "Clear", close: "Close" };

  // the sheet: Escape closes it, and the page behind stops scrolling while it is open
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  const mainCategories = [
    { id: "SHOE" as const, label: isAr ? "أحذية" : "Shoes" },
    { id: "BAG" as const, label: isAr ? "شنط" : "Bags" },
  ];

  const { category, subcategory, setFilters, setSubcategory, reset } =
    useFiltersStore(
      useShallow((s) => ({
        category: s.category,
        subcategory: s.subcategory,
        setFilters: s.setFilters,
        setSubcategory: s.setSubcategory,
        reset: s.reset,
      }))
    );

  const updateURL = (cat: Category, subcat: Subcategory) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat as string);
    if (subcat) params.set("subcategory", subcat as string);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const pickAll = () => {
    reset();
    router.push(pathname);
  };
  const pickCategory = (id: "SHOE" | "BAG") => {
    setFilters(id as Category, null);
    updateURL(id as Category, null);
  };
  const pickType = (value: Subcategory) => {
    if (!category) return;
    setSubcategory(value);
    updateURL(category, value);
  };
  const pickAllTypes = () => {
    if (!category) return;
    setSubcategory(null);
    updateURL(category, null);
  };

  const types = category
    ? subcategoryMap[category].map((value) => ({
        value,
        label: translateSubcategory(value, lang),
      }))
    : [];

  // ---- a text row for the side list
  const row = (active: boolean) =>
    `flex w-full items-center gap-2 py-1.5 text-start text-[0.95rem] transition-colors focus-visible:outline-offset-2 ${
      active ? "font-medium text-primary" : "text-primary/65 hover:text-primary"
    } ${isAr ? "font-gess" : ""}`;
  const dot = (active: boolean) =>
    active ? (
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
    ) : (
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0" />
    );

  // ---- a round chip for the phone row
  const chip = (active: boolean) =>
    `inline-flex h-11 shrink-0 items-center rounded-full border px-5 text-sm transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-primary/25 text-primary hover:border-primary/60"
    } ${isAr ? "font-gess" : ""}`;

  return (
    <>
      {/* laptops: the text list */}
      <nav
        aria-label={isAr ? "تصفية المنتجات" : "Filter products"}
        className="hidden lg:block"
      >
        <p className="mb-4 text-xs uppercase tracking-[0.18em] text-primary/50">
          {isAr ? "الأقسام" : "Categories"}
        </p>
        <ul>
          <li>
            <button onClick={pickAll} className={row(!category)}>
              {dot(!category)}
              {isAr ? "الكل" : "All"}
            </button>
          </li>
          {mainCategories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => pickCategory(c.id)}
                aria-expanded={category === c.id}
                className={row(category === c.id && !subcategory)}
              >
                {dot(category === c.id && !subcategory)}
                {c.label}
              </button>
              {category === c.id && (
                <ul className="mb-2 ms-5 border-s border-primary/15 ps-3">
                  <li>
                    <button onClick={pickAllTypes} className={row(!subcategory)}>
                      {isAr ? "الكل" : "All"}
                    </button>
                  </li>
                  {types.map((s) => (
                    <li key={s.value}>
                      <button
                        onClick={() => pickType(s.value)}
                        className={row(subcategory === s.value)}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* phones and tablets: one row (the filter button and the two main categories), the
          types live in a sheet that slides up, so nothing is cut off at the screen edge */}
      <div
        className="flex flex-wrap items-center gap-2 lg:hidden"
        role="group"
        aria-label={isAr ? "تصفية المنتجات" : "Filter products"}
      >
        <button
          onClick={() => setSheet(true)}
          aria-haspopup="dialog"
          className={`${chip(false)} relative gap-2`}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {T.filter}
          {subcategory && (
            <span aria-hidden="true" className="absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-gold" />
          )}
        </button>
        <button onClick={pickAll} aria-pressed={!category} className={chip(!category)}>
          {isAr ? "الكل" : "All"}
        </button>
        {mainCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => pickCategory(c.id)}
            aria-pressed={category === c.id}
            className={chip(category === c.id)}
          >
            {c.label}
          </button>
        ))}
        {subcategory && (
          <button
            onClick={pickAllTypes}
            aria-label={`${T.clear}: ${types.find((x) => x.value === subcategory)?.label ?? ""}`}
            className={`${chip(true)} gap-2`}
          >
            {types.find((x) => x.value === subcategory)?.label}
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {sheet && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={T.filter}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSheet(false)} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[1.75rem] bg-background shadow-2xl">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 lang={lang} className="fl-display text-2xl text-primary">{T.filter}</h2>
              <button
                onClick={() => setSheet(false)}
                aria-label={T.close}
                className="grid h-11 w-11 place-items-center rounded-full border border-primary/20 text-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-4">
              <p className="mb-3 mt-3 text-xs uppercase tracking-[0.18em] text-primary/50">{T.category}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={pickAll} aria-pressed={!category} className={chip(!category)}>
                  {isAr ? "الكل" : "All"}
                </button>
                {mainCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => pickCategory(c.id)}
                    aria-pressed={category === c.id}
                    className={chip(category === c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {category && (
                <>
                  <p className="mb-3 mt-6 text-xs uppercase tracking-[0.18em] text-primary/50">{T.type}</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={pickAllTypes} aria-pressed={!subcategory} className={chip(!subcategory)}>
                      {isAr ? "الكل" : "All"}
                    </button>
                    {types.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => pickType(s.value)}
                        aria-pressed={subcategory === s.value}
                        className={chip(subcategory === s.value)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 border-t border-primary/10 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => {
                  pickAll();
                }}
                disabled={!category}
                className="inline-flex h-12 shrink-0 items-center rounded-full border border-primary/25 px-6 text-primary disabled:opacity-40"
              >
                {T.clear}
              </button>
              <button onClick={() => setSheet(false)} className="fl-cta flex-1">
                {T.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
