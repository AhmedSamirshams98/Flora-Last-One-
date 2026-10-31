import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, Heart } from "lucide-react";
import logo from "@/public/images/logo.png";
import { DesktopNavProps } from "@/types/nav";
import UserMenu from "./UserMenu";
import NavLinks from "./NavLinks";
import React from "react";
import { useRouter } from "next/navigation";

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-primary-foreground/10 hover:text-gold focus-visible:outline-[#fff7ee]";

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
    <nav className="z-40 border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center">
          {/* phones and tablets: the menu button on the reading-start side */}
          <div className="flex items-center justify-self-start xl:hidden">
            <button
              onClick={onMenuToggle}
              className="p-2"
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" />
            </button>
          </div>

          {/* the logo: centred on phones, on the reading-start side on wide screens */}
          <Link
            onClick={handleClick}
            href={`/${lang}`}
            aria-label="Flora Store Homepage"
            className="justify-self-center xl:col-start-1 xl:row-start-1 xl:justify-self-start"
          >
            <Image
              sizes="160px"
              src={logo}
              alt="Flora Store – شنط وأحذية نسائية في مصر"
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* wide screens: the links in a rounded pill, in the middle */}
          <div className="hidden xl:col-start-2 xl:row-start-1 xl:block">
            <NavLinks lang={lang} />
          </div>

          {/* reading-end: actions, as round icon buttons */}
          <div className="flex items-center justify-end gap-1">
            <Link
              href="/wishlist"
              aria-label="المفضلة"
              rel="nofollow"
              className={iconBtn}
            >
              <Heart aria-hidden="true" className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              aria-label="سلة التسوق فلورا flora shopping cart"
              className={`relative ${iconBtn}`}
            >
              <ShoppingBag aria-hidden="true" className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute end-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-medium text-[#2a1608]">
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
              className="mx-1 hidden h-10 items-center rounded-full border border-primary-foreground/25 px-4 text-sm transition-colors hover:border-gold hover:text-gold md:flex font-gess"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <UserMenu lang={lang} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(DesktopNav);
