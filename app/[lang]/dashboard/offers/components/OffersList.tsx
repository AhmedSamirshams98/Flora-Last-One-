"use client";

import { Offer } from "@/types/offers";
import { OfferCard } from "./OfferCard";

interface Props {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function OffersList({
  offers,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
