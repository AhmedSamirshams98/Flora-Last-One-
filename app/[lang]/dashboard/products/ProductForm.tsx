"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import {
  ProductType,
  ProductSubtype,
  PricingType,
  PRODUCT_TYPES,
  SHOE_SUBTYPES,
  BAG_SUBTYPES,
} from "@/types/product";
import { translateSubcategory } from "@/lib/translations/products";
import VariantsSection from "./VariantsSection";

interface Variant {
  color: string;
  colorHex?: string;
  sizes: string[];
  price: number;
  images: string[];
  stock: number;
  description?: string;
}

interface ProductFormData {
  name: string;
  category: ProductType;
  subcategory?: ProductSubtype;
  pricingType: PricingType;
  basePrice: number;
  salePrice?: number;
  offerId?: string;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
  variants: Variant[];
}

interface ProductFormProps {
  initialData?: ProductFormData;
  offers: any[];
  onSubmit: (
    data: ProductFormData,
    uploadedFiles: Record<number, File[]>
  ) => Promise<void>;
  onCancel: () => void;
  uploading: boolean;
  isEditing: boolean;
}

export default function ProductForm({
  initialData,
  offers,
  onSubmit,
  onCancel,
  uploading,
  isEditing,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || getDefaultFormData()
  );
  const [sizeInputs, setSizeInputs] = useState<Record<number, string>>({
    0: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File[]>>(
    {}
  );

  const getSubtypeOptions = () => {
    return formData.category === ProductType.SHOE
      ? SHOE_SUBTYPES
      : BAG_SUBTYPES;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, uploadedFiles);
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleAddVariant = () => {
    const newIndex = formData.variants.length;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          colorHex: "",
          sizes: [],
          price: 0,
          images: [],
          stock: 0,
          description: "",
        },
      ],
    }));
    setSizeInputs((prev) => ({ ...prev, [newIndex]: "" }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

    const newSizeInputs = { ...sizeInputs };
    delete newSizeInputs[index];
    setSizeInputs(
      Object.keys(newSizeInputs).reduce((acc, key, idx) => {
        acc[idx] = newSizeInputs[Number(key)];
        return acc;
      }, {} as Record<number, string>)
    );

    const newUploadedFiles = { ...uploadedFiles };
    delete newUploadedFiles[index];
    setUploadedFiles(newUploadedFiles);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantIndex: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    setUploadedFiles((prev) => ({
      ...prev,
      [variantIndex]: [...(prev[variantIndex] || []), ...filesArray],
    }));

    const newImagePreviews = filesArray.map((file) =>
      URL.createObjectURL(file)
    );
    const currentImages = formData.variants[variantIndex].images;
    handleVariantChange(variantIndex, "images", [
      ...currentImages,
      ...newImagePreviews,
    ]);
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    URL.revokeObjectURL(formData.variants[variantIndex].images[imageIndex]);

    const newImages = formData.variants[variantIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    handleVariantChange(variantIndex, "images", newImages);

    const currentFiles = uploadedFiles[variantIndex] || [];
    if (imageIndex < currentFiles.length) {
      const newFiles = currentFiles.filter((_, i) => i !== imageIndex);
      setUploadedFiles((prev) => ({
        ...prev,
        [variantIndex]: newFiles,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                اسم المنتج *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                النوع الرئيسي *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as ProductType,
                  }))
                }
                required
                className="w-full p-3 border rounded-lg"
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                النوع الفرعي
              </label>
              <select
                value={formData.subcategory || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subcategory:
                      (e.target.value as ProductSubtype) || undefined,
                  }))
                }
                className="w-full p-3 border rounded-lg"
              >
                <option value="">اختياري</option>
                {getSubtypeOptions().map((subtype) => (
                  <option key={subtype.value} value={subtype.value}>
                    {translateSubcategory(subtype.value, "ar")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* التسعير */}
          <PricingSection
            formData={formData}
            setFormData={setFormData}
            offers={offers}
          />

          {/* المتغيرات */}
          <VariantsSection
            formData={formData}
            sizeInputs={sizeInputs}
            setSizeInputs={setSizeInputs}
            uploadedFiles={uploadedFiles}
            onAddVariant={handleAddVariant}
            onRemoveVariant={handleRemoveVariant}
            onVariantChange={(index: number, field: string, value: any) => {
              // تحويل string إلى keyof Variant إذا لزم الأمر
              handleVariantChange(index, field as keyof Variant, value);
            }}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
          />

          {/* الخيارات */}
          <ProductOptions formData={formData} setFormData={setFormData} />

          {/* الأزرار */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              disabled={uploading}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading
                ? "جاري الحفظ..."
                : isEditing
                ? "تحديث المنتج"
                : "إضافة المنتج"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PricingSection({ formData, setFormData, offers }: any) {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">التسعير</h3>

      <div className="flex gap-4 mb-4">
        {[
          { value: "SINGLE_PRICE", label: "سعر واحد" },
          { value: "SALE_PRICE", label: "خصم خاص" },
          { value: "WITH_OFFER", label: "مع عرض" },
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.pricingType === option.value}
              onChange={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  pricingType: option.value,
                  ...(option.value !== "SALE_PRICE" && {
                    salePrice: undefined,
                  }),
                  ...(option.value !== "WITH_OFFER" && { offerId: undefined }),
                }))
              }
            />
            {option.label}
          </label>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          السعر الأساسي * (ج.م)
        </label>
        <input
          type="number"
          value={formData.basePrice}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              basePrice: parseFloat(e.target.value) || 0,
            }))
          }
          required
          min="0"
          step="0.01"
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {formData.pricingType === "SALE_PRICE" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            السعر بعد الخصم * (ج.م)
          </label>
          <input
            type="number"
            value={formData.salePrice || ""}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                salePrice: parseFloat(e.target.value) || undefined,
              }))
            }
            required
            min="0"
            step="0.01"
            className="w-full p-3 border rounded-lg"
          />
        </div>
      )}

      {formData.pricingType === "WITH_OFFER" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">اختر عرض</label>
          <select
            value={formData.offerId || ""}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                offerId: e.target.value || undefined,
              }))
            }
            className="w-full p-3 border rounded-lg"
          >
            <option value="">اختر عرضاً</option>
            {offers
              .filter((o: any) => o.isActive)
              .map((offer: any) => (
                <option key={offer.id} value={offer.id}>
                  {offer.title} - {offer.offerType}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}

function ProductOptions({ formData, setFormData }: any) {
  const options = [
    { key: "isNew", label: "منتج جديد" },
    { key: "isFeatured", label: "منتج مميز" },
    { key: "inStock", label: "متوفر بالمخزون" },
  ];

  return (
    <div className="flex items-center gap-6 border-t pt-6">
      {options.map((option) => (
        <label key={option.key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData[option.key]}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                [option.key]: e.target.checked,
              }))
            }
            className="w-4 h-4"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function getDefaultFormData(): ProductFormData {
  return {
    name: "",
    category: ProductType.BAG,
    subcategory: undefined,
    pricingType: PricingType.SINGLE_PRICE, // ← استخدم Enum بدلاً من string
    basePrice: 0,
    salePrice: undefined,
    offerId: undefined,
    isNew: false,
    isFeatured: false,
    inStock: true,
    variants: [
      {
        color: "",
        colorHex: "",
        sizes: [],
        price: 0,
        images: [],
        stock: 0,
        description: "",
      },
    ],
  };
}
