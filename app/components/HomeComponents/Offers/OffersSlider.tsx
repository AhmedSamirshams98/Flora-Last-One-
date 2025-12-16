"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useOffersStore } from "@/store/offers-store";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import logo from "@/public/images/logo.png";
import EmblaCarousel from "../../emblaCarousel/EmblaCarousel";
import {
  formatDate,
  getOfferDetails,
  getActiveOffers,
  EMBLA_OPTIONS,
  GRADIENT_STYLES,
  IMAGE_SETTINGS,
} from "./utils";
import { Skeleton } from "./Skeleton";
import { useShallow } from "zustand/shallow";
import { OfferWithoutImage } from "./OfferWithoutImage";

interface OffersSliderProps {
  lang: "ar" | "en";
}

export default function OffersSlider({ lang }: OffersSliderProps) {
  const t = lang === "ar" ? ar : en;
  const { offers, loading, fetchOffers } = useOffersStore(
    useShallow((state) => ({
      offers: state.offers,
      loading: state.loading,
      fetchOffers: state.fetchOffers,
    }))
  );
  const now = useMemo(() => new Date(), []);
  const nowDate = useMemo(() => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [now]);

  // تصفية العروض باستخدام useMemo
  const activeOffers = useMemo(
    () => getActiveOffers(offers, now, nowDate),
    [offers, now, nowDate]
  );

  // إنشاء slides باستخدام useMemo
  const slides = useMemo(() => {
    return activeOffers.map((offer, index) => {
      const isFirst = index === 0;
      const isArabic = lang === "ar";
      const direction = isArabic ? "rtl" : "ltr";

      if (!offer.image) {
        return (
          <div key={offer.id} className="font-gess" style={{ direction }}>
            <OfferWithoutImage offer={offer} t={t} lang={lang} />
          </div>
        );
      }

      return (
        <div
          key={offer.id}
          className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden"
          style={{ direction }}
        >
          <Image
            src={offer.image}
            fill
            alt={
              offer.title ||
              "Flora Store Offer فلورا للشنط والاحذيه flora egypt flora store flora egypt store فلورا كفر الشيخ"
            }
            className="w-full h-full object-cover"
            priority={isFirst}
            sizes={IMAGE_SETTINGS.sizes}
            quality={IMAGE_SETTINGS.quality}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent md:from-black/70 md:via-black/50 flex items-center">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 font-gess">
              <div className="max-w-full sm:max-w-md md:max-w-lg bg-black/20 md:bg-black/30 backdrop-blur-sm md:backdrop-blur-md rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 md:border-white/20 shadow-lg md:shadow-2xl">
                {offer.title && (
                  <h1 className="text-2xl md:text-4xl mb-2 sm:mb-3 md:mb-4 text-white font-bold drop-shadow-2xl leading-tight">
                    {isArabic ? offer.title : offer.titleEn}
                  </h1>
                )}

                {offer.subtitle && (
                  <p className="text-white text-sm md:text-xl mb-1 sm:mb-2 font-light drop-shadow-lg">
                    {isArabic ? offer.subtitle : offer.subtitleEn}
                  </p>
                )}

                <div className="text-white text-sm md:text-xl font-light mb-2 drop-shadow-lg flex items-center gap-2">
                  <span className={isArabic ? "font-gess" : "font-sans"}>
                    {getOfferDetails(offer, t, lang)}
                  </span>
                </div>

                {(offer.startDate || offer.endDate) && (
                  <div className="mt-4 p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs text-white/90">
                      {offer.startDate && (
                        <div
                          className={`flex items-center gap-1 ${
                            isArabic ? "font-gess" : "font-sans"
                          }`}
                        >
                          <span className="bg-green-500/80 text-white px-1.5 py-0.5 rounded text-xs">
                            {t.offers.starts}
                          </span>
                          <span className="text-xs">
                            {formatDate(offer.startDate, lang)}
                          </span>
                        </div>
                      )}
                      {offer.endDate && (
                        <div
                          className={`flex items-center gap-1 ${
                            isArabic ? "font-gess" : "font-sans"
                          }`}
                        >
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
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [activeOffers, t, lang]);

  // مكون رسالة عدم وجود عروض
  const NoOffersMessage = ({ lang }: { lang: "ar" | "en" }) => (
    <div
      className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg flex items-center justify-center"
      style={{ background: GRADIENT_STYLES.withoutImage }}
    >
      <div className="text-center flex flex-col items-center gap-2 p-8">
        <Image
          className="w-44"
          src={logo}
          alt={
            lang === "ar"
              ? "الصفحة الرئيسية لفلورا ستور  فلورا ستور كفر الشيخ فلورا للشنط والاحذيه شنط واحذيه نسائيه كفر الشيخ "
              : "Flora Store Homepage flora store kafrelshiekh flora store for woman shoes and bags "
          }
          priority
          width={IMAGE_SETTINGS.logoSize.width}
          height={IMAGE_SETTINGS.logoSize.height}
          sizes="176px"
        />
        <h3 className="text-2xl md:text-3xl font-bold mt-6 text-white mb-2 font-gess drop-shadow-lg">
          {lang === "ar" ? "لا توجد عروض حالياً" : "No Offers Available"}
        </h3>
        <p className="text-white/90 font-gess drop-shadow-md">
          {lang === "ar"
            ? "ترقبوا عروضنا القادمة قريباً"
            : "Stay tuned for upcoming offers!"}
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // التصيير الشرطي بعد كل الـ Hooks
  if (loading) return <Skeleton />;

  if (activeOffers.length === 0) {
    return (
      <section id="offers" className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-gess font-semibold text-center text-primary text-3xl mb-6 mt-2">
            {t.offers.title}
          </h1>
          <NoOffersMessage lang={lang} />
        </div>
      </section>
    );
  }

  return (
    <section id="offers" className="bg-secondary py-6">
      <div className="container mx-auto px-4">
        <h1 className="font-gess text-center text-primary font-semibold text-3xl mb-2 mt-2">
          {t.offers.title}
        </h1>
        <EmblaCarousel slides={slides} options={EMBLA_OPTIONS} />
      </div>
    </section>
  );
}
