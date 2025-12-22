"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ProductImagesProps {
  currentImages: string[];
  currentImageIndex: number;
  productName: string;
  variantColor: string;
  onPrevImage: (e: React.MouseEvent) => void;
  onNextImage: (e: React.MouseEvent) => void;
  lang: "ar" | "en";
}

export default function ProductImages({
  currentImages,
  currentImageIndex,
  productName,
  variantColor,
  onPrevImage,
  onNextImage,
  lang,
}: ProductImagesProps) {
  return (
    <div className="relative overflow-hidden aspect-square bg-gray-50">
      <div className="relative w-full h-full">
        <Image
          quality={75}
          loading="eager"
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          src={currentImages[currentImageIndex]}
          alt={`${productName} - ${variantColor}`}
          className="w-full h-full object-cover"
        />

        {currentImages.length > 1 && (
          <>
            <button
              onClick={onPrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 transition-all z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 transition-all z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {currentImages.length > 1 && (
        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {currentImageIndex + 1}/{currentImages.length}
          </span>
        </div>
      )}
    </div>
  );
}
