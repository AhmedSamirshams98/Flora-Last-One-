"use client";

import { useState, useEffect } from "react";
import {
  ProductType,
  ProductSubtype,
  PRODUCT_TYPES,
  SHOE_SUBTYPES,
  BAG_SUBTYPES,
  PricingType,
} from "@/types/product";
import { translateSubcategory } from "@/lib/translations/products";
import VariantsSection, { Variant } from "./VariantsSection";

export interface ProductFormData {
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
  onSubmit: (data: ProductFormData, files: File[]) => Promise<void>;
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
  const [formData, setFormData] = useState<ProductFormData>(initialData || getDefaultFormData());
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const getSubtypeOptions = () => (formData.category === ProductType.SHOE ? SHOE_SUBTYPES : BAG_SUBTYPES);

  const handleVariantsChange = (variants: Variant[]) => setFormData(prev => ({ ...prev, variants }));
  const handleFilesChange = (files: File[]) => setUploadedFiles(files);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      variants: formData.variants.map(v => ({ ...v, imageFiles: v.imageFiles || [] })),
    };
    await onSubmit(submitData, uploadedFiles);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{isEditing ? "✏️ تعديل المنتج" : "➕ إضافة منتج جديد"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="مثال: حقيبة يد جلدية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">النوع الرئيسي *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  category: e.target.value as ProductType,
                  subcategory: undefined,
                }))}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {PRODUCT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">النوع الفرعي</label>
              <select
                value={formData.subcategory || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  subcategory: e.target.value ? (e.target.value as ProductSubtype) : undefined,
                }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">اختياري</option>
                {getSubtypeOptions().map(subtype => (
                  <option key={subtype.value} value={subtype.value}>
                    {translateSubcategory(subtype.value, "ar")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* التسعير */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">💰 التسعير</h3>

            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricingType"
                  checked={formData.pricingType === PricingType.SINGLE_PRICE}
                  onChange={() => setFormData(prev => ({ ...prev, pricingType: PricingType.SINGLE_PRICE, salePrice: undefined, offerId: undefined }))}
                  className="w-4 h-4"
                />
                <span>سعر واحد</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricingType"
                  checked={formData.pricingType === PricingType.SALE_PRICE}
                  onChange={() => setFormData(prev => ({ ...prev, pricingType: PricingType.SALE_PRICE, offerId: undefined }))}
                  className="w-4 h-4"
                />
                <span>خصم خاص</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricingType"
                  checked={formData.pricingType === PricingType.WITH_OFFER}
                  onChange={() => setFormData(prev => ({ ...prev, pricingType: PricingType.WITH_OFFER, salePrice: undefined }))}
                  className="w-4 h-4"
                />
                <span>مع عرض</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">السعر الأساسي * (دينار)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                step="0.01"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {formData.pricingType === PricingType.SALE_PRICE && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">السعر بعد الخصم * (دينار)</label>
                <input
                  type="number"
                  value={formData.salePrice || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || undefined }))}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {formData.pricingType === PricingType.WITH_OFFER && offers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">اختر عرض</label>
                <select
                  value={formData.offerId || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, offerId: e.target.value || undefined }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">اختر عرضاً</option>
                  {offers.filter(o => o.isActive).map(o => (
                    <option key={o.id} value={o.id}>{o.title} - {o.offerType}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* المتغيرات */}
          <VariantsSection
            variants={formData.variants}
            onVariantsChange={handleVariantsChange}
            onFilesChange={handleFilesChange}
            uploadedFiles={uploadedFiles}
          />

          {/* خيارات إضافية */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">⚙️ خيارات المنتج</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))} className="w-4 h-4 rounded"/>
                <span>منتج جديد</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="w-4 h-4 rounded"/>
                <span>منتج مميز</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))} className="w-4 h-4 rounded"/>
                <span>متوفر بالمخزون</span>
              </label>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-6 border-t">
            <button type="submit" disabled={uploading} className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {uploading ? "جاري الحفظ..." : isEditing ? "💾 تحديث المنتج" : "➕ إضافة المنتج"}
            </button>
            <button type="button" onClick={onCancel} disabled={uploading} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getDefaultFormData(): ProductFormData {
  return {
    name: "",
    category: ProductType.BAG,
    subcategory: undefined,
    pricingType: PricingType.SINGLE_PRICE,
    basePrice: 0,
    salePrice: undefined,
    offerId: undefined,
    isNew: false,
    isFeatured: false,
    inStock: true,
    variants: [{ color: "", sizes: [], price: 0, images: [], stock: 0, description: "", imageFiles: [] }],
  };
}
