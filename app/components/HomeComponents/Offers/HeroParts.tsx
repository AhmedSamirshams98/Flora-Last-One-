import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TRUST_ITEMS } from "../trustItems";
import "../home.css";

export const HEADLINE = {
  ar: "ارتق بأناقتك مع فلورا",
  en: "Elevate Your Elegance With Flora",
};
export const SUBCOPY = {
  ar: "مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب الفاخرة",
  en: "Welcome to Flora Egypt, your premier destination for luxurious shoes and bags.",
};

/** The slogan, one rising word at a time. */
export function Headline({
  lang,
  className = "",
  style,
}: {
  lang: "ar" | "en";
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = HEADLINE[lang].split(" ");
  return (
    <h1 lang={lang} className={`fl-display ${className}`} style={style}>
      {words.map((word, i) => (
        <span key={i}>
          <span
            className={`fl-word inline-block ${i === words.length - 1 ? "fl-accent" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {word}
          </span>{" "}
        </span>
      ))}
    </h1>
  );
}

/** Shop + categories actions. `tone` follows the ground they sit on. */
export function Actions({
  lang,
  tone = "dark",
}: {
  lang: "ar" | "en";
  tone?: "dark" | "light";
}) {
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/${lang}/products`} className={`fl-btn-gold ${isAr ? "font-gess" : ""}`}>
        {isAr ? "تسوق الآن" : "Shop Now"}
        <Arrow aria-hidden="true" className="h-4 w-4" />
      </Link>
      <a
        href="#categories"
        className={`${tone === "dark" ? "fl-btn-ghost" : "fl-btn-oval"} ${isAr ? "font-gess" : ""}`}
      >
        {isAr ? "الأقسام" : "Categories"}
      </a>
    </div>
  );
}

/** The owner-confirmed promises, as one quiet line. */
export function Promises({
  lang,
  tone = "dark",
}: {
  lang: "ar" | "en";
  tone?: "dark" | "light";
}) {
  const isAr = lang === "ar";
  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t border-dashed py-6 text-sm ${
        tone === "dark"
          ? "border-gold/40 text-primary-foreground/90"
          : "border-primary/30 text-foreground"
      } ${isAr ? "font-gess" : "tracking-wide"}`}
    >
      {TRUST_ITEMS.map((item, i) => (
        <li key={item.en} className="flex items-center gap-7">
          {i > 0 && (
            <span
              aria-hidden="true"
              className={`hidden h-1.5 w-1.5 rotate-45 sm:block ${tone === "dark" ? "bg-gold" : "bg-accent"}`}
            />
          )}
          <span>{isAr ? item.ar : item.en}</span>
        </li>
      ))}
    </ul>
  );
}
