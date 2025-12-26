// store/filters-store.ts
import { create } from "zustand";
import type { ProductType, Subcategory  } from "@/types/product"; // ✅ استيراد النوع من types/product

export type Category = ProductType | null;

interface FiltersState {
  category: Category;
  subcategory: Subcategory;
  setCategory: (category: Category) => void;
  setSubcategory: (subcategory: Subcategory) => void;
  setFilters: (category: Category, subcategory?: Subcategory) => void;
  reset: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  category: null,
  subcategory: null,
  setCategory: (category) => set({ category, subcategory: null }),
  setSubcategory: (subcategory) => set({ subcategory }),
  setFilters: (category, subcategory = null) => set({ category, subcategory }),
  reset: () => set({ category: null, subcategory: null }),
}));
