import React from "react";
import { Offer } from "@/types/offers";
import { GRADIENT_STYLES } from "./utils";
import { getOfferDetails, formatDate } from "./utils";
import ar from "@/messages/ar.json";

interface OfferWithoutImageProps {
  offer: Offer;
  t: typeof ar;
  lang: "ar" | "en";
}

export const OfferWithoutImage = React.memo(
  ({ offer, t, lang }: OfferWithoutImageProps) => {
    return (
      <div
        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: GRADIENT_STYLES.withImage }}
      >
        <div className="text-center text-white p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
            {offer.title}
          </h2>
          {offer.subtitle && (
            <p className="text-lg md:text-xl mb-4 opacity-90">
              {offer.subtitle}
            </p>
          )}
          <div className="text-xl md:text-2xl font-bold mb-2">
            {getOfferDetails(offer, t, lang)}
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs text-white/90">
            {offer.startDate && (
              <div className="flex items-center gap-1">
                <span className="bg-green-500/80 text-white px-1.5 py-0.5 rounded text-xs">
                  {t.offers.starts}
                </span>
                <span className="text-xs">
                  {formatDate(offer.startDate, lang)}
                </span>
              </div>
            )}
            {offer.endDate && (
              <div className="flex items-center gap-1">
                <span className="bg-red-500/80 text-white px-1.5 py-0.5 rounded text-xs">
                  {t.offers.ends}
                </span>
                <span className="text-xs">
                  {formatDate(offer.endDate, lang)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

OfferWithoutImage.displayName = "OfferWithoutImage";
