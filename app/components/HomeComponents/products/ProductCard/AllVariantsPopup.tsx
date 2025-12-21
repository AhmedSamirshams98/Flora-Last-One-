"use client";
import Image from "next/image";

interface Variant {
  id: string;
  color: string;
  images: string[];
  sizes?: string[];
}

interface AllVariantsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variants: Variant[];
}

export default function AllVariantsPopup({
  isOpen,
  onClose,
  productName,
  variants,
}: AllVariantsPopupProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">{productName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="border rounded-lg overflow-hidden"
            >
              <div className="relative aspect-square">
                <Image
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  src={variant.images[0] || "/placeholder.jpg"}
                  alt={variant.color}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2 text-center">
                <div className="font-medium">{variant.color}</div>
                <div className="text-sm text-gray-500">
                  {variant.sizes?.join(", ") || "No sizes"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}