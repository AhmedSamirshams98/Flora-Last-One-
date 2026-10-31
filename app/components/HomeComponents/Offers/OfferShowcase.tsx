"use client";

/* The offers, under the hero (after the glass banner on Dribbble "Banner Design For Website").
   Each offer is a rounded banner: the poster itself, enlarged and blurred, is the ground
   (so every banner takes its colours from its own offer), a dark veil keeps the words
   readable, a frosted glass panel carries the name, the real offer data and the button,
   and the sharp poster sits beside it in a thin gold frame.
   Several offers: one banner at a time (auto, swipe, arrows, dots, pause).
   No active offer → nothing is drawn. */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import { Offer } from "@/types/offers";
import { formatDate, getOfferDetails } from "./utils";
import type { DealOffer } from "./types";
import "../home.css";

export default function OfferShowcase({ lang, offers }: { lang: "ar" | "en"; offers: DealOffer[] }) {
  const n = offers.length;
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false); // pause button, or the visitor took over
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = useCallback(
    (d: number) => {
      setStopped(true);
      setActive((a) => (a + d + n) % n);
    },
    [n]
  );
  useEffect(() => {
    if (n < 2 || hover || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % n), 8000);
    return () => clearTimeout(id);
  }, [active, n, hover, stopped]);

  if (n === 0) return null;
  const isAr = lang === "ar";
  const t = isAr ? ar : en;
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const href = `/${lang}/products`;
  const cta = isAr ? "تسوّقي العرض" : "Shop the offer";

  return (
    <section id="offers" className="container mx-auto px-4 pb-0 pt-12 md:pt-16" dir={isAr ? "rtl" : "ltr"}>
      <div
        aria-roledescription={n > 1 ? "carousel" : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onKeyDown={(e) => {
          if (n < 2) return;
          if (e.key === "ArrowLeft") go(isAr ? 1 : -1);
          if (e.key === "ArrowRight") go(isAr ? -1 : 1);
        }}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const st = touch.current;
          touch.current = null;
          if (!st || n < 2) return;
          const dx = e.changedTouches[0].clientX - st.x;
          const dy = e.changedTouches[0].clientY - st.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(isAr ? (dx > 0 ? 1 : -1) : dx < 0 ? 1 : -1);
        }}
      >
        {/* every banner sits in the same grid cell, so the box is as tall as the tallest and never jumps */}
        <div className="grid touch-pan-y">
        {offers.map((o, i) => {
          const on = i === active;
          const name = isAr ? o.title : o.titleEn || o.title;
          const chips = [
            getOfferDetails(o as unknown as Offer, t, lang),
            o.endDate ? `${t.offers.ends} ${formatDate(o.endDate, lang)}` : "",
          ].filter(Boolean);
          return (
            <div
              key={o.id}
              role="group"
              aria-roledescription={n > 1 ? "slide" : undefined}
              aria-label={n > 1 ? `${i + 1} / ${n}` : undefined}
              aria-hidden={on ? undefined : true}
              className={`[grid-area:1/1] transition-opacity duration-700 ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Link
                href={href}
                aria-label={name}
                tabIndex={on ? undefined : -1}
                className="fl-offer group relative isolate block overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground"
              >
                {/* ground: the poster, enlarged and blurred */}
                {o.image && (
                  <Image
                    src={o.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="320px"
                    quality={40}
                    className="-z-20 scale-125 object-cover blur-2xl"
                  />
                )}
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgb(36_16_5/0.62),rgb(61_37_18/0.34))]" />

                <div className="grid items-center gap-6 p-5 md:grid-cols-[1fr_auto] md:gap-12 md:p-8 lg:px-14">
                  {/* glass panel */}
                  <div className="fl-glass order-2 rounded-3xl p-6 md:order-none md:max-w-xl md:justify-self-start md:p-9">
                    <h2 lang={lang} className="fl-display text-[clamp(1.7rem,3.6vw,3.2rem)] leading-tight text-[#fff7ee]">
                      {name}
                    </h2>
                    {chips.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {chips.map((c) => (
                          <span
                            key={c}
                            className={`rounded-full border border-[#fff7ee]/25 bg-[#fff7ee]/12 px-3 py-1 text-sm text-[#fff7ee] ${isAr ? "font-gess" : ""}`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className={`fl-btn-gold mt-7 ${isAr ? "font-gess" : ""}`}>
                      {cta}
                      <Arrow aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>

                  {/* the sharp poster */}
                  {o.image && (
                    <div className="relative mx-auto aspect-[4/5] w-36 rounded-2xl border border-gold/60 p-1 md:w-64 lg:w-72">
                      <div className="relative h-full w-full overflow-hidden rounded-xl">
                        <Image
                          src={o.image}
                          alt={name}
                          fill
                          sizes="(max-width: 768px) 11rem, 18rem"
                          quality={85}
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
        </div>

        {n > 1 && (
          <div dir="ltr" className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(isAr ? 1 : -1)}
              className="fl-ctl fl-ctl-light !h-11 !w-11 rounded-full"
              aria-label={isAr ? "السابق" : "Previous"}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex items-center" role="tablist">
              {offers.map((o, i) => (
                <button
                  key={o.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`${i + 1}`}
                  onClick={() => {
                    setStopped(true);
                    setActive(i);
                  }}
                  className="group flex h-11 items-center justify-center px-2.5"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all ${
                      i === active ? "w-8 bg-gold" : "w-1.5 bg-primary/30 group-hover:bg-primary/60"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStopped((v) => !v)}
              className="fl-ctl fl-ctl-light !h-11 !w-11 rounded-full"
              aria-label={stopped ? (isAr ? "تشغيل التبديل التلقائي" : "Play slideshow") : isAr ? "إيقاف التبديل التلقائي" : "Pause slideshow"}
            >
              {stopped ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => go(isAr ? -1 : 1)}
              className="fl-ctl fl-ctl-light !h-11 !w-11 rounded-full"
              aria-label={isAr ? "التالي" : "Next"}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
