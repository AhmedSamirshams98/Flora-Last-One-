"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Save, X, Trash2, AlertCircle } from "lucide-react";
import { useMarqueeStore } from "@/store/marquee-store";
import { toast } from "sonner";

export default function MarqueeDashboard() {
  const [marqueeAr, setMarqueeAr] = useState("");
  const [marqueeEn, setMarqueeEn] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    activeMarquee,
    isLoading,
    error,
    fetchMarquees,
    addMarquee,
    deleteMarquee,
    clearError,
  } = useMarqueeStore();

  useEffect(() => {
    fetchMarquees();
  }, [fetchMarquees]);

  useEffect(() => {
    if (activeMarquee) {
      setMarqueeAr(activeMarquee.text);
      setMarqueeEn(activeMarquee.textEn || "");
    } else {
      setMarqueeAr("");
      setMarqueeEn("");
    }
  }, [activeMarquee]);

  const handleSave = async () => {
    if (!marqueeAr.trim()) {
      toast.error("يرجى كتابة النص العربي");
      return;
    }

    try {
      const marqueeData = {
        text: marqueeAr,
        textEn: marqueeEn.trim() || undefined,
      };

      await addMarquee(marqueeData);

      toast.success("تم حفظ النص بنجاح");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving marquee:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async () => {
    if (!activeMarquee) {
      toast.error("لا يوجد نص للحذف");
      return;
    }

    const confirmDelete = window.confirm(
      "هل أنت متأكد من إزالة الشريط المتحرك؟"
    );
    if (!confirmDelete) return;

    try {
      await deleteMarquee();
      toast.success("تم إزالة الشريط المتحرك بنجاح");
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting marquee:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">حدث خطأ</span>
          </div>
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={clearError}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container flex flex-col items-center font-gess  mx-auto p-4"
      style={{ direction: "rtl" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          إدارة نص الشريط المتحرك
        </h1>
        <p className="text-gray-600">
          إضافة أو تعديل أو حذف النص الذي يظهر في أعلى الموقع
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full  lg:w-[50%] border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg text-center font-semibold text-gray-700 mb-3">
            النص المعروض حالياً:
          </h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500 mb-1 font-medium">
                العربية:
              </div>
              <div className="text-gray-800">
                {activeMarquee?.text || "لم يتم إضافة نص بعد"}
              </div>
            </div>

            {activeMarquee?.textEn && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500 mb-1 font-medium">
                  English:
                </div>
                <div className="text-gray-800 font-sans font-bold ">
                  {activeMarquee.textEn}
                </div>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النص العربي (مطلوب):
              </label>
              <textarea
                value={marqueeAr}
                onChange={(e) => setMarqueeAr(e.target.value)}
                className="w-full h-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="اكتب النص العربي للشريط المتحرك..."
                dir="rtl"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النص الإنجليزي (اختياري):
                <span className="text-gray-400 text-sm mr-2">
                  - سيظهر عند اختيار اللغة الإنجليزية
                </span>
              </label>
              <textarea
                value={marqueeEn}
                onChange={(e) => setMarqueeEn(e.target.value)}
                className="w-full h-28 p-3 border font-sans border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Write English marquee text (optional)..."
                dir="ltr"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading || !marqueeAr.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "جاري الحفظ..." : "حفظ النص"}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  // استعادة القيم الأصلية
                  if (activeMarquee) {
                    setMarqueeAr(activeMarquee.text);
                    setMarqueeEn(activeMarquee.textEn || "");
                  }
                }}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 w-full justify-center bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              {activeMarquee ? "تعديل النص" : "إضافة نص جديد"}
            </button>

            {activeMarquee && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center gap-2  w-full justify-center bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                حذف النص الحالي
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
