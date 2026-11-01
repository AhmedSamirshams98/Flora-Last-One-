"use client";

/* The cart keeps the price a product had when it was added, which can be old (an offer ended, a price
   changed). This reads today's prices and live offers from the shop (the same ones the server uses to
   charge) and works out the bill the way the server will: the live unit price of each line, and the
   "buy X get Y free" discount (for every X+Y pieces of one product, Y are free). While the prices are
   loading it falls back to the saved prices. */

import { useEffect, useState } from "react";
import { buyXGetYOffer, freeUnits, type OfferLike } from "@/lib/effective-price";

type Line = { productId: string; price: number; quantity: number };
type Rule = { buy: number; get: number; title: string; titleEn: string };

export function useLivePrices() {
  const [live, setLive] = useState<Record<string, number>>({});
  const [rules, setRules] = useState<Record<string, Rule>>({});

  useEffect(() => {
    let off = false;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: string; finalPrice: number; offer?: OfferLike | null }[]) => {
        if (off) return;
        setLive(Object.fromEntries(list.map((p) => [p.id, p.finalPrice])));
        const r: Record<string, Rule> = {};
        for (const p of list) {
          const rule = buyXGetYOffer(p.offer);
          if (rule && p.offer) r[p.id] = { ...rule, title: p.offer.title ?? "", titleEn: p.offer.titleEn ?? p.offer.title ?? "" };
        }
        setRules(r);
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, []);

  const unit = (l: { productId: string; price: number }) => live[l.productId] ?? l.price;
  const subtotal = (lines: Line[]) => lines.reduce((s, l) => s + unit(l) * l.quantity, 0);

  /** free pieces of one product in the cart, and what they take off the bill */
  const freeFor = (productId: string, lines: Line[]) => {
    const rule = rules[productId];
    if (!rule) return 0;
    const qty = lines.filter((l) => l.productId === productId).reduce((s, l) => s + l.quantity, 0);
    return freeUnits(qty, rule.buy, rule.get);
  };
  const discount = (lines: Line[]) => {
    let d = 0;
    for (const pid of new Set(lines.map((l) => l.productId))) {
      const free = freeFor(pid, lines);
      if (free) d += free * unit(lines.find((l) => l.productId === pid)!);
    }
    return Math.round(d * 100) / 100;
  };
  const total = (lines: Line[]) => Math.round((subtotal(lines) - discount(lines)) * 100) / 100;

  return { unit, subtotal, discount, total, freeFor, rules };
}
