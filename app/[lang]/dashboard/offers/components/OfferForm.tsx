"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { OfferType } from "@prisma/client";
import { OFFER_TYPES } from "@/constants/offers";
import { Offer, CreateOfferInput } from "@/types/offers";

interface OfferFormProps {
  offer?: Offer;
  onSubmit: (data: CreateOfferInput) => Promise<void>;
  onClose: () => void;
}

export default function OfferForm({
  offer,
  onSubmit,
  onClose,
}: OfferFormProps) {
  const [formData, setFormData] = useState({
    title: offer?.title || "",
    titleEn: offer?.titleEn || "",
    subtitle: offer?.subtitle || "",
    subtitleEn: offer?.subtitleEn || "",
    description: offer?.description || "",
    descriptionEn: offer?.descriptionEn || "",
    offerType: offer?.offerType || OfferType.SIMPLE,
    discountPercentage: offer?.discountPercentage?.toString() || "",
    discountAmount: offer?.discountAmount?.toString() || "",
    fixedPrice: offer?.fixedPrice?.toString() || "",
    buyQuantity: offer?.buyQuantity?.toString() || "",
    getQuantity: offer?.getQuantity?.toString() || "",
    startDate: offer?.startDate
      ? new Date(offer.startDate).toISOString().split("T")[0]
      : "",
    endDate: offer?.endDate
      ? new Date(offer.endDate).toISOString().split("T")[0]
      : "",
    isActive: offer?.isActive ?? true,
  });

  const [uploadingImage, setUploadingImage] = useState<string | null>(
    offer?.image || null
  );

  const handleChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post("/api/upload", form);
      setUploadingImage(res.data.imageUrl);
    } catch {
      alert("فشل في رفع الصورة");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data: CreateOfferInput = {
      title: formData.title,
      titleEn: formData.titleEn,
      subtitle: formData.subtitle || undefined,
      subtitleEn: formData.subtitleEn || undefined,
      description: formData.description || undefined,
      descriptionEn: formData.descriptionEn || undefined,
      offerType: formData.offerType,
      discountPercentage: formData.discountPercentage
        ? parseFloat(formData.discountPercentage)
        : undefined,
      discountAmount: formData.discountAmount
        ? parseFloat(formData.discountAmount)
        : undefined,
      fixedPrice: formData.fixedPrice
        ? parseFloat(formData.fixedPrice)
        : undefined,
      buyQuantity: formData.buyQuantity
        ? parseInt(formData.buyQuantity)
        : undefined,
      getQuantity: formData.getQuantity
        ? parseInt(formData.getQuantity)
        : undefined,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : undefined,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : undefined,
      isActive: formData.isActive,
      // ⭐ الإصلاح المهم: أرسل null صراحة عند الحذف
image: uploadingImage === null ? null : (uploadingImage || undefined)
    };

    await onSubmit(data);
  };

  return (
    <div className="bg-white z-100 backdrop-blur-3xl p-6 rounded-lg w-full max-w-2xl mx-auto font-gess">
      <h2 className="text-xl font-bold mb-4">
        {offer ? "تعديل العرض" : "إضافة عرض"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* العنوان والفرعي والوصف */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>العنوان *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label>العنوان بالانجليزية *</label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => handleChange("titleEn", e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label>العنوان الفرعي</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label>العنوان الفرعي بالانجليزية</label>
            <input
              type="text"
              value={formData.subtitleEn}
              onChange={(e) => handleChange("subtitleEn", e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label>الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label> الوصف بالانجليزية</label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => handleChange("descriptionEn", e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* نوع العرض */}
        <div>
          <h3 className="text-lg font-semibold mb-2">نوع العرض</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {OFFER_TYPES.map((type) => (
              <label
                key={type.value}
                className={`p-4 border rounded-lg cursor-pointer ${
                  formData.offerType === type.value
                    ? "border-primary bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="offerType"
                  value={type.value}
                  checked={formData.offerType === type.value}
                  onChange={() => handleChange("offerType", type.value)}
                  className="hidden"
                />
                <div className="text-lg">{type.icon}</div>
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* تفاصيل العرض حسب النوع */}
        {formData.offerType !== OfferType.SIMPLE &&
          formData.offerType !== OfferType.FREE_SHIPPING && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.offerType === OfferType.PERCENTAGE_DISCOUNT && (
                <div>
                  <label>نسبة الخصم %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      handleChange("discountPercentage", e.target.value)
                    }
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              )}

              {formData.offerType === OfferType.FIXED_AMOUNT_DISCOUNT && (
                <div>
                  <label>مبلغ الخصم</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discountAmount}
                    onChange={(e) =>
                      handleChange("discountAmount", e.target.value)
                    }
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              )}

              {formData.offerType === OfferType.FIXED_PRICE && (
                <div>
                  <label>السعر النهائي</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.fixedPrice}
                    onChange={(e) => handleChange("fixedPrice", e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              )}

              {formData.offerType === OfferType.BUY_X_GET_Y && (
                <>
                  <div>
                    <label>اشتر (X)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.buyQuantity}
                      onChange={(e) =>
                        handleChange("buyQuantity", e.target.value)
                      }
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label>احصل على (Y)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.getQuantity}
                      onChange={(e) =>
                        handleChange("getQuantity", e.target.value)
                      }
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          )}

        {/* الفترة الزمنية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>تاريخ البداية</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label>تاريخ النهاية</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* حالة التفعيل */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
            />
            <span>عرض نشط</span>
          </label>
        </div>

        {/* رفع الصورة */}
        <div className="flex gap-4">
          <input
            type="file"
            accept="image/*"
            id="upload-img"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label
            htmlFor="upload-img"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            <Plus size={18} /> رفع صورة
          </label>

          {uploadingImage && (
            <div className="relative w-32 h-32">
              <Image
                fill
                src={uploadingImage}
                alt="preview"
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setUploadingImage(null)} // ⭐ هذا يضع null
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg"
          >
            {offer ? "تحديث" : "إضافة"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}