"use client";

/* Home hero — the slogan over a 3D stage of product pictures (after the "moving 3D carousel" brief).
   One picture is in front; the others sit behind it in depth, turned gently inwards, fading and blurring
   with distance. It advances every 2 seconds by itself (paused while the pointer or focus is on it,
   off screen, or when the visitor prefers reduced motion). Arrows, dots, the keyboard, a swipe and a
   click on a side picture all move it too. */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeProduct } from "./types";
import { Actions, Headline, Promises, SUBCOPY } from "./HeroParts";
import "../home.css";

export type StageItem = { id: string; image: string; alt: string; href: string };

const EVERY = 2000; // ms between automatic moves
const SWIPE = 48; // px of horizontal travel that counts as a swipe
const MIN_CARDS = 7; // the ring needs 7 so that the hidden ones sit behind the visible five

const EYEBROW = {
  ar: "فلورا مصر · أحذية وحقائب",
  en: "Flora Egypt · Shoes & Bags",
};

export default function StageHero({
  lang,
  products,
  extra = [],
}: {
  lang: "ar" | "en";
  products: HomeProduct[];
  /** more pictures (e.g. categories) when there are few products */
  extra?: StageItem[];
}) {
  const isAr = lang === "ar";
  const base: StageItem[] = [
    ...products.map((p) => ({ id: p.id, image: p.image, alt: p.name, href: `/${lang}/product/${p.id}` })),
    ...extra,
  ].slice(0, 9); // nine pictures are plenty for one ring (and for the dots)
  // the ring needs enough cards: repeat the pictures if there are few
  const items: StageItem[] = [];
  if (base.length) while (items.length < Math.max(MIN_CARDS, base.length)) items.push(...base);
  const n = items.length;

  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer over the stage, or focus inside it
  const [visible, setVisible] = useState(true);
  const [reduce, setReduce] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const swallow = useRef(false);

  const go = useCallback((to: number) => setActive(((to % n) + n) % n), [n]);
  const next = useCallback(() => setActive((a) => (a + 1) % n), [n]);
  const prev = useCallback(() => setActive((a) => (a - 1 + n) % n), [n]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const el = root.current;
    const io = el ? new IntersectionObserver(([e]) => setVisible(e.isIntersecting)) : null;
    if (el && io) io.observe(el);
    return () => {
      mq.removeEventListener("change", sync);
      io?.disconnect();
    };
  }, []);

  // the timer restarts after every move (so a click is never followed by an instant second move)
  useEffect(() => {
    if (n < 2 || reduce || held || !visible) return;
    const t = setInterval(() => {
      if (!document.hidden) next();
    }, EVERY);
    return () => clearInterval(t);
  }, [active, n, reduce, held, visible, next]);

  if (n === 0) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.moved) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    // a meaningful, mostly horizontal travel; vertical scrolling is left to the browser (touch-action: pan-y)
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.4) {
      d.moved = true;
      swallow.current = true;
      if (dx < 0) next();
      else prev();
    }
  };
  const onUp = () => {
    drag.current = null;
    if (swallow.current) setTimeout(() => (swallow.current = false), 0);
  };

  const offsetOf = (i: number) => {
    let d = (((i - active) % n) + n) % n;
    if (d > n / 2) d -= n;
    return d;
  };

  const pad = (k: number) => String((k % base.length) + 1).padStart(2, "0");

  return (
    <section
      id="top"
      ref={root}
      dir={isAr ? "rtl" : "ltr"}
      className="fl-stage fl-hero relative overflow-hidden rounded-b-[2.5rem] pb-6 pt-10 text-primary-foreground md:pt-14"
      aria-roledescription="carousel"
      aria-label={isAr ? "منتجات مختارة" : "Selected products"}
    >
      <div className="container relative mx-auto px-4 text-center">
        <span className="fl-st-eyebrow">
          <i aria-hidden="true" />
          {EYEBROW[lang]}
        </span>
        <Headline
          lang={lang}
          className="mx-auto mt-5 max-w-4xl text-[clamp(2.3rem,6.4vw,5.2rem)] leading-[1.12] text-[#fff7ee]"
        />
        <p
          className={`mx-auto mt-5 max-w-xl text-base leading-8 text-primary-foreground/80 md:text-xl ${isAr ? "font-gess" : ""}`}
        >
          {SUBCOPY[lang]}
        </p>
        <div className="mt-7 flex justify-center">
          <Actions lang={lang} tone="dark" />
        </div>
      </div>

      <div
        className="fl-st-wrap"
        dir="ltr"
        onKeyDown={onKey}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false);
        }}
      >
        <div
          className="fl-st-stage"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-live={held || reduce ? "polite" : "off"}
        >
          {items.map((it, i) => {
            const d = offsetOf(i);
            const ad = Math.abs(d);
            const isActive = d === 0;
            return (
              <Link
                key={`${it.id}-${i}`}
                href={it.href}
                draggable={false}
                role="group"
                aria-roledescription="slide"
                aria-label={`${(i % base.length) + 1} / ${base.length}`}
                aria-current={isActive ? "true" : undefined}
                aria-hidden={ad > 2 ? true : undefined}
                tabIndex={isActive ? 0 : -1}
                className="fl-st-card"
                data-ad={Math.min(ad, 3)}
                style={{ "--d": d, "--ad": ad } as React.CSSProperties}
                onClick={(e) => {
                  if (swallow.current) {
                    e.preventDefault(); // the click that ends a swipe
                    return;
                  }
                  if (!isActive) {
                    e.preventDefault(); // a side picture: bring it to the front first
                    go(i);
                  }
                }}
              >
                <Image
                  src={it.image}
                  alt={it.alt}
                  fill
                  draggable={false}
                  priority={ad <= 1}
                  sizes="(max-width: 820px) 62vw, 300px"
                  className="pointer-events-none object-cover"
                />
                <span className="fl-st-shade" aria-hidden="true" />
                <span className="fl-st-info">
                  <span className={`fl-st-label ${isAr ? "font-gess" : ""}`}>{it.alt}</span>
                  <span className="fl-st-num" aria-hidden="true">
                    {pad(i)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="fl-st-arrow fl-st-prev"
          aria-label={isAr ? "السابق" : "Previous"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={prev}
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="fl-st-arrow fl-st-next"
          aria-label={isAr ? "التالي" : "Next"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={next}
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="fl-st-dots" role="group" aria-label={isAr ? "اختيار الصورة" : "Choose a slide"}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${isAr ? "الصورة" : "Slide"} ${(i % base.length) + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={i === active ? "is-on" : ""}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Promises lang={lang} tone="dark" />
      </div>
    </section>
  );
}
