import type { Metadata } from "next";
import "./globals.css";
import MainNav from "./components/Nav/MainNav";
import MarqueeBanner from "./[lang]/Marquee";
import Footer from "./[lang]/footer/Footer";
import { Toaster } from "sonner";
import Head from "next/head";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Flora Store | شنط وأحذية نسائية في مصر",
  applicationName: "Flora Store Egypt",
  description:
    "مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب الفاخرة",
  keywords: [
    "شنط نسائية",
    "أحذية نسائية",
    "فلورا",
    "موضة",
    "تسوق أونلاين مصر",
    "فلورا ستور",
    "flora store egypt",
    "flora egypt",
    "woman shoes",
    "woman bags",
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
      <body>
        <Head>
          {/* Favicon */}
          <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
          <link rel="icon" href="/logo.png" type="image/png" sizes="16x16" />
          <link rel="apple-touch-icon" href="/logo.png" />

          {/* Meta description */}
          <meta
            name="description"
            content="مرحبًا بكم في فلورا مصر، وجهتكم المتميزة للأحذية والحقائب الفاخرة"
          />
          <meta
            name="keywords"
            content="شنط نسائية, أحذية نسائية, فلورا, موضة, تسوق أونلاين مصر, فلورا ستور, flora store egypt, flora egypt, woman shoes, woman bags"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
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
