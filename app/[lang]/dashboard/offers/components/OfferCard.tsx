"use client";
import { confirmAction } from "@/app/components/AdminConfirm";
import { memo } from "react";
import { Edit, Trash2, Eye, EyeOff, Tag } from "lucide-react";
import Image from "next/image";
import { Offer, OfferCardProps } from "@/types/offers";
import { OFFER_TYPES } from "@/constants/offers";
import { OfferType } from "@prisma/client";

export const OfferCard = memo(
  ({ offer, onEdit, onDelete, onToggleStatus }: OfferCardProps) => {
    const getOfferDetails = (offer: Offer) => {
      switch (offer.offerType) {
        case OfferType.SIMPLE:
          return "عرض بسيط";
        case OfferType.PERCENTAGE_DISCOUNT:
          return `خصم ${offer.discountPercentage}%`;
        case OfferType.FIXED_AMOUNT_DISCOUNT:
          return `خصم ${offer.discountAmount} جنية مصري `;
        case OfferType.FIXED_PRICE:
          return `سعر ${offer.fixedPrice} جنية مصري`;
        default:
          return "عرض خاص";
      }
    };

    const handleDeleteClick = async () => {
      if (await confirmAction(`هل أنت متأكد أنك تريد حذف العرض "${offer.title}"؟`)) {
        onDelete(offer.id);
      }
    };

    const getOfferIcon = (offerType: OfferType) => {
      const type = OFFER_TYPES.find((t) => t.value === offerType);
      return type?.icon || "🎁";
    };

    const hasDate = offer.startDate || offer.endDate;

    return (
      <div className="fl-pcard !p-0 overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-gold/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getOfferIcon(offer.offerType)}</span>
            <h3 className="fl-display text-xl text-primary">{offer.title}</h3>
          </div>
          <button
            className={`p-2 rounded-full ${
              offer.isActive
                ? "bg-gold/25 text-primary"
                : "bg-secondary text-primary/70"
            }`}
            onClick={() => onToggleStatus(offer.id)}
          >
            {offer.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {offer.image && (
          <div className="relative aspect-video">
            <Image
              fill
              src={offer.image}
              className="object-cover"
              alt={offer.title}
            />
          </div>
        )}

        {/* Content - هذا القسم سيمتد لملء المساحة المتاحة */}
        <div className="p-4 space-y-2 flex-grow">
          <div className="text-sm font-medium text-primary/85">
            {getOfferDetails(offer)}
          </div>

          {/* التاريخ - سيظهر فقط إذا كان موجودًا */}
          {hasDate && (
            <div className="text-xs text-primary/70">
              {offer.startDate &&
                `من ${new Date(offer.startDate).toLocaleDateString("ar")}`}
              {offer.endDate &&
                ` إلى ${new Date(offer.endDate).toLocaleDateString("ar")}`}
            </div>
          )}

          <div className="text-xs text-primary">
            <Tag size={12} className="inline mr-1" />
            {offer.products?.length ?? 0} منتج
          </div>
        </div>

        {/* Buttons - ستكون دائمًا في الأسفل */}
        <div className="p-4 border-t border-gold/40">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(offer)}
              className="flex-1 bg-primary text-primary-foreground min-h-11 rounded-full flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
            >
              <Edit size={16} />
              تعديل
            </button>
            <button
              onClick={handleDeleteClick}
              className="fl-danger flex-1 min-h-11 rounded-full flex items-center justify-center gap-1"
            >
              <Trash2 size={16} />
              حذف
            </button>
          </div>
        </div>
      </div>
    );
  }
);

OfferCard.displayName = "OfferCard";
