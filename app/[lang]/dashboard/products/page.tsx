"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import Image from "next/image";
import {
  Product,
  ProductType,
  ProductSubtype,
  PricingType,
  CreateVariantInput,
  PRODUCT_TYPES,
  SHOE_SUBTYPES,
  BAG_SUBTYPES,
} from "@/types/product";
import { useProductsStore } from "@/store/products-store";
import { useOffersStore } from "@/store/offers-store";
import Filters from "@/app/components/HomeComponents/products/filters";

// ✅ استيراد من ملف الترجمة
import { translateSubcategory } from "@/lib/translations/products";
import { usePathname } from "next/navigation";

interface ProductFilters {
  category: string | null;
  subcategory: string | null;
  searchQuery: string;
  inStock: boolean | null;
  isFeatured: boolean | null;
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
  variants: CreateVariantInput[];
}

type VariantField = keyof CreateVariantInput;

export default function ProductsDashboard() {
  const pathname = usePathname();

  // تحديد اللغة بناءً على المسار
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";
  const {
    products,
    filteredProducts,
    loading,
    fetchProducts,
    deleteProduct,
    setFilteredProducts,
    updateProduct,
    addProduct,
  } = useProductsStore();

  const { offers, fetchOffers } = useOffersStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    category: null,
    subcategory: null,
    searchQuery: "",
    inStock: null,
    isFeatured: null,
  });

  const [formData, setFormData] = useState<ProductFormData>({
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
  });

  const [sizeInputs, setSizeInputs] = useState<Record<number, string>>({
    0: "",
  });

  // ✅ معاينة السعر للمستخدم فقط (UI/UX)
  const [previewPrice, setPreviewPrice] = useState(0);

  // حالة لرفع الملفات
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File[]>>(
    {}
  );

  // جلب البيانات
  const fetchData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchOffers()]);
  }, [fetchProducts, fetchOffers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // تطبيق الفلاتر
  useEffect(() => {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }
    if (filters.subcategory) {
      filtered = filtered.filter((p) => p.subcategory === filters.subcategory);
    }
    if (filters.inStock !== null) {
      filtered = filtered.filter((p) => p.inStock === filters.inStock);
    }
    if (filters.isFeatured !== null) {
      filtered = filtered.filter((p) => p.isFeatured === filters.isFeatured);
    }

    setFilteredProducts(filtered);
  }, [products, filters, setFilteredProducts]);

  // ✅ معاينة السعر فقط (للعرض في الواجهة)
  useEffect(() => {
    let price = formData.basePrice;

    if (formData.pricingType === PricingType.SALE_PRICE && formData.salePrice) {
      price = formData.salePrice;
    } else if (
      formData.pricingType === PricingType.WITH_OFFER &&
      formData.offerId
    ) {
      const offer = offers.find((o) => o.id === formData.offerId);
      if (offer) {
        // معاينة تقريبية فقط
        if (
          offer.offerType === "PERCENTAGE_DISCOUNT" &&
          offer.discountPercentage
        ) {
          price = formData.basePrice * (1 - offer.discountPercentage / 100);
        } else if (
          offer.offerType === "FIXED_AMOUNT_DISCOUNT" &&
          offer.discountAmount
        ) {
          price = Math.max(0, formData.basePrice - offer.discountAmount);
        } else if (offer.offerType === "FIXED_PRICE" && offer.fixedPrice) {
          price = offer.fixedPrice;
        }
      }
    }

    setPreviewPrice(Math.round(price * 100) / 100);
  }, [
    formData.basePrice,
    formData.salePrice,
    formData.offerId,
    formData.pricingType,
    offers,
  ]);

  const updateFilter = (
    key: keyof ProductFilters,
    value: string | boolean | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "category" && { subcategory: null }),
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || undefined,
      pricingType: product.pricingType,
      basePrice: product.basePrice,
      salePrice: product.salePrice || undefined,
      offerId: product.offerId || undefined,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      inStock: product.inStock,
      variants: product.variants.map((variant) => ({
        code: variant.code,
        color: variant.color,
        sizes: variant.sizes || [],
        price: variant.price,
        images: variant.images,
        stock: variant.stock,
        description: variant.description || "",
      })),
    });

    const newSizeInputs: Record<number, string> = {};
    product.variants.forEach((_, index) => {
      newSizeInputs[index] = "";
    });
    setSizeInputs(newSizeInputs);
    setUploadedFiles({}); // إعادة تعيين الملفات المرفوعة
    setShowForm(true);
  };

  const getSubtypeOptions = () => {
    return formData.category === ProductType.SHOE
      ? SHOE_SUBTYPES
      : BAG_SUBTYPES;
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
          price: previewPrice,
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
    const renumbered: Record<number, string> = {};
    Object.entries(newSizeInputs).forEach(([_, value], newIndex) => {
      renumbered[newIndex] = value;
    });
    setSizeInputs(renumbered);

    // حذف الملفات المرتبطة بهذا المتغير
    const newUploadedFiles = { ...uploadedFiles };
    delete newUploadedFiles[index];
    setUploadedFiles(newUploadedFiles);
  };

  const handleVariantChange = (
    index: number,
    field: VariantField,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleAddSize = (variantIndex: number) => {
    const sizeInput = sizeInputs[variantIndex]?.trim();
    if (!sizeInput) return;

    const currentSizes = formData.variants[variantIndex].sizes || [];
    if (!currentSizes.includes(sizeInput)) {
      const newSizes = [...currentSizes, sizeInput];
      handleVariantChange(variantIndex, "sizes", newSizes);
    }
    setSizeInputs((prev) => ({ ...prev, [variantIndex]: "" }));
  };

  const handleRemoveSize = (variantIndex: number, size: string) => {
    const currentSizes = formData.variants[variantIndex].sizes || [];
    const newSizes = currentSizes.filter((s) => s !== size);
    handleVariantChange(variantIndex, "sizes", newSizes);
  };

  const handleSizeInputChange = (variantIndex: number, value: string) => {
    setSizeInputs((prev) => ({ ...prev, [variantIndex]: value }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantIndex: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);

    // حفظ الملفات مؤقتاً
    setUploadedFiles((prev) => ({
      ...prev,
      [variantIndex]: [...(prev[variantIndex] || []), ...filesArray],
    }));

    // عرض معاينة للصور المرفوعة
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
    const newImages = formData.variants[variantIndex].images.filter(
      (_, i) => i !== imageIndex
    );

    // إزالة المعاينة من الذاكرة
    URL.revokeObjectURL(formData.variants[variantIndex].images[imageIndex]);

    handleVariantChange(variantIndex, "images", newImages);

    // إزالة الملف من uploadedFiles إذا كان ملف جديد
    const currentFiles = uploadedFiles[variantIndex] || [];
    if (imageIndex < currentFiles.length) {
      const newFiles = currentFiles.filter((_, i) => i !== imageIndex);
      setUploadedFiles((prev) => ({
        ...prev,
        [variantIndex]: newFiles,
      }));
    }
  };

  // ✅ إرسال النموذج مع FormData
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // إنشاء FormData
      const formDataToSend = new FormData();

      // إضافة بيانات المنتج كـ JSON
      const productData = {
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        basePrice: formData.basePrice,
        salePrice: formData.salePrice,
        offerId: formData.offerId,
        pricingType: formData.pricingType,
        isNew: formData.isNew,
        isFeatured: formData.isFeatured,
        inStock: formData.inStock,
        variants: formData.variants.map((variant, index) => ({
          color: variant.color,
          colorHex: variant.colorHex,
          sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
          price: variant.price || formData.basePrice,
          images: [], // سنحتفظ بالصور القديمة
          stock: variant.stock || 0,
          description: variant.description,
          uploadedImageIndexes: [], // سنملأ هذا لاحقاً
        })),
      };

      formDataToSend.append("data", JSON.stringify(productData));

      // إضافة الملفات المرفوعة مع الفهارس المناسبة
      let globalFileIndex = 0;
      const variantImageIndices: Record<number, number[]> = {};

      Object.entries(uploadedFiles).forEach(([variantIndexStr, files]) => {
        const variantIndex = parseInt(variantIndexStr);
        variantImageIndices[variantIndex] = [];

        files.forEach((file, fileIndex) => {
          formDataToSend.append(`image_${globalFileIndex}`, file);
          variantImageIndices[variantIndex].push(globalFileIndex);
          globalFileIndex++;
        });
      });

      // تحديث productData مع الفهارس
      const updatedProductData = {
        ...productData,
        variants: productData.variants.map((variant, index) => ({
          ...variant,
          // إضافة الفهارس للملفات المرفوعة حديثاً
          uploadedImageIndexes: variantImageIndices[index] || [],
          // إضافة الصور القديمة التي كانت في قاعدة البيانات
          images: formData.variants[index].images.filter(
            (img) =>
              img.startsWith("http") ||
              img.startsWith("/") ||
              img.includes("base64")
          ),
        })),
      };

      // إضافة البيانات المحدثة
      formDataToSend.set("data", JSON.stringify(updatedProductData));

      // إرسال الطلب إلى API
      const response = await fetch("/api/products", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في إنشاء المنتج");
      }

      const result = await response.json();

      if (result.success) {
        // إعادة تحميل المنتجات
        await fetchData();

        // إغلاق النموذج
        setShowForm(false);
        setEditingProduct(null);
        resetForm();

        alert(
          editingProduct ? "تم تحديث المنتج بنجاح!" : "تم إنشاء المنتج بنجاح!"
        );
      } else {
        throw new Error(result.error || "فشل في العملية");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(error instanceof Error ? error.message : "حدث خطأ في حفظ المنتج");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
    setSizeInputs({ 0: "" });
    setUploadedFiles({});
    setPreviewPrice(0);
  };

  const renderProductDetails = (product: Product) => {
    const finalPrice = product.finalPrice;
    let discountPercentage = 0;

    if (
      product.pricingType !== PricingType.SINGLE_PRICE &&
      finalPrice < product.basePrice
    ) {
      discountPercentage = Math.round(
        ((product.basePrice - finalPrice) / product.basePrice) * 100
      );
    }

    return (
      <div>
        <div className="mb-3">
          {product.pricingType === PricingType.SINGLE_PRICE ? (
            <span className="text-2xl font-bold text-gray-900">
              {finalPrice.toLocaleString()} ج.م
            </span>
          ) : (
            <div className="space-y-1">
              <div className="text-gray-400 line-through text-sm">
                {product.basePrice.toLocaleString()} ج.م
              </div>
              <div className="text-2xl font-bold text-red-600">
                {finalPrice.toLocaleString()} ج.م
              </div>
              {discountPercentage > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                  خصم {discountPercentage}%
                </span>
              )}
              {product.offer && (
                <div className="text-xs text-blue-600">
                  {product.offer.title}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div>المخزون: {product.inStock ? "متوفر" : "غير متوفر"}</div>
          <div>
            القطع: {product.variants.reduce((sum, v) => sum + v.stock, 0)}
          </div>
          <div>الألوان: {product.variants.length}</div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="p-6 max-w-7xl mx-auto container font-gess"
      style={{ direction: "rtl" }}
    >
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-2 text-center">إدارة المنتجات</h1>
        <Filters
          lang={lang}
          selectedCategory={filters.category}
          selectedSubcategory={filters.subcategory}
          onCategoryChange={(value) => updateFilter("category", value)}
          onSubcategoryChange={(value) => updateFilter("subcategory", value)}
        />

        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة منتج
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">جاري تحميل المنتجات...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              {product.variants[0]?.images[0] && (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    
                    src={product.variants[0].images[0]}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}

              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {translateSubcategory(product.subcategory || "", "ar")}
              </p>

              {renderProductDetails(product)}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نموذج المنتج */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* اسم المنتج */}
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

              {/* النوع الرئيسي */}
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

              {/* النوع الفرعي */}
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

              {/* التسعير */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">التسعير</h3>

                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={
                        formData.pricingType === PricingType.SINGLE_PRICE
                      }
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pricingType: PricingType.SINGLE_PRICE,
                          salePrice: undefined,
                          offerId: undefined,
                        }))
                      }
                    />
                    سعر واحد
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.pricingType === PricingType.SALE_PRICE}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pricingType: PricingType.SALE_PRICE,
                          offerId: undefined,
                        }))
                      }
                    />
                    خصم خاص
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.pricingType === PricingType.WITH_OFFER}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pricingType: PricingType.WITH_OFFER,
                          salePrice: undefined,
                        }))
                      }
                    />
                    مع عرض
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    السعر الأساسي * (ج.م)
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
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

                {formData.pricingType === PricingType.SALE_PRICE && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      السعر بعد الخصم * (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
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

                {formData.pricingType === PricingType.WITH_OFFER && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      اختر عرض
                    </label>
                    <select
                      value={formData.offerId || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          offerId: e.target.value || undefined,
                        }))
                      }
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">اختر عرضاً</option>
                      {offers
                        .filter((o) => o.isActive)
                        .map((offer) => (
                          <option key={offer.id} value={offer.id}>
                            {offer.title} - {offer.offerType}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 mb-2">
                    ⚠️ معاينة تقريبية - السعر النهائي يُحسب في السيرفر
                  </p>
                  <p className="text-xl font-bold text-yellow-900">
                    {previewPrice.toFixed(2)} ج.م
                  </p>
                </div>
              </div>

              {/* المتغيرات */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">المتغيرات (الألوان)</h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    + إضافة لون
                  </button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className="border p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">المتغير {index + 1}</h4>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">اللون *</label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                          required
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1">رمز اللون</label>
                        <input
                          type="color"
                          value={variant.colorHex || "#000000"}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "colorHex",
                              e.target.value
                            )
                          }
                          className="w-full h-10 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1">
                          سعر هذا اللون
                        </label>
                        <input
                          type="number"
                          value={variant.price || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="0"
                          step="0.01"
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1">الكمية *</label>
                        <input
                          type="number"
                          value={variant.stock || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "stock",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                          min="0"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm mb-2">
                        المقاسات المتاحة *
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={sizeInputs[index] || ""}
                          onChange={(e) =>
                            handleSizeInputChange(index, e.target.value)
                          }
                          placeholder="أدخل مقاساً جديداً"
                          className="flex-1 p-2 border rounded"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSize(index);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSize(index)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          إضافة
                        </button>
                      </div>

                      {variant.sizes && variant.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {variant.sizes.map((size, sizeIndex) => (
                            <div
                              key={sizeIndex}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded flex items-center gap-2"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(index, size)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          لم يتم إضافة أي مقاسات بعد
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm mb-2">وصف المتغير</label>
                      <textarea
                        value={variant.description || ""}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded"
                        rows={2}
                        placeholder="وصف خاص بهذا المتغير..."
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">
                        صور هذا اللون *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="cursor-pointer inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <Upload size={16} />
                          رفع الصور
                        </label>

                        {variant.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {variant.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative">
                                <div className="w-full h-20 relative">
                                  <Image
                                    unoptimized
                                    src={image}
                                    alt={`Variant ${index + 1} image ${
                                      imgIndex + 1
                                    }`}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index, imgIndex)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* الخيارات */}
              <div className="flex items-center gap-6 border-t pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isNew: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>منتج جديد</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>منتج مميز</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        inStock: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span>متوفر بالمخزون</span>
                </label>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading
                    ? "جاري الحفظ..."
                    : editingProduct
                    ? "تحديث المنتج"
                    : "إضافة المنتج"}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
