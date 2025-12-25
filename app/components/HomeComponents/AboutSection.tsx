"use client";
import { Award, Truck, Heart } from "lucide-react";
import CountUp from "react-countup";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface AboutSectionProps {
  lang: "ar" | "en";
}

export default function AboutSection({ lang }: AboutSectionProps) {
  const t = lang === "ar" ? ar : en;

  useEffect(() => {
    AOS.init({
      duration: 1000, // مدة الانيميشن بالمللي ثانية
      once: true, // الانيميشن يظهر مرة واحدة فقط
    });
  }, []);

  const features = [
    { icon: Award, title: t.about.features.quality },
    { icon: Heart, title: t.about.features.love },
  ];

  return (
    <section id="about">
      <div className="container mx-auto px-4">
        <div className="text-center mb-2" data-aos="fade-down">
          <h2
            className={`${
              lang === "ar" ? "font-gess font-medium" : "font-sans "
            } text-3xl mb-4 text-primary `}
          >
            {t.about.title}
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground font-gess font-medium text-center">
            {t.about.subtitle}
          </p>
        </div>

        {/* الكروت */}
        <div className="grid grid-cols-1 lg:grid-cols-3 mt-8 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center p-4 rounded-lg bg-secondary hover:shadow-lg transition-shadow"
                data-aos="fade-up"
                data-aos-delay={index * 150} // تأخير متدرج لكل كرت
              >
                <div className="font-gess inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mb-2 text-primary font-gess">{feature.title}</h3>
              </div>
            );
          })}
        </div>

        {/* العداد */}
        <div className="mt-8 grid md:grid-cols-2 gap-8 items-center">
          <div data-aos="fade-right">
            <h3 className={`${lang==="ar"?"font-gess font-medium":"font-sans"} text-3xl mb-4 text-primary text-center`}>
              {t.about.storyTitle}
            </h3>
            <p
              className={`mb-4 text-muted-foreground font-semibold text-center ${
                lang === "ar" ? "font-gess" : "font-sans font-semibold"
              }`}
            >
              {t.about.storyText1}
            </p>
            <p
              className={`text-muted-foreground font-semibold text-center ${
                lang === "ar" ? "font-gess" : "font-sans font-semibold"
              }`}
            >
              {t.about.storyText2}
            </p>
          </div>

          <div
            className={`${
              lang === "ar" ? "font-gess" : "font-sans"
            } grid grid-cols-1 md:grid-cols-2 gap-4`}
          >
            {/* العملاء */}
            <div
              className="bg-secondary p-6 rounded-lg text-center"
              data-aos="fade-up"
              data-aos-delay={100}
            >
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

            <div
              className="bg-secondary p-4 rounded-lg text-center"
              data-aos="fade-up"
              data-aos-delay={200}
            >
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
            <div
              className="bg-secondary lg:col-span-2 p-4 rounded-lg text-center"
              data-aos="fade-up"
              data-aos-delay={300}
            >
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
