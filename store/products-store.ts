// src/store/productsStore.ts
import { create } from "zustand";
import axios from "axios";
import { Product, CreateProductInput, UpdateProductInput } from "../types/product";

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  currentProduct: Product | null;

  // Actions
  setSelectedProduct: (product: Product | null) => void;
  setFilteredProducts: (products: Product[]) => void;
  clearError: () => void;
  setCurrentProduct: (product: Product | null) => void;

  fetchProducts: () => Promise<void>;
  addProduct: (data: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  applyOfferToProduct: (productId: string, offerId?: string) => Promise<Product>;
  updateStock: (productId: string, variantId: string, stock: number) => Promise<Product>;
  getProductById: (id: string) => Promise<Product>;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.statusText || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "حدث خطأ غير معروف";
}

export const useProductsStore = create<ProductStore>((set, get) => {
  // دالة مساعدة لتحديث products و filteredProducts معًا
  const updateProductInStore = (updated: Product) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === updated.id ? updated : p)),
      filteredProducts: state.filteredProducts.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const removeProductFromStore = (id: string) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      filteredProducts: state.filteredProducts.filter((p) => p.id !== id),
    }));
  };

  return {
    products: [],
    filteredProducts: [],
    loading: false,
    error: null,
    selectedProduct: null,
    currentProduct: null,

    setSelectedProduct: (product) => set({ selectedProduct: product }),
    setFilteredProducts: (products) => set({ filteredProducts: products }),
    clearError: () => set({ error: null }),
    setCurrentProduct: (product) => set({ currentProduct: product }),

    fetchProducts: async () => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get("/api/products");
        set({ products: response.data, filteredProducts: response.data, loading: false });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false, products: [], filteredProducts: [] });
        throw error;
      }
    },

    addProduct: async (formData) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.post("/api/products", formData);
        const newProduct = response.data;
        set((state) => ({
          products: [newProduct, ...state.products],
          filteredProducts: [newProduct, ...state.filteredProducts],
          loading: false,
        }));
        return newProduct;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    updateProduct: async (id, data) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.put(`/api/products/${id}`, data);
        const updated = response.data;
        updateProductInStore(updated);
        set({ loading: false, selectedProduct: null });
        return updated;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    deleteProduct: async (id) => {
      set({ loading: true, error: null });
      try {
        await axios.delete(`/api/products/${id}`);
        removeProductFromStore(id);
        set({ loading: false });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    applyOfferToProduct: async (productId, offerId) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.patch(`/api/products/${productId}/offer`, { offerId });
        const updated = response.data;
        updateProductInStore(updated);
        set({ loading: false });
        return updated;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    updateStock: async (productId, variantId, stock) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.put(`/api/products/${productId}/stock`, { variantId, stock });
        const updated = response.data;
        updateProductInStore(updated);
        set({ loading: false });
        return updated;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false });
        throw error;
      }
    },

    getProductById: async (id) => {
      const existing = get().products.find((p) => p.id === id);
      if (existing) {
        set({ currentProduct: existing });
        return existing;
      }
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`/api/products/${id}`);
        const product = response.data;
        set({ currentProduct: product, loading: false });
        return product;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        set({ error: errorMessage, loading: false, currentProduct: null });
        throw error;
      }
    },
  };
});
