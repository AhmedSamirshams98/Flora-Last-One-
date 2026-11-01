"use client";

/* Home: our story and the three figures, kept minimal: centred, lots of air, no icons, no boxes.
   One section, no pictures. The figures stay in one row even on a phone. */

import CountUp from "react-countup";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import Reveal from "./Reveal";
import "./home.css";

interface AboutSectionProps {
  lang: "ar" | "en";
}

const STATS = [
  { key: "customers", end: 1000, suffix: "+", separator: "," },
  { key: "brands", end: 50, suffix: "+", separator: "" },
  { key: "satisfaction", end: 100, suffix: "%", separator: "" },
] as const;

export default function AboutSection({ lang }: AboutSectionProps) {
  const isAr = lang === "ar";
  const t = isAr ? ar : en;

  return (
    <section id="about" className="container mx-auto px-4 py-20 md:py-32" dir={isAr ? "rtl" : "ltr"}>
      {/* the story: a title, one sentence that carries it */}
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">
          {t.about.storyTitle}
        </h2>
        <span className="mx-auto my-8 block h-px w-10 bg-gold" aria-hidden="true" />
        <p
          className={`text-primary ${isAr ? "text-2xl leading-[2] md:text-[1.9rem]" : "text-xl leading-[1.9] md:text-2xl"}`}
          style={isAr ? { fontFamily: "var(--font-display-ar)" } : undefined}
        >
          {t.about.storyText1}
        </p>
      </Reveal>

      {/* the figures: three numbers and three words, nothing else */}
      <Reveal delay={120} variant="fade">
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-3 text-center md:mt-20 md:gap-6">
          {STATS.map(({ key, end, suffix, separator }) => (
            <div key={key} className="fl-stat">
              <p dir="ltr" lang="en" className="fl-display fl-stat-num tabular-nums text-[clamp(1.75rem,7vw,3.75rem)] leading-none">
                <CountUp
                  start={0}
                  end={end}
                  duration={2.4}
                  separator={separator}
                  suffix={suffix}
                  enableScrollSpy
                  scrollSpyOnce
                  scrollSpyDelay={200}
                >
                  {({ countUpRef }) => <span ref={countUpRef} />}
                </CountUp>
              </p>
              <p className={`mt-3 text-sm text-primary/70 md:text-base ${isAr ? "font-gess" : "tracking-wide"}`}>{t.stats[key]}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
