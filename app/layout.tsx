import type { Metadata } from "next";
import "./globals.css";
import MainNav from "./components/Nav/MainNav";
import MarqueeBanner from "./[lang]/Marquee";
import Footer from "./[lang]/footer/Footer";
import { Toaster } from "sonner";
import Head from "next/head";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "Flora Store | شنط وأحذية نسائية في مصر – كفر الشيخ",
  applicationName: "Flora Store Egypt",
  description:
    "Flora Egypt Your Premier destination for Luxurious Shoes and Bags . فلورا كفر الشيخ لأفضل صيحات الموضة في الشنط والأحذية ",
  keywords: [
    "شنط نسائية",
    "أحذية نسائية",
    "فلورا كفر الشيخ",
    "موضة",
    "تسوق أونلاين مصر",
    "فلورا ستور",
    "flora bags",
    "فلورا",
    "FLORA",
    "flora",
    "flora shoes",
    "Flora Shoes",
    "Flora kafrelshiekh",
    "فلورا كفر الشيخ",
    "flora store egypt",
    "flora kafrelshiekh",
    "flora leather product",
    "woman shoes",
    "woman bags",
    "flora",
    "Flora",
    "FLORA",
    "فلورا",
    "SHOES",
    "BAGS",
    "شنط",
    "أحذية",
    "شنط كتف",
    "شنط نسائية",
    "أحذية نسائية",
    "شنط حريمي",
    "أحذية حريمي",
    "شنط وأحذية",
    "شنط يد نسائية",
    "شنط كتف",
    "شنط كروس",
    "شنط سواريه",
    "أحذية كعب عالي",
    "أحذية رياضية نسائية",
    "صنادل نسائية",
    "شباشب حريمي",
    "أحذية شتوي حريمي",

    // Local SEO
    "شنط نسائية مصر",
    "أحذية نسائية مصر",
    "شنط وأحذية كفر الشيخ",
    "فلورا كفر الشيخ",
    "فلورا ستور",

    // English
    "flora store egypt",
    "women bags egypt",
    "women shoes egypt",
  ],
  metadataBase: new URL("https://floraegypt.com"),
  icons: "/logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body className="">
        <Head>
          <meta
            name="description"
            content="Flora Egypt Your Premier destination for Luxurious Shoes and Bags . فلورا كفر الشيخ لأفضل صيحات الموضة في الشنط والأحذية"
          />
          <meta
            name="keywords"
            content="شنط نسائية, أحذية نسائية, فلورا كفر الشيخ, موضة, تسوق أونلاين مصر, فلورا ستور, flora store egypt, flora kafrelshiekh, flora leather product, woman shoes, woman bags"
          />
        </Head>
        <Providers>
          <div className="sticky top-0 left-0 right-0 z-50 w-full">
            <MarqueeBanner />
            <MainNav />
          </div>
          <main>{children}</main>

          <Toaster
            position="top-center"
            expand={false}
            richColors
            closeButton
            dir="rtl"
            toastOptions={{
              className: "font-gess",
              duration: 4000,
            }}
          />

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
