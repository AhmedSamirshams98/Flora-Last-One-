import { X, Upload } from "lucide-react";
import Image from "next/image";

interface VariantsSectionProps {
  formData: any;
  sizeInputs: Record<number, string>;
  setSizeInputs: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  uploadedFiles: Record<number, File[]>;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onVariantChange: (index: number, field: string, value: any) => void;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  onRemoveImage: (variantIndex: number, imageIndex: number) => void;
}

export default function VariantsSection({
  formData,
  sizeInputs,
  setSizeInputs,
  uploadedFiles,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  onImageUpload,
  onRemoveImage,
}: VariantsSectionProps) {
  const handleAddSize = (variantIndex: number) => {
    const sizeInput = sizeInputs[variantIndex]?.trim();
    if (!sizeInput) return;

    const currentSizes = formData.variants[variantIndex].sizes || [];
    if (!currentSizes.includes(sizeInput)) {
      const newSizes = [...currentSizes, sizeInput];
      onVariantChange(variantIndex, "sizes", newSizes);
    }
    setSizeInputs((prev) => ({ ...prev, [variantIndex]: "" }));
  };

  const handleRemoveSize = (variantIndex: number, size: string) => {
    const currentSizes =
      (formData.variants[variantIndex].sizes as string[]) || [];
    const newSizes = currentSizes.filter((s) => s !== size);
    onVariantChange(variantIndex, "sizes", newSizes);
  };

  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">المتغيرات (الألوان)</h3>
        <button
          type="button"
          onClick={onAddVariant}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          + إضافة لون
        </button>
      </div>

      {formData.variants.map((variant: any, index: number) => (
        <div key={index} className="border p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">المتغير {index + 1}</h4>
            {formData.variants.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveVariant(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* حقول المتغير */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">اللون *</label>
              <input
                type="text"
                value={variant.color}
                onChange={(e) =>
                  onVariantChange(index, "color", e.target.value)
                }
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">سعر هذا اللون</label>
              <input
                type="number"
                value={variant.price || ""}
                onChange={(e) =>
                  onVariantChange(
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
                  onVariantChange(index, "stock", parseInt(e.target.value) || 0)
                }
                required
                min="0"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* المقاسات */}
          <div className="mt-4">
            <label className="block text-sm mb-2">المقاسات المتاحة *</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sizeInputs[index] || ""}
                onChange={(e) =>
                  setSizeInputs((prev) => ({
                    ...prev,
                    [index]: e.target.value,
                  }))
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

            {variant.sizes?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {variant.sizes.map((size: string, sizeIndex: number) => (
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

          {/* الوصف */}
          <div className="mt-4">
            <label className="block text-sm mb-2">وصف المتغير</label>
            <textarea
              value={variant.description || ""}
              onChange={(e) =>
                onVariantChange(index, "description", e.target.value)
              }
              className="w-full p-2 border rounded"
              rows={2}
              placeholder="وصف خاص بهذا المتغير..."
            />
          </div>

          {/* رفع الصور */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              صور هذا اللون *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onImageUpload(e, index)}
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
                  {variant.images.map((image: string, imgIndex: number) => (
                    <div key={imgIndex} className="relative">
                      <div className="w-full h-20 relative">
                        <Image
                          unoptimized
                          src={image}
                          alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveImage(index, imgIndex)}
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
  );
}
