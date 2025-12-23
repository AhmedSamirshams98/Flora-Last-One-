import React from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

import { FaFacebookF } from "react-icons/fa";

import { FaTiktok } from "react-icons/fa6";

const SocialFooter = () => {
  return (
    <div className="flex gap-4 w-full items-center justify-center">
      <a
        href="https://www.facebook.com/share/1BT3kJVN5D/?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
        aria-label="Facebook"
      >
        <FaFacebookF className="w-5 h-5" />
      </a>
      <a
        href="https://wa.me/201090770881"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 "
        title="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-5 h-5 " />
      </a>
      <a
        href="https://www.instagram.com/flora.leather.product?igsh=MWJrMHg1OWxtbnBmdg=="
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
        aria-label="Instagram"
      >
        <FaInstagram className="w-5 h-5" />
      </a>
      <a
        href="https://www.tiktok.com/@flora.leather.product"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
        aria-label="TikTok"
      >
        <FaTiktok />
      </a>
    </div>
  );
};

export default SocialFooter;
