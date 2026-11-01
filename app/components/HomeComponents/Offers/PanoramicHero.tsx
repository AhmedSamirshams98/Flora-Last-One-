"use client";

/* TEST hero (idea from "Panoramic Spread Hero", 21st.dev): product pictures start as a stack
   of cards and spread into a panoramic fan. Drag (mouse or finger) and the fan folds back
   towards the stack the further you go; let go and it opens again. On a laptop the fan also
   leans towards the pointer and a card rises when you point at it. On a phone there is no pointer, so it is the spread fan
   and a tap on a card. With "reduce motion" the fan is simply shown spread and still, with
   every card a link all the same. Plain CSS (home.css) does the 3D; no animation library. */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Actions, Headline, Promises, SUBCOPY } from "./HeroParts";
import type { HomeProduct } from "./types";
import "../home.css";

export default function PanoramicHero({
  lang,
  products,
}: {
  lang: "ar" | "en";
  products: HomeProduct[];
}) {
  const isAr = lang === "ar";
  const cards = products.slice(0, 7);
  const n = cards.length;
  const [spread, setSpread] = useState(false);
  const [still, setStill] = useState(false); // reduce motion: shown spread, no movement
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStill(reduce);
    if (reduce) {
      setSpread(true);
      return;
    }
    const id = window.setTimeout(() => setSpread(true), 450); // the stack opens a moment after the page
    return () => window.clearTimeout(id);
  }, []);

  // lean towards the pointer (only where there is one, and not with reduce motion)
  useEffect(() => {
    const el = box.current;
    if (!el || still || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    };
    const leave = () => {
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [still]);

  // drag to fold: how open the fan is (1 = spread, 0 = stack) follows how far you have dragged
  useEffect(() => {
    const el = box.current;
    if (!el || still) return;
    let start: { id: number; x: number } | null = null;
    let moved = false;
    const down = (e: PointerEvent) => {
      start = { id: e.pointerId, x: e.clientX };
      moved = false;
    };
    const move = (e: PointerEvent) => {
      if (!start || start.id !== e.pointerId) return;
      const dx = e.clientX - start.x;
      if (!moved && Math.abs(dx) > 8) {
        moved = true;
        setDragging(true);
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer is already gone */
        }
      }
      if (!moved) return;
      const open = Math.max(0, 1 - Math.abs(dx) / (el.clientWidth * 0.4));
      el.style.setProperty("--s", open.toFixed(3));
    };
    const end = () => {
      if (!start) return;
      start = null;
      if (moved) {
        // swallow the click that follows a drag, then open the fan again
        const stop = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener("click", stop, { capture: true, once: true });
        window.setTimeout(() => el.removeEventListener("click", stop, true), 0);
      }
      setDragging(false);
      el.style.setProperty("--s", "1");
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, [still]);

  return (
    <section id="top" className="fl-hero relative rounded-b-[2.5rem] pb-4 pt-10 text-primary-foreground md:pt-14" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 text-center">
        <Headline
          lang={lang}
          className="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] leading-[1.1] text-[#fff7ee]"
        />
        <p className={`mx-auto mt-5 max-w-xl text-base leading-8 text-primary-foreground/80 md:text-xl ${isAr ? "font-gess" : ""}`}>
          {SUBCOPY[lang]}
        </p>
        <div className="mt-7 flex justify-center">
          <Actions lang={lang} tone="dark" />
        </div>
      </div>

      <div
        ref={box}
        className={`fl-pan ${still ? "fl-pan-still" : ""} ${dragging ? "fl-pan-drag" : ""}`}
        style={{ ["--s" as string]: spread ? 1 : 0 } as React.CSSProperties}
        dir="ltr"
      >
        <div className="fl-pan-stage">
          {cards.map((p, i) => {
            const t = i - (n - 1) / 2; // -3 .. 3, the middle card is 0
            return (
              <div
                key={p.id}
                className="fl-pan-card"
                style={
                  {
                    "--t": t,
                    "--abs": Math.abs(t),
                    zIndex: Math.round(n - Math.abs(t)),
                  } as React.CSSProperties
                }
              >
                <Link href={`/${lang}/product/${p.id}`} aria-label={p.name} className="fl-pan-link">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    priority={i < 4}
                    sizes="(max-width: 600px) 110px, 220px"
                    className="object-cover"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Promises lang={lang} tone="dark" />
      </div>
    </section>
  );
}
