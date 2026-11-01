"use client";

/* Two round buttons, on every page of the shop: call, and WhatsApp (the same number). A soft golden
   glow; no glow with "reduce motion". Hidden in the dashboard and on the admin sign-in. On a phone's
   product page they sit above the "add to cart" bar (see .fl-fab in home.css). */

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import "./HomeComponents/home.css";

const NUMBER = "01090770881";

export default function FloatingContact() {
  const pathname = usePathname();
  // while the footer is on screen the same details are right there: the buttons step aside, so they
  // never sit on top of the footer's text
  const [overFooter, setOverFooter] = useState(false);
  useEffect(() => {
    const check = () => {
      const footer = document.getElementById("contact");
      if (!footer) return setOverFooter(false);
      // the footer's top edge has come into the screen
      setOverFooter(footer.getBoundingClientRect().top < window.innerHeight - 24);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);
  if (/\/(dashboard|admin-login)(\/|$)/.test(pathname)) return null;
  const isAr = !pathname.startsWith("/en");

  return (
    <div className="fl-fab" data-hide={overFooter ? "1" : undefined} aria-hidden={overFooter ? true : undefined}>
      <a
        href={`https://wa.me/2${NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
        className="fl-fab-btn"
        tabIndex={overFooter ? -1 : undefined}
      >
        <FaWhatsapp className="h-6 w-6" aria-hidden="true" />
      </a>
      <a href={`tel:+2${NUMBER}`} aria-label={isAr ? "اتصل بنا" : "Call us"} className="fl-fab-btn" tabIndex={overFooter ? -1 : undefined}>
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
    </div>
  );
}
