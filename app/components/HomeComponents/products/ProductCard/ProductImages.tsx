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

/* The picture sits on a soft ivory tile, no frame and no shadow (after the minimalist
   category page). A second picture is reached with the small arrows on hover. */
export default function ProductImages({
  currentImages,
  currentImageIndex,
  productName,
  variantColor,
  onPrevImage,
  onNextImage,
  lang,
}: ProductImagesProps) {
  const arrow =
    "absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-primary opacity-0 transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 max-md:hidden";
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3eee6]">
      <Image
        quality={75}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 22vw"
        src={currentImages[currentImageIndex]}
        alt={`${productName} - ${variantColor}`}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
      />

      {currentImages.length > 1 && (
        <>
          <button
            onClick={onPrevImage}
            aria-label={lang === "ar" ? "الصورة السابقة" : "Previous picture"}
            className={`${arrow} left-2`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={onNextImage}
            aria-label={lang === "ar" ? "الصورة التالية" : "Next picture"}
            className={`${arrow} right-2`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
