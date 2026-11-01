"use client";

/* Every colour of a product at a glance, in the shop's pop-up (drawn into <body>, Esc closes). */

import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import AdminModal from "@/app/components/AdminModal";

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

export default function AllVariantsPopup({ isOpen, onClose, productName, variants }: AllVariantsPopupProps) {
  const pathname = usePathname();
  if (!isOpen) return null;
  const isAr = !pathname.startsWith("/en");

  return (
    <AdminModal onClose={onClose} label={productName} wide dir={isAr ? "rtl" : "ltr"}>
      <div className={`p-5 ${isAr ? "font-gess" : ""}`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 lang={isAr ? "ar" : "en"} className="fl-display text-2xl text-primary">
            {productName}
          </h3>
          <button
            onClick={onClose}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="grid h-11 w-11 place-items-center rounded-full text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {variants.map((variant) => (
            <li key={variant.id} className="fl-pcard !p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
                {variant.images[0] && (
                  <Image src={variant.images[0]} alt="" fill sizes="(max-width: 768px) 46vw, 220px" className="object-cover" />
                )}
              </div>
              <div className="px-1 pt-2 text-center">
                <p className="text-primary">{variant.color}</p>
                <p className="text-sm text-primary/70">
                  {variant.sizes?.join(", ") || (isAr ? "بدون مقاسات" : "No sizes")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminModal>
  );
}
