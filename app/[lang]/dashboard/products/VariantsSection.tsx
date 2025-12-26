"use client";

import { useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import Image from "next/image";

export interface Variant {
  code:string;
  color: string;
  sizes: string[];
  price: number;
  images: string[]; // روابط الصور الفعلية أو blob URLs مؤقتة
  stock: number;
  description?: string;
  imageFiles?: number[]; // مؤشرات للصور المرفوعة حديثاً
}

interface VariantsSectionProps {
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  onFilesChange: (files: File[]) => void;
  uploadedFiles: File[];
}

export default function VariantsSection({
  variants,
  onVariantsChange,
  onFilesChange,
  uploadedFiles,
}: VariantsSectionProps) {
  const [sizeInputs, setSizeInputs] = useState<Record<number, string>>({});

  const handleAddVariant = () => {
    const newVariant: Variant = {
      code:"",
      color: "",
      sizes: [],
      price: 0,
      images: [],
      stock: 0,
      description: "",
      imageFiles: [],
    };
    onVariantsChange([...variants, newVariant]);
    setSizeInputs({ ...sizeInputs, [variants.length]: "" });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);

    const newSizeInputs = { ...sizeInputs };
    delete newSizeInputs[index];

    const reordered: Record<number, string> = {};
    Object.keys(newSizeInputs).forEach((key, idx) => {
      reordered[idx] = newSizeInputs[Number(key)];
    });
    setSizeInputs(reordered);
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: any
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantIndex: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const currentFileIndex = uploadedFiles.length;

    console.log(
      `📤 [Variant ${variantIndex}] رفع ${filesArray.length} صور جديدة`
    );
    console.log(`📊 الـ index الحالي: ${currentFileIndex}`);

    // تحديث قائمة الملفات الكلية
    const newUploadedFiles = [...uploadedFiles, ...filesArray];
    onFilesChange(newUploadedFiles);

    // إنشاء array من الـ indices للملفات الجديدة
    const newFileIndices = Array.from(
      { length: filesArray.length },
      (_, i) => currentFileIndex + i
    );

    console.log(`🔢 Indices الجديدة:`, newFileIndices);

    // تحديث imageFiles للمتغير
    const currentImageFiles = variants[variantIndex].imageFiles || [];
    const updatedImageFiles = [...currentImageFiles, ...newFileIndices];

    console.log(
      `✅ [Variant ${variantIndex}] imageFiles النهائي:`,
      updatedImageFiles
    );

    // إنشاء blob URLs للعرض المؤقت
    const blobUrls = filesArray.map((file) => URL.createObjectURL(file));
    const currentImages = variants[variantIndex].images || [];
    const updatedImages = [...currentImages, ...blobUrls];

    // تحديث المتغير
    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      imageFiles: updatedImageFiles,
      images: updatedImages,
    };

    onVariantsChange(newVariants);

    console.log(`🎨 [Variant ${variantIndex}] البيانات النهائية:`, {
      color: newVariants[variantIndex].color,
      imageFilesCount: updatedImageFiles.length,
      imageFiles: updatedImageFiles,
      imagesCount: updatedImages.length,
    });

    // تنظيف blob URLs بعد 5 دقائق
    setTimeout(() => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    }, 5 * 60 * 1000);
  };

  const handleRemoveImage = (variantIndex: number, imageIndex: number) => {
    const variant = variants[variantIndex];
    const newImages = [...variant.images];
    const newImageFiles = [...(variant.imageFiles || [])];

    // حساب عدد الصور القديمة (غير blob)
    const oldImagesCount = variant.images.filter(
      (img) => !img.startsWith("blob:")
    ).length;

    // إذا كانت الصورة المحذوفة هي blob (صورة جديدة)
    if (imageIndex >= oldImagesCount) {
      const blobIndex = imageIndex - oldImagesCount;
      URL.revokeObjectURL(newImages[imageIndex]);

      // حذف الـ file index المقابل
      if (newImageFiles.length > blobIndex) {
        newImageFiles.splice(blobIndex, 1);
      }
    }

    newImages.splice(imageIndex, 1);

    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      images: newImages,
      imageFiles: newImageFiles,
    };

    onVariantsChange(newVariants);

    console.log(`🗑️ [Variant ${variantIndex}] تم حذف صورة:`, {
      remainingImages: newImages.length,
      remainingImageFiles: newImageFiles,
    });
  };

  const handleAddSize = (variantIndex: number) => {
    const sizeInput = sizeInputs[variantIndex]?.trim();
    if (!sizeInput) return;

    const currentSizes = variants[variantIndex].sizes || [];
    if (!currentSizes.includes(sizeInput)) {
      handleVariantChange(variantIndex, "sizes", [...currentSizes, sizeInput]);
    }
    setSizeInputs({ ...sizeInputs, [variantIndex]: "" });
  };

  const handleRemoveSize = (variantIndex: number, size: string) => {
    const currentSizes = variants[variantIndex].sizes;
    handleVariantChange(
      variantIndex,
      "sizes",
      currentSizes.filter((s) => s !== size)
    );
  };

  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">المتغيرات (الألوان)</h3>
        <button
          type="button"
          onClick={handleAddVariant}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2"
        >
          + إضافة لون
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          لم يتم إضافة أي متغيرات بعد.
        </p>
      ) : (
        variants.map((variant, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-lg">
                المتغير {index + 1}
                {variant.imageFiles && variant.imageFiles.length > 0 && (
                  <span className="text-sm text-green-600 mr-2">
                    ({variant.imageFiles.length} صورة جديدة)
                  </span>
                )}
              </h4>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
  <label className="block text-sm font-medium mb-1">كود المتغير</label>
  <input
    type="text"
    value={variant.code || ""}
    onChange={(e) => {
      const newVariants = [...variants];
      newVariants[index].code = e.target.value;
      onVariantsChange(newVariants);
    }}
    placeholder={`مثال: VAR-${index + 1}`}
    className="w-full p-2 border rounded-lg"
  />
</div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  اللون *
                </label>
                <input
                  type="text"
                  value={variant.color}
                  onChange={(e) =>
                    handleVariantChange(index, "color", e.target.value)
                  }
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="أدخل اسم اللون"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  السعر (دينار)
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
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  الكمية المتاحة *
                </label>
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
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* المقاسات */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                المقاسات المتاحة
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={sizeInputs[index] || ""}
                  onChange={(e) =>
                    setSizeInputs({ ...sizeInputs, [index]: e.target.value })
                  }
                  placeholder="مثال: M, L, XL"
                  className="flex-1 p-2 border rounded-lg"
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
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  إضافة
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {variant.sizes.map((size, sizeIndex) => (
                  <div
                    key={sizeIndex}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index, size)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* الوصف */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                وصف المتغير
              </label>
              <textarea
                value={variant.description || ""}
                onChange={(e) =>
                  handleVariantChange(index, "description", e.target.value)
                }
                className="w-full p-2 border rounded-lg"
                rows={2}
                placeholder="اختياري"
              />
            </div>

            {/* رفع الصور */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                صور هذا اللون *
              </label>

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
                className="cursor-pointer inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Upload size={18} /> رفع صور جديدة
              </label>

              {variant.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                  {variant.images.map((image, imgIndex) => {
                    const isNewImage = image.startsWith("blob:");
                    return (
                      <div
                        key={imgIndex}
                        className={`relative rounded-lg overflow-hidden border-2 ${
                          isNewImage ? "border-blue-500" : "border-gray-200"
                        }`}
                      >
                        <div className="aspect-square relative bg-gray-100">
                          <Image
                            src={image}
                            alt={`صورة ${imgIndex + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width:200px) 100vw, 200px"
                          />
                          {isNewImage && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              جديد
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, imgIndex)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
