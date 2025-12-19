"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { OfferType } from "@prisma/client";
import { OFFER_TYPES } from "@/constants/offers";
import { Offer, CreateOfferInput } from "@/types/offers";

interface OfferFormProps {
  offer?: Offer;
  onSubmit: (formData: FormData) => Promise<void>;
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة");
      return;
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الملف يجب أن يكون أقل من 5MB");
      return;
    }

    setSelectedImageFile(file);

    // عرض المعاينة
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadingImage(null);
    setSelectedImageFile(null);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) errors.push("العنوان مطلوب");
    if (!formData.titleEn.trim()) errors.push("العنوان بالانجليزية مطلوب");

    switch (formData.offerType) {
      case OfferType.PERCENTAGE_DISCOUNT:
        if (
          !formData.discountPercentage ||
          parseFloat(formData.discountPercentage) <= 0
        ) {
          errors.push("نسبة الخصم مطلوبة");
        }
        break;

      case OfferType.FIXED_AMOUNT_DISCOUNT:
        if (
          !formData.discountAmount ||
          parseFloat(formData.discountAmount) <= 0
        ) {
          errors.push("مبلغ الخصم مطلوب");
        }
        break;

      case OfferType.FIXED_PRICE:
        if (!formData.fixedPrice || parseFloat(formData.fixedPrice) <= 0) {
          errors.push("السعر الثابت مطلوب");
        }
        break;

      case OfferType.BUY_X_GET_Y:
        if (!formData.buyQuantity || parseInt(formData.buyQuantity) <= 0) {
          errors.push("كمية الشراء مطلوبة");
        }
        if (!formData.getQuantity || parseInt(formData.getQuantity) <= 0) {
          errors.push("كمية الحصول مطلوبة");
        }
        break;
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // التحقق من الصحة
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    setIsSubmitting(true);

    try {
      // إنشاء FormData
      const formDataToSend = new FormData();

      // إضافة البيانات النصية كـ JSON
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
        // إرسال الصورة الحالية إذا لم يتم اختيار صورة جديدة
        image:
          uploadingImage && !selectedImageFile ? uploadingImage : undefined,
      };

      formDataToSend.append("data", JSON.stringify(data));

      // إذا كان هناك صورة جديدة، أضفها
      if (selectedImageFile) {
        formDataToSend.append("image", selectedImageFile);
      }

      // إذا كان تعديل، أضف الـ ID
      if (offer?.id) {
        formDataToSend.append("id", offer.id);
      }

      // إرسال FormData
      await onSubmit(formDataToSend);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("حدث خطأ أثناء حفظ العرض");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white z-100 backdrop-blur-3xl p-6 rounded-lg w-full max-w-2xl mx-auto font-gess">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {offer ? "تعديل العرض" : "إضافة عرض"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* العنوان والفرعي والوصف */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              العنوان بالانجليزية *
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => handleChange("titleEn", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              العنوان الفرعي
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              العنوان الفرعي بالانجليزية
            </label>
            <input
              type="text"
              value={formData.subtitleEn}
              onChange={(e) => handleChange("subtitleEn", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              الوصف بالانجليزية
            </label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) => handleChange("descriptionEn", e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* نوع العرض */}
        <div>
          <h3 className="text-lg font-semibold mb-2">نوع العرض *</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {OFFER_TYPES.map((type) => (
              <label
                key={type.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.offerType === type.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="offerType"
                  value={type.value}
                  checked={formData.offerType === type.value}
                  onChange={() => handleChange("offerType", type.value)}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="text-lg mb-1">{type.icon}</div>
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* تفاصيل العرض حسب النوع */}
        {formData.offerType !== OfferType.SIMPLE &&
          formData.offerType !== OfferType.FREE_SHIPPING && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-4">تفاصيل العرض</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.offerType === OfferType.PERCENTAGE_DISCOUNT && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      نسبة الخصم % *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        handleChange("discountPercentage", e.target.value)
                      }
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      أدخل نسبة الخصم من 0 إلى 100
                    </p>
                  </div>
                )}

                {formData.offerType === OfferType.FIXED_AMOUNT_DISCOUNT && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      مبلغ الخصم *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        handleChange("discountAmount", e.target.value)
                      }
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {formData.offerType === OfferType.FIXED_PRICE && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      السعر النهائي *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.fixedPrice}
                      onChange={(e) =>
                        handleChange("fixedPrice", e.target.value)
                      }
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                
              </div>
            </div>
          )}

        {/* الفترة الزمنية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              تاريخ البداية
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              تاريخ النهاية
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* حالة التفعيل */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium cursor-pointer"
          >
            عرض نشط
          </label>
        </div>

        {/* رفع الصورة */}
        <div>
          <label className="block text-sm font-medium mb-2">صورة العرض</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="file"
              accept="image/*"
              id="upload-img"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />

            <label
              htmlFor="upload-img"
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Plus size={18} />
              {uploadingImage ? "تغيير الصورة" : "رفع صورة"}
            </label>

            <p className="text-sm text-gray-500">
              الصورة الاختيارية. حجم الملف الأقصى 5MB
            </p>
          </div>

          {uploadingImage && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">معاينة الصورة:</p>
              <div className="relative w-48 h-48">
                <Image
                  fill
                  src={uploadingImage}
                  alt="معاينة صورة العرض"
                  className="object-cover rounded-lg border"
                  sizes="192px"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:bg-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                جاري الحفظ...
              </span>
            ) : offer ? (
              "تحديث العرض"
            ) : (
              "إضافة العرض"
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
