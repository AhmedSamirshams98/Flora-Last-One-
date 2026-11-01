/* TEST hero (idea from "Centered Hero with Image Fan", 21st.dev): the slogan, the sentence and
   the two buttons in the middle, and under them three product pictures overlapping like a
   hand of cards: the middle one in front, the others tilted away. On load the three open
   from one pile (a short, quiet movement); with "reduce motion" they are simply placed.
   The cards are plain links, so it works the same with a finger as with a mouse.
   No state, no script: this is a server component and the movement is CSS. */

import Image from "next/image";
import Link from "next/link";
import { Actions, Headline, Promises, SUBCOPY } from "./HeroParts";
import type { HomeProduct } from "./types";
import "../home.css";

export default function FanHero({ lang, products }: { lang: "ar" | "en"; products: HomeProduct[] }) {
  const isAr = lang === "ar";
  // [left, middle, right]: the first product goes in the middle, in front
  const three = [products[1], products[0], products[2]].filter(Boolean) as HomeProduct[];
  const pos = three.length === 3 ? ["l", "c", "r"] : three.length === 2 ? ["c", "r"] : ["c"];

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

      <div className="fl-fan" dir="ltr">
        <div className="fl-fan-stage">
          {three.map((p, i) => (
            <div key={p.id} className="fl-fan-card" data-pos={pos[i]}>
              <Link href={`/${lang}/product/${p.id}`} aria-label={p.name} className="fl-fan-link">
                <Image
                  src={p.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 600px) 40vw, 260px"
                  className="object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Promises lang={lang} tone="dark" />
      </div>
    </section>
  );
}
