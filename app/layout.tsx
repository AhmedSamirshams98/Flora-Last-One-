import type { Metadata } from "next";
import "./globals.css";
import MainNav from "./components/Nav/MainNav";
import MarqueeBanner from "./[lang]/Marquee";
import Footer from "./[lang]/footer/Footer";
import { Toaster } from "sonner";
import Head from "next/head";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "Flora Store | شنط وأحذية نسائية في مصر ",
  applicationName: "Flora Store Egypt",
  description:
    "Flora Egypt Your Premier destination for Luxurious Shoes and Bags . فلورا لأفضل صيحات الموضة في الشنط والأحذية ",
  keywords: [
    "شنط نسائية",
    "أحذية نسائية",
    "فلورا  ",
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
    "فلورا",
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
    "شنط نسائية مصر",
    "أحذية نسائية مصر",
    "شنط وأحذية كفر الشيخ",
    "فلورا كفر الشيخ",
    "فلورا ستور",
    "flora store egypt",
    "women bags egypt",
    "women shoes egypt",
  ],
  metadataBase: new URL("https://floraegypt.com"),
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/logo.png",
  },
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
          <link rel="icon" href="/logo.png" type="image/png" />

          <meta
            name="description"
            content="Flora Egypt Your Premier destination for Luxurious Shoes and Bags . فلورا   لأفضل صيحات الموضة في الشنط والأحذية"
          />
                    <link rel="icon" href="/logo.png" type="image/png" />

          <meta
            name="keywords"
            content="شنط نسائية, أحذية نسائية, فلورا  , موضة, تسوق أونلاين مصر, فلورا ستور, flora store egypt, flora Egypt , flora leather product, woman shoes, woman bags"
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
