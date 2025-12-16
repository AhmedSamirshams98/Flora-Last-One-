"use client";
import { Award, Truck, Heart } from "lucide-react";
import CountUp from "react-countup";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

interface AboutSectionProps {
  lang: "ar" | "en";
}

export default function AboutSection({ lang }: AboutSectionProps) {
  const t = lang === "ar" ? ar : en;

  const features = [
    { icon: Award, title: t.about.features.quality },
    { icon: Truck, title: t.about.features.shipping },
    { icon: Heart, title: t.about.features.love },
  ];

  return (
    <section id="about" className="py-10 bg-card">
      <div className="container mx-auto px-4">
        {/* العنوان */}
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-primary font-gess font-semibold">
            {t.about.title}
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground font-gess text-center">
            {t.about.subtitle}
          </p>
        </div>

        {/* الميزات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-secondary hover:shadow-lg transition-shadow"
              >
                <div className="font-gess inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-primary font-gess">{feature.title}</h3>
              </div>
            );
          })}
        </div>

        {/* العداد */}
        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl mb-4 text-primary text-center font-gess">
              {t.about.storyTitle}
            </h3>
            <p
              className={`mb-4 text-muted-foreground  text-center  ${
                lang === "ar" ? "font-gess" : "font-sans font-semibold "
              } `}
            >
              {t.about.storyText1}
            </p>
            <p
              className={` text-muted-foreground  text-center  ${
                lang === "ar" ? "font-gess" : "font-sans font-semibold "
              } `}
            >
              {t.about.storyText2}
            </p>
          </div>

          <div
            className={`${
              lang === "ar" ? "font-gess" : "font-sans"
            } grid grid-cols-1 md:grid-cols-2 gap-4 `}
          >
            {/* العملاء */}
            <div className="bg-secondary p-8 rounded-lg text-center">
              <p className="text-4xl text-primary mb-2">
                +{" "}
                <CountUp
                  start={0}
                  end={1000}
                  duration={3}
                  separator=","
                  enableScrollSpy
                  scrollSpyDelay={100}
                >
                  {({ countUpRef }) => <span ref={countUpRef} />}
                </CountUp>
              </p>
              <p className="text-muted-foreground">{t.stats.customers}</p>
            </div>

            {/* المنتجات */}
            <div className="bg-secondary p-8 rounded-lg text-center">
              <p className="text-4xl text-primary mb-2">
                +{" "}
                <CountUp
                  start={0}
                  end={500}
                  duration={3}
                  enableScrollSpy
                  scrollSpyDelay={100}
                >
                  {({ countUpRef }) => <span ref={countUpRef} />}
                </CountUp>
              </p>
              <p className="text-muted-foreground">{t.stats.products}</p>
            </div>

            {/* الماركات */}
            <div className="bg-secondary p-8 rounded-lg text-center">
              <p className="text-4xl text-primary mb-2">
                +{" "}
                <CountUp
                  start={0}
                  end={50}
                  duration={3}
                  enableScrollSpy
                  scrollSpyDelay={100}
                >
                  {({ countUpRef }) => <span ref={countUpRef} />}
                </CountUp>
              </p>
              <p className="text-muted-foreground">{t.stats.brands}</p>
            </div>

            {/* الرضا */}
            <div className="bg-secondary p-8 rounded-lg text-center">
              <p className="text-4xl text-primary mb-2">
                <CountUp
                  start={0}
                  end={100}
                  duration={3}
                  enableScrollSpy
                  scrollSpyDelay={100}
                >
                  {({ countUpRef }) => <span ref={countUpRef} />}
                </CountUp>
                %
              </p>
              <p className="text-muted-foreground">{t.stats.satisfaction}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
