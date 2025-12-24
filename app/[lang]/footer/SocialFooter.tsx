"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

const SocialFooter = () => {
  const pathname = usePathname();

  const isContactPage = pathname === "/contact" || pathname === "/ar/contact";

  const iconClass = isContactPage ? "w-5 h-5 text-primary" : "w-5 h-5"; // بدون لون → يرث اللون

  return (
    <div className="flex gap-4 w-full items-center justify-center">
      <a
        href="https://www.facebook.com/share/1BT3kJVN5D/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="hover:text-accent transition-colors"
      >
        <FaFacebookF className={iconClass} />
      </a>

      <a
        href="https://wa.me/201090770881"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        className="hover:text-accent transition-colors"
      >
        <FaWhatsapp className={iconClass} />
      </a>

      <a
        href="https://www.instagram.com/flora.leather.product"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="hover:text-accent transition-colors"
      >
        <FaInstagram className={iconClass} />
      </a>

      <a
        href="https://www.tiktok.com/@flora.leather.product"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="hover:text-accent transition-colors"
      >
        <FaTiktok className={iconClass} />
      </a>
    </div>
  );
};

export default SocialFooter;
