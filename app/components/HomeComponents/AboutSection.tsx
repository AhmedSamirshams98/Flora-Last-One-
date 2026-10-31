"use client";

/* Home: our story, with the figures beside it. One section, no pictures:
   the story on the start side (right in Arabic), the figures on a cocoa panel on the
   end side (left in Arabic). On a phone the panel falls under the story. */

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
    <section id="about" className="container mx-auto px-4 py-20 md:py-28" dir={isAr ? "rtl" : "ltr"}>
      <div className="grid items-stretch gap-10 md:grid-cols-[1.25fr_1fr] md:gap-16">
        {/* the story */}
        <Reveal>
          <span className="mb-5 block h-px w-12 bg-gold" aria-hidden="true" />
          <h2 lang={lang} className="fl-display text-4xl text-primary md:text-6xl">
            {t.about.storyTitle}
          </h2>
          <div className="mt-8 max-w-prose border-s-2 border-gold/50 ps-6 md:mt-10">
            <p
              className={`text-xl leading-[1.9] text-primary md:text-2xl md:leading-[1.8] ${isAr ? "font-gess" : ""}`}
            >
              {t.about.storyText1}
            </p>
            <p
              className={`mt-6 text-base leading-[1.9] text-muted-foreground md:text-lg ${isAr ? "font-gess" : ""}`}
            >
              {t.about.storyText2}
            </p>
          </div>
        </Reveal>

        {/* the figures */}
        <Reveal delay={120} variant="fade">
          <div className="fl-band flex h-full flex-col justify-center rounded-[1.75rem] px-7 py-9 text-primary-foreground md:px-10 md:py-12">
            <p
              lang={lang}
              className={`text-base text-[#f3e2b0]/90 md:text-lg ${isAr ? "font-gess" : "tracking-wide"}`}
            >
              {t.about.features.quality}
              {isAr ? "، " : ". "}
              {t.about.features.love}
            </p>
            <div className="mt-6 divide-y divide-gold/30">
              {STATS.map((stat) => (
                <div key={stat.key} className="py-6 first:pt-2 last:pb-0">
                  <p dir="ltr" lang={lang} className="fl-display text-start text-6xl tabular-nums text-[#f3e2b0] md:text-7xl">
                    <CountUp
                      start={0}
                      end={stat.end}
                      duration={2.4}
                      separator={stat.separator}
                      suffix={stat.suffix}
                      enableScrollSpy
                      scrollSpyOnce
                      scrollSpyDelay={200}
                    >
                      {({ countUpRef }) => <span ref={countUpRef} />}
                    </CountUp>
                  </p>
                  <p className={`mt-2 text-base text-primary-foreground/80 ${isAr ? "font-gess" : "tracking-wide"}`}>
                    {t.stats[stat.key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
