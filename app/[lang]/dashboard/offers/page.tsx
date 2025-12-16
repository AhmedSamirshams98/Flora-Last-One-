"use client";

import { useState, useEffect, useCallback } from "react";
import { useOffersStore } from "@/store/offers-store";
import { CreateOfferInput, Offer } from "@/types/offers";
import OfferForm from "./components/OfferForm";
import { OffersList } from "./components/OffersList";
import axios from "axios";
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
  const handleOfferSubmit = async (data: CreateOfferInput) => {
    if (editingOffer) {
      // تحديث العرض
      await axios.put(`/api/offers/${editingOffer.id}`, data);
    } else {
      // إضافة عرض جديد
      await axios.post("/api/offers", data);
    }
    fetchOffers(); // إعادة تحميل العروض بعد العملية
    handleCloseForm(); // إغلاق الفورم بعد الإضافة أو التعديل
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <OfferForm
              offer={editingOffer || undefined}
              onClose={handleCloseForm}
              onSubmit={handleOfferSubmit}
            />
          </div>
        </div>
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
