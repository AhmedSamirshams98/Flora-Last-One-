"use client";

import {  offerListProps } from "@/types/offers";
import { OfferCard } from "./OfferCard";



export function OffersList({
  offers,
  onEdit,
  onDelete,
  onToggleStatus,
}: offerListProps) {
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
