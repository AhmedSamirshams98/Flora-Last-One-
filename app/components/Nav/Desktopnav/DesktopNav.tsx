import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, Heart } from "lucide-react";
import logo from "@/public/images/logo.png";
import { DesktopNavProps } from "@/types/nav";
import UserMenu from "./UserMenu";
import NavLinks from "./NavLinks";
import React from "react";
import { useRouter } from "next/navigation";

const DesktopNav = ({
  totalItems,
  onMenuToggle,
  toggleLang,
  lang,
}: DesktopNavProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <nav className="bg-primary/85 backdrop-blur-2xl text-primary-foreground z-40">
      <div className="container mx-auto px-3 py-3">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center">
            <Link
              onClick={handleClick}
              href={`/${lang}`}
              aria-label="Flora Store Homepage"
            >
              <Image
                sizes="(max-width: 768px) 100vw, 1200px"
                src={logo}
                alt="Flora Store – شنط وأحذية نسائية في مصر"
                priority
                className="w-18"
              />
            </Link>
          </div>

          <NavLinks lang={lang} />

          <div className="flex items-center justify-end gap-4">
            <Link href="/wishlist" aria-label="المفضلة" rel="nofollow">
              <Heart aria-hidden="true" />
            </Link>

            <Link
              href="/cart"
              aria-label="سلة التسوق فلورا flora shopping cart"
              className="relative"
            >
              <ShoppingBag aria-hidden="true" className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              aria-label={
                lang === "ar"
                  ? "تغيير اللغة إلى الإنجليزية"
                  : "Change language to Arabic"
              }
              onClick={toggleLang}
              className="hidden md:block px-3 py-1 font-gess border rounded-md"
            >
              {lang === "ar" ? "الإنجليزيّة" : "العربيّة"}
            </button>

            <UserMenu lang={lang} />

            <button
              onClick={onMenuToggle}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(DesktopNav);
