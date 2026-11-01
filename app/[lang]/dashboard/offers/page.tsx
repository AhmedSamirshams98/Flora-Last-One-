"use client";

import { toast } from "sonner";
import AdminModal from "@/app/components/AdminModal";
import { useState, useEffect, useCallback } from "react";
import { useOffersStore } from "@/store/offers-store";
import { CreateOfferInput, Offer } from "@/types/offers";
import OfferForm from "./components/OfferForm";
import { OffersList } from "./components/OffersList";
import { useShallow } from "zustand/shallow";

export default function OffersDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const { offers, loading, fetchOffers, deleteOffer, toggleOfferStatus } =
    useOffersStore(
      useShallow((state) => ({
        offers: state.offers,
        loading: state.loading,
        fetchOffers: state.fetchOffers,
        deleteOffer: state.deleteOffer,
        toggleOfferStatus: state.toggleOfferStatus,
      }))
    );

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);
  const handleOfferSubmit = async (formData: FormData) => {
    try {
      const url = editingOffer
        ? `/api/offers/${editingOffer.id}`
        : "/api/offers";

      const method = editingOffer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حفظ العرض");
      }

      const result = await response.json();

      fetchOffers(); // إعادة تحميل العروض بعد العملية
      handleCloseForm(); // إغلاق الفورم بعد الإضافة أو التعديل

      // عرض رسالة نجاح
      toast.success(result.message || "تم حفظ العرض بنجاح");
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ العرض");
    }
  };
  const handleEdit = useCallback((offer: Offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setEditingOffer(null);
    setShowForm(false);
  }, []);

  return (
    <div className="p-6" style={{ direction: "rtl" }}>
      <div className="flex justify-between mb-6 font-gess">
        <h1 className="text-3xl font-bold">إدارة العروض</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          إضافة عرض جديد
        </button>
      </div>

      {showForm && (
        <AdminModal onClose={handleCloseForm} label={editingOffer ? "تعديل العرض" : "إضافة عرض"}>
          <OfferForm
            offer={editingOffer || undefined}
            onClose={handleCloseForm}
            onSubmit={handleOfferSubmit}
          />
        </AdminModal>
      )}

      {!loading ? (
        <OffersList
          offers={offers}
          onEdit={handleEdit}
          onDelete={deleteOffer}
          onToggleStatus={toggleOfferStatus}
        />
      ) : (
        <p className="text-center py-10">جاري تحميل العروض...</p>
      )}
    </div>
  );
}
