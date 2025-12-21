"use client";
import { ShoppingCart, X, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ProductSizesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantColor: string;
  variantImages: string[];
  finalPrice: number;
  sizes?: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  stock: number;
  lang: "ar" | "en";
}

export default function ProductSizesPopup({
  isOpen,
  onClose,
  productName,
  variantColor,
  variantImages,
  finalPrice,
  sizes,
  selectedSize,
  onSizeSelect,
  onAddToCart,
  stock,
  lang,
}: ProductSizesPopupProps) {
  if (!isOpen) return null;

  const hasSizes = sizes && sizes.length > 0;
  const isOutOfStock = stock === 0;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{productName}</h3>
            <p className="text-sm text-gray-600">{variantColor}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="p-4 border-b">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                quality={80}
                src={variantImages[0] || "/placeholder.jpg"}
                alt={variantColor}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{productName}</h4>
              <p className="text-sm text-gray-600 mb-2">{variantColor}</p>
              <div className="text-lg font-bold text-primary">
                {finalPrice.toLocaleString()} EGP
              </div>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold">Select Size</h4>
            {selectedSize && (
              <span className="text-sm text-primary">Selected: {selectedSize}</span>
            )}
          </div>

          {hasSizes ? (
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onSizeSelect(size)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                    selectedSize === size
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium">{size}</span>
                  {selectedSize === size && (
                    <Check className="w-4 h-4 mt-1 text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No sizes available for this product
            </div>
          )}

          {/* Size Guide */}
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Size Guide
          </button>
        </div>

        {/* Stock Status */}
        <div className="p-4 border-b">
          {isOutOfStock ? (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>This item is currently out of stock</span>
            </div>
          ) : stock < 10 ? (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Only {stock} items left in stock</span>
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>In stock - {stock} items available</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock || (hasSizes && !selectedSize)}
            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors ${
              isOutOfStock || (hasSizes && !selectedSize)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            {selectedSize && ` - Size: ${selectedSize}`}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}