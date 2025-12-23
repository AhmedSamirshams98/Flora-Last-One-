"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useOffersStore } from "@/store/offers-store";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import logo from "@/public/images/logo.png";
import EmblaCarousel from "../../emblaCarousel/EmblaCarousel";
import AOS from "aos";
import "aos/dist/aos.css";
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
import Head from "next/head";

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
  const activeOffers = useMemo(
    () => getActiveOffers(offers, now),
    [offers, now]
  );

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
          className="relative w-full min-h-[65vh] md:min-h-[600px] rounded-lg overflow-hidden"
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
            quality={75}
          />
          <div className="absolute left-0 right-0 w-full  bg-gradient-to-r  to-transparent md:from-black/70 md:via-black/50 flex items-center">
            <div className="container mx-auto px-10 ml-3 font-gess">
              <div className="max-w-full sm:max-w-md md:max-w-lg bg-black/20 backdrop-blur-lg  rounded-xl md:rounded-2xl p-3 border border-white/10 md:border-white/20">
                {offer.title && (
                  <h1
                    className={` ${
                      lang === "ar" ? "font-gess" : "font-sans"
                    }  text-2xl md:text-4xl mb-2 sm:mb-3 md:mb-4 text-white font-bold drop-shadow-2xl leading-tight`}
                  >
                    {isArabic ? offer.title : offer.titleEn}
                  </h1>
                )}

                {offer.subtitle && (
                  <p
                    className={` ${
                      lang === "ar" ? "font-gess" : "font-sans"
                    } text-white text-sm md:text-xl mb-1 sm:mb-2 font-light drop-shadow-lg`}
                  >
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

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [activeOffers]);
  if (loading) return <Skeleton />;

  if (activeOffers.length === 0) {
    return (
      <section id="offers" className="bg-secondary py-6" data-aos="fade-left">
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
    <>
      <Head>
        <title>{t.offers.title} | Flora Store</title>
        <meta
          name="description"
          content={
            lang === "ar"
              ? "اكتشف أحدث العروض من فلورا ستور للشنط والأحذية النسائية في مصر – كفر الشيخ"
              : "Discover the latest offers from Flora Store for women's shoes and bags in Egypt – Kafr El Sheikh"
          }
        />
        <meta
          name="keywords"
          content="شنط نسائية, أحذية نسائية, عروض فلورا ستور, flora store egypt, woman shoes, woman bags"
        />
      </Head>
      <section id="offers" className=" py-6" data-aos="fade-left">
        <div className="container mx-auto px-4">
          <h1 className="font-gess text-center text-primary font-medium text-3xl mb-3 ">
            {t.offers.title}
          </h1>
          <EmblaCarousel slides={slides} options={EMBLA_OPTIONS} />
        </div>
      </section>
    </>
  );
}
