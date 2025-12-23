"use client";
import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import SocialFooter from "../footer/SocialFooter";
import AboutSection from "@/app/components/HomeComponents/AboutSection";

const Contact = () => {
  const pathname = usePathname();
  const lang = pathname.startsWith("/ar") ? "ar" : "en";

  const address = {
    ar: "شارع الخليفة المأمون بجوار فرع ڤودافون وبنك وفا التجاري",
    en: "Al-Khalifa Al-Maamoun Street next to Vodafone Branch & Wafa Bank",
  };

  const phones = ["01090770881", "01090770883"];
  const email = "flora.leather.product@gmail.com";

  return (
    <div
      className={`container mx-auto px-4 mt-6 bg-white  ${
        lang === "ar"
          ? "text-right font-gess text-black"
          : "text-left font-sans text-black"
      }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <h2 className="text-2xl text-center font-bold mb-6">
        {lang === "ar" ? "تواصل معنا" : "Contact Us"}
      </h2>

      <ul className="space-y-4">
        {/* العنوان */}
        <li className="flex items-start gap-3 font-bold">
          <MapPin className="w-5 h-5 mt-1" />
          <span>{address[lang]}</span>
        </li>

        {/* أرقام الهاتف */}
        <li className="flex items-center gap-3 font-bold">
          {phones.map((phone, idx) => (
            <React.Fragment key={idx}>
              <Phone className="w-4 h-4" />
              <a
                href={`tel:+2${phone}`}
                className={`hover:text-accent ${
                  lang === "ar" ? "font-gess" : "font-sans"
                }`}
              >
                {phone}
              </a>
            </React.Fragment>
          ))}
        </li>

        {/* البريد الإلكتروني */}
        <li className="flex items-center gap-2 font-bold">
          <Mail className="w-4 h-4" />
          <a
            href={`mailto:${email}`}
            className="hover:text-accent font-sans text-black"
          >
            {email}
          </a>
        </li>
        <SocialFooter />
      </ul>
      <div className="mt-10">
        <AboutSection lang={lang} />
      </div>
    </div>
  );
};

export default Contact;
