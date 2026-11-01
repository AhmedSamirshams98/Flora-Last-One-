"use client";

/* The offers as instant prints pegged to a sagging string (after "Polaroid Line Carousel", 21st.dev, MIT).
   Each offer's poster is a print; drag the line, press the arrows or the arrow keys and the prints slide
   along it, swinging on their pegs and settling with a little overshoot. The print in the middle is the
   open offer: its name, its real terms and its button sit under the line.
   No offers → nothing is drawn. With "reduce motion" the prints do not swing and the line jumps. */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";
import { Offer } from "@/types/offers";
import { formatDate, getOfferDetails } from "./utils";
import type { DealOffer } from "./types";
import "../home.css";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const stringY = (x: number, w: number, y0: number, sag: number) => {
  const t = clamp(x / w, 0, 1);
  return y0 + 4 * sag * t * (1 - t);
};
/** one step of a critically damped spring */
const springStep = (x: number, v: number, target: number, dt: number, k = 70): [number, number] => {
  const c = 2 * Math.sqrt(k);
  const nv = v + (k * (target - x) - c * v) * dt;
  return [x + nv * dt, nv];
};
/** one step of a print's swing: it lags behind the motion, gravity pulls it back, air damps it */
const swingStep = (a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] => {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt;
  return [clamp(a + nw * dt, -0.6, 0.6), nw];
};
const nearestAt = (off: number, spacing: number, n: number) => clamp(Math.round(off / spacing), 0, Math.max(0, n - 1));

const SAG = 34;
const Y0 = 22;

export default function OfferLine({ lang, offers }: { lang: "ar" | "en"; offers: DealOffer[] }) {
  const isAr = lang === "ar";
  const n = offers.length;
  // the line runs left to right; for Arabic the first offer sits on the right, so the list is reversed
  const items = isAr ? [...offers].reverse() : offers;
  const start = isAr ? n - 1 : 0;

  const [active, setActive] = useState(start);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ w: 1000, cw: 220 });
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const sim = useRef({ off: start, vel: 0, target: start, a: [] as number[], w: [] as number[] });
  const drag = useRef<null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean }>(null);
  const activeRef = useRef(start);

  const spacing = size.cw * 1.1;
  const goTo = useCallback(
    (i: number) => {
      sim.current.target = clamp(i, 0, n - 1) * spacing;
    },
    [n, spacing]
  );

  useEffect(() => {
    const el = root.current;
    if (!el || n === 0) return;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      setSize({ w, cw: Math.round(clamp(w * 0.46, 150, 250)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  // keep the line on the open print when the spacing changes
  useEffect(() => {
    sim.current.target = sim.current.off = activeRef.current * spacing;
  }, [spacing]);

  // the simulation, written straight to the DOM each frame
  useEffect(() => {
    const el = root.current;
    if (!el || n === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = sim.current;
    const { w, cw } = size;
    let visible = true;
    let raf = 0;
    let prev = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const d = drag.current;
      let lineVel: number;
      if (d && d.moved) lineVel = d.v * 1000;
      else {
        const before = S.off;
        if (reduce) {
          S.off = S.target;
          S.vel = 0;
        } else [S.off, S.vel] = springStep(S.off, S.vel, S.target, dt);
        lineVel = -(S.off - before) / Math.max(dt, 1e-3);
      }
      const gain = reduce ? 0 : 1;
      const near = nearestAt(S.off, spacing, n);
      for (let i = 0; i < n; i++) {
        const card = cards.current[i];
        if (!card) continue;
        const x = w / 2 + i * spacing - S.off;
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          card.style.visibility = "hidden";
          continue;
        }
        card.style.visibility = "visible";
        let a = S.a[i] || 0;
        let av = S.w[i] || 0;
        [a, av] = swingStep(a, av, lineVel, dt, gain);
        if (gain) a += Math.sin(now / 1300 + i * 1.7) * 0.0009;
        S.a[i] = a;
        S.w[i] = av;
        const y = stringY(x, w, Y0, SAG) - 6;
        card.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${a.toFixed(4)}rad)`;
        card.style.zIndex = String(i === near ? n + 1 : n - Math.abs(i - near));
      }
      path.current?.setAttribute("d", `M0 ${Y0} Q${w / 2} ${Y0 + 2 * SAG} ${w} ${Y0}`);
      if (near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(el);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size, spacing, n]);

  if (n === 0) return null;

  const onDown = (e: React.PointerEvent) => {
    if (n < 2) return;
    drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
      try {
        root.current?.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer is already gone: keep dragging without capture */
      }
    }
    if (!d.moved) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const max = (n - 1) * spacing;
    let off = d.off - dx;
    if (off < 0) off *= 0.35;
    if (off > max) off = max + (off - max) * 0.35;
    sim.current.off = off;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      setDragging(false);
      sim.current.vel = -d.v * 1000;
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n));
      return;
    }
    const card = (e.target as HTMLElement).closest("[data-i]");
    if (card) goTo(Number(card.getAttribute("data-i")));
  };
  const step = (dir: number) => goTo(clamp(activeRef.current + dir, 0, n - 1));
  const onKey = (e: React.KeyboardEvent) => {
    if (n < 2) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };

  const t = isAr ? ar : en;
  const o = items[active] ?? items[0];
  const name = isAr ? o.title : o.titleEn || o.title;
  const chips = [
    getOfferDetails(o as unknown as Offer, t, lang),
    o.endDate ? `${t.offers.ends} ${formatDate(o.endDate, lang)}` : "",
  ].filter(Boolean);
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const cardH = (size.cw - 20) * 1.25 + 22;
  const stageH = Y0 + SAG + 10 + cardH + 28;
  // the "position" shown to the visitor follows the reading order (first offer = 1)
  const pos = isAr ? n - active : active + 1;

  return (
    <section id="offers" className="container mx-auto px-4 pb-0 pt-12 md:pt-16" dir={isAr ? "rtl" : "ltr"}>
      <div
        ref={root}
        className="fl-line"
        data-drag={dragging ? "1" : "0"}
        style={{ height: stageH, ["--cw" as string]: `${size.cw}px` }}
        role="region"
        aria-roledescription={n > 1 ? "carousel" : undefined}
        aria-label={isAr ? "العروض" : "Offers"}
        tabIndex={n > 1 ? 0 : undefined}
        dir="ltr"
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <svg className="fl-line-string" aria-hidden="true">
          <path ref={path} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {items.map((it, i) => (
          <div
            key={it.id}
            className="fl-line-card"
            data-i={i}
            data-on={i === active ? "1" : "0"}
            ref={(el) => {
              cards.current[i] = el;
            }}
            aria-hidden={i === active ? undefined : true}
          >
            <div className="fl-line-print">
              <div className="fl-line-shot">
                {it.image && (
                  <Image
                    src={it.image}
                    alt={isAr ? it.title : it.titleEn || it.title}
                    fill
                    draggable={false}
                    sizes="(max-width: 600px) 46vw, 250px"
                    quality={85}
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <span className="fl-line-peg" aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="mx-auto mt-2 flex max-w-xl flex-col items-center text-center">
        <h2 lang={lang} className="fl-display text-[clamp(1.7rem,3.6vw,2.8rem)] leading-tight text-primary">
          {name}
        </h2>
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className={`rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-sm text-primary ${isAr ? "font-gess" : ""}`}
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center gap-3" dir="ltr">
          {n > 1 && (
            <button type="button" onClick={() => step(-1)} className="fl-ctl fl-ctl-light !h-11 !w-11 rounded-full" aria-label={isAr ? "التالي" : "Previous"}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <Link href={`/${lang}/products`} dir={isAr ? "rtl" : "ltr"} className={`fl-btn-gold ${isAr ? "font-gess" : ""}`}>
            {isAr ? "تسوّقي العرض" : "Shop the offer"}
            <Arrow aria-hidden="true" className="h-4 w-4" />
          </Link>
          {n > 1 && (
            <button type="button" onClick={() => step(1)} className="fl-ctl fl-ctl-light !h-11 !w-11 rounded-full" aria-label={isAr ? "السابق" : "Next"}>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {n > 1 && (
          <p dir="ltr" className="mt-3 text-sm tracking-widest text-primary/70" aria-live="polite">
            {pos} / {n}
          </p>
        )}
      </div>
    </section>
  );
}
