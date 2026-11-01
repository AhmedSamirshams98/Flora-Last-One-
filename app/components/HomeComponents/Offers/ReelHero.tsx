"use client";

/* Home hero — a draggable row of product pictures under the slogan (after "Reelmark").
   The row drifts by itself, follows a finger or mouse 1:1, coasts after release, then
   drifts on. It bends like the inside of a cylinder (edge cards sit lower and turn
   towards the centre), but every card has exactly the same width and height. */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomeProduct } from "./types";
import { Actions, Headline, Promises, SUBCOPY } from "./HeroParts";
import "../home.css";

export type ReelItem = { id: string; image: string; alt: string; href: string };

const DRIFT = 50; // frame units per second
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function ReelHero({
  lang,
  products,
  extra = [],
}: {
  lang: "ar" | "en";
  products: HomeProduct[];
  /** more pictures (e.g. categories) when there are few products */
  extra?: ReelItem[];
}) {
  const isAr = lang === "ar";
  const base: ReelItem[] = [
    ...products.map((p) => ({ id: p.id, image: p.image, alt: p.name, href: `/${lang}/product/${p.id}` })),
    ...extra,
  ];
  // the strip must be longer than the frame: repeat the pictures if needed
  const items: ReelItem[] = [];
  if (base.length) while (items.length < Math.max(18, base.length)) items.push(...base);

  const band = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = band.current;
    if (!el || items.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dir = isAr ? 1 : -1; // t moves against the drift: LTR drifts right→left
    let offset = 0;
    let vel = 0;
    let drag: { x: number; o: number; moved: boolean; lastX: number; lastT: number } | null = null;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let hold = false; // pointer over the row, or a card has keyboard focus
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    // every card has the same size: 170 x 280 design units, 196 apart centre to centre
    const CARD_W = 170;
    const CARD_H = 280;
    const PITCH = 196;
    const frame = (W: number) => (W <= 600 ? 480 : Math.max(1000, W)); // design units across the row

    const draw = () => {
      const W = el.clientWidth;
      const FW = frame(W); // phones 480, tablets 1000, laptops and up = the real width
      const u = W / FW;
      const L = items.length * PITCH;
      const H = (CARD_H + 70) * u; // room for the edge cards to sit lower
      const w = CARD_W * u;
      const h = CARD_H * u;
      el.style.height = `${H}px`;
      items.forEach((_, i) => {
        const node = cards.current[i];
        if (!node) return;
        const t = ((((i * PITCH - offset) % L) + L) % L) - L / 2; // distance from the centre, in units
        // the row bends like the inside of a cylinder: the gaps open a little towards the edges,
        // the edge cards sit lower and turn towards the centre. Their SIZE never changes.
        const norm = FW / 2 - 14;
        const pushed = t * (1 + 0.083 * Math.pow(t / norm, 2));
        const d = Math.min(Math.abs(pushed) / norm, 1.25);
        const x = (FW / 2 + pushed) * u; // card centre in px
        // off the frame altogether: skip it; otherwise the edge clips it
        if (x + w / 2 < -20 || x - w / 2 > W + 20) {
          node.style.visibility = "hidden";
          return;
        }
        const dropY = 12 * d * d * u;
        const turn = -Math.sign(pushed) * d * 26;
        node.style.visibility = "visible";
        node.style.width = `${w}px`;
        node.style.height = `${h}px`;
        node.style.transform = `translate(${x - w / 2}px, ${(H - h) / 2 + dropY}px) perspective(900px) rotateY(${turn}deg)`;
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        if (!drag) {
          const drift = reduce || hold ? 0 : DRIFT * dir * -1;
          offset += (drift + vel) * dt;
          vel *= Math.pow(0.05, dt); // ~95% lost per second
          if (Math.abs(vel) < 1) vel = 0;
        }
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    const scale = () => el.clientWidth / frame(el.clientWidth);
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, o: offset, moved: false, lastX: e.clientX, lastT: performance.now() };
      vel = 0;
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6 && !drag.moved) {
        drag.moved = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* the pointer is already gone: keep dragging without capture */
        }
        setStill(true);
      }
      if (!drag.moved) return;
      offset = drag.o - dx / scale();
      const now = performance.now();
      const dtm = Math.max(1, now - drag.lastT) / 1000;
      vel = clamp((-(e.clientX - drag.lastX) / scale()) / dtm, -3000, 3000);
      drag.lastX = e.clientX;
      drag.lastT = now;
    };
    const up = () => {
      if (drag?.moved) {
        // swallow the click that follows a drag
        const stop = (ev: Event) => {
          ev.preventDefault(); // otherwise the browser still follows the card's link
          ev.stopPropagation();
        };
        el.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", stop, true), 0);
      } else vel = 0;
      drag = null;
      setStill(false);
    };

    const hold1 = () => (hold = true);
    const hold0 = () => (hold = el.matches(":hover") || el.matches(":focus-within"));
    el.addEventListener("mouseenter", hold1);
    el.addEventListener("mouseleave", hold0);
    el.addEventListener("focusin", hold1);
    el.addEventListener("focusout", hold0);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    draw();
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("mouseenter", hold1);
      el.removeEventListener("mouseleave", hold0);
      el.removeEventListener("focusin", hold1);
      el.removeEventListener("focusout", hold0);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, isAr]);

  return (
    <section id="top" className="fl-hero relative rounded-b-[2.5rem] pb-4 pt-10 text-primary-foreground md:pt-14" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 text-center">
        <Headline
          lang={lang}
          className="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] leading-[1.1] text-[#fff7ee]"
        />
        <p
          className={`mx-auto mt-5 max-w-xl text-base leading-8 text-primary-foreground/80 md:text-xl ${
            isAr ? "font-gess" : ""
          }`}
        >
          {SUBCOPY[lang]}
        </p>
        <div className="mt-7 flex justify-center">
          <Actions lang={lang} tone="dark" />
        </div>
      </div>

      <div
        ref={band}
        className={`fl-reel-fade relative mt-6 w-full touch-pan-y select-none overflow-hidden md:mt-2 ${
          still ? "cursor-grabbing" : "cursor-grab"
        }`}
        dir="ltr"
        style={{ height: 250 }}
        aria-label={isAr ? "منتجات مختارة" : "Selected products"}
      >
        {items.map((it, i) => (
          <Link
            key={`${it.id}-${i}`}
            href={it.href}
            ref={(n) => {
              cards.current[i] = n;
            }}
            draggable={false}
            aria-hidden={i >= base.length ? true : undefined}
            tabIndex={i >= base.length ? -1 : undefined}
            className="absolute start-0 top-0 block overflow-hidden rounded-[15px] bg-secondary will-change-transform"
            style={{ visibility: "hidden" }}
          >
            <Image
              src={it.image}
              alt={i < base.length ? it.alt : ""}
              fill
              draggable={false}
              priority={i < 5}
              sizes="(max-width: 820px) 30vw, 16vw"
              className="pointer-events-none object-cover"
            />
          </Link>
        ))}
      </div>

      <div className="container mx-auto px-4">
        <Promises lang={lang} tone="dark" />
      </div>
    </section>
  );
}
