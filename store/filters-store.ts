import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Category = "SHOE" | "BAG" | null;
export type Subcategory = string | null;

interface FiltersState {
  // state
  category: Category;
  subcategory: Subcategory;

  // actions
  setCategory: (category: Category) => void;
  setSubcategory: (subcategory: Subcategory) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      category: null,
      subcategory: null,

      setCategory: (category) =>
        set({
          category,
          subcategory: null, // إعادة تعيين النوع الفرعي عند تغيير الفئة
        }),

      setSubcategory: (subcategory) =>
        set({
          subcategory,
        }),

      reset: () =>
        set({
          category: null,
          subcategory: null,
        }),
    }),
    {
      name: "product-filters", // key في localStorage
      version: 1,
    }
  )
);
