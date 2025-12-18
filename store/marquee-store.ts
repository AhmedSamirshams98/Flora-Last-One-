import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";
import { MarqueeItem } from "@/types/marquee";

interface MarqueeState {
  marquees: MarqueeItem[];
  activeMarquee: MarqueeItem | null;
  isLoading: boolean;
  error: string | null;

  fetchMarquees: () => Promise<void>;
  addMarquee: (data: { text: string; textEn?: string }) => Promise<void>;
  deleteMarquee: () => Promise<void>;
  setActiveMarquee: (marquee: MarqueeItem | null) => void;
  clearError: () => void;
}

export const useMarqueeStore = create<MarqueeState>()(
  devtools(
    (set, get) => ({
      marquees: [],
      activeMarquee: null,
      isLoading: false,
      error: null,

      fetchMarquees: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await axios.get("/api/marquee");

          set({
            marquees: response.data,
            activeMarquee:
              response.data.find((item: MarqueeItem) => item.isActive) || null,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching marquees:", error);
          set({
            error: axios.isAxiosError(error)
              ? error.response?.data?.error || error.message
              : "Unknown error",
            isLoading: false,
          });
        }
      },

      addMarquee: async (marqueeData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await axios.post("/api/marquee", marqueeData);

          // تحديث الـ state بدون تحديث الصفحة
          set((state) => ({
            marquees: [...state.marquees, response.data],
            activeMarquee: response.data, // النص الجديد يصبح نشط
            isLoading: false,
          }));

          return response.data; // إرجاع البيانات للإستخدام الفوري
        } catch (error) {
          console.error("Error adding marquee:", error);
          set({
            error: axios.isAxiosError(error)
              ? error.response?.data?.error || error.message
              : "Unknown error",
            isLoading: false,
          });
          throw error; // رمي الخطأ للتعامل معه في UI
        }
      },

      deleteMarquee: async () => {
        try {
          set({ isLoading: true, error: null });

          // احصل على النص النشط للحذف
          const activeMarquee = get().activeMarquee;

          if (!activeMarquee) {
            throw new Error("No active marquee to delete");
          }

          const response = await axios.delete("/api/marquee");

          // تحديث الـ state بدون تحديث الصفحة
          set((state) => ({
            marquees: state.marquees.filter(
              (item) => item.id !== activeMarquee.id
            ),
            activeMarquee: null, // لا يوجد نص نشط بعد الحذف
            isLoading: false,
          }));

          return response.data; // إرجاع بيانات الاستجابة
        } catch (error) {
          console.error("Error deleting marquee:", error);
          set({
            error: axios.isAxiosError(error)
              ? error.response?.data?.error || error.message
              : "Unknown error",
            isLoading: false,
          });
          throw error;
        }
      },

      setActiveMarquee: (marquee) => {
        set({ activeMarquee: marquee });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "marquee-store",
    }
  )
);
