import { create } from "zustand";
import { Offer, CreateOfferInput, UpdateOfferInput } from "@/types/offers";

interface OfferStore {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  selectedOffer: Offer | null;

  setSelectedOffer: (offer: Offer | null) => void;

  fetchOffers: () => Promise<void>;
  addOffer: (data: CreateOfferInput) => Promise<void>;
  updateOffer: (id: string, data: UpdateOfferInput) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleOfferStatus: (id: string) => Promise<void>;
}

export const useOffersStore = create<OfferStore>((set, get) => ({
  offers: [],
  loading: false,
  error: null,
  selectedOffer: null,
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),

  fetchOffers: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      set({ offers: data, loading: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير معروف";
      set({ error: errorMessage, loading: false });
    }
  },

  addOffer: async (formData) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const newOffer = await res.json();
      set({ offers: [newOffer, ...get().offers], loading: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير معروف";
      set({ error: errorMessage, loading: false });
    }
  },

  updateOffer: async (id, data) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const updated = await res.json();
      set({
        offers: get().offers.map((o) => (o.id === id ? updated : o)),
        selectedOffer: null,
        loading: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير معروف";
      set({ error: errorMessage, loading: false });
    }
  },

  deleteOffer: async (id) => {
    set({ loading: true });
    try {
      await fetch(`/api/offers/${id}`, {
        method: "DELETE",
      });

      set({
        offers: get().offers.filter((o) => o.id !== id),
        loading: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير معروف";
      set({ error: errorMessage, loading: false });
    }
  },

  toggleOfferStatus: async (id) => {
    set({ loading: true });
    try {
      const offer = get().offers.find((o) => o.id === id);
      if (!offer) throw new Error("العرض غير موجود");

      const res = await fetch(`/api/offers/${id}/toggle`, {
        method: "PATCH",
      });

      const updated = await res.json();
      set({
        offers: get().offers.map((o) => (o.id === id ? updated : o)),
        loading: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير معروف";
      set({ error: errorMessage, loading: false });
    }
  },
}));
