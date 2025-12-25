import type { Metadata } from "next";
import "./globals.css";
import MainNav from "./components/Nav/MainNav";
import MarqueeBanner from "./[lang]/Marquee";
import Footer from "./[lang]/footer/Footer";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Flora Store | شنط وأحذية نسائية في مصر",
  applicationName: "Flora Store Egypt",
  description:
    "فلورا ستور - متجرك المتخصص في الشنط والأحذية النسائية الفاخرة في مصر. تشكيلة واسعة من الحقائب الجلدية، الأحذية الكاجوال، الكعب العالي، والإكسسوارات النسائية بأفضل الأسعار",
  keywords: [
    // فلورا - Flora
    "فلورا",
    "فلورا ستور",
    "فلورا مصر",
    "Flora Store",
    "Flora Egypt",
    "Flora Store Egypt",
    
    // شنط نسائية
    "شنط نسائية",
    "شنط فلورا",
    "حقائب نسائية",
    "حقائب فلورا",
    "شنط يد نسائية",
    "حقائب يد فلورا",
    "شنط جلد",
    "حقائب جلد فلورا",
    "شنط كروس",
    "حقائب كروس فلورا",
    "شنط كتف",
    "حقائب كتف نسائية",
    "شنط سهرة",
    "حقائب سهرة فلورا",
    "كلاتش نسائي",
    "كلاتش فلورا",
    "شنط ظهر نسائية",
    "حقائب ظهر فلورا",
    "محافظ نسائية",
    "محافظ فلورا",
    
    // أحذية نسائية
    "أحذية نسائية",
    "أحذية فلورا",
    "احذية نسائي",
    "جزم نسائي",
    "جزم فلورا",
    "كعب عالي",
    "كعب عالي فلورا",
    "حذاء كعب",
    "صنادل نسائية",
    "صنادل فلورا",
    "بوت نسائي",
    "بوت فلورا",
    "سنيكرز نسائي",
    "احذية كاجوال",
    "احذية كاجوال فلورا",
    "احذية رياضية نسائية",
    "فلات نسائي",
    "احذية فلات فلورا",
    "احذية جلد نسائي",
    
    // English Keywords
    "women shoes",
    "women bags",
    "Flora leather bags",
    "Flora handbags",
    "Flora crossbody bags",
    "Flora shoulder bags",
    "Flora clutch",
    "Flora heels",
    "Flora sandals",
    "Flora boots",
    "Flora sneakers",
    "Flora flats",
    "leather handbags Egypt",
    "high heels Egypt",
    "women accessories Egypt",
    
 
    
    // Location
    "شنط نسائية مصر",
    "احذية نسائية مصر",
    "فلورا القاهرة",
    "Flora Cairo",
    "متجر شنط مصر",
    "محل احذية نسائي مصر",
  ],
  metadataBase: new URL("https://floraegypt.com"),
  
  // ✅ الأيقونات - استخدام logo-favicon.png للأيقونة الصغيرة
  icons: {
    icon: [
      { url: "/logo-favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/logo-favicon.png", type: "image/png", sizes: "16x16" },
      { url: "/logo-favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/logo-favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/logo-favicon.png",
    shortcut: "/logo-favicon.png",
  },
  
  // ✅ Open Graph للسوشيال ميديا
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://floraegypt.com",
    siteName: "Flora Store Egypt",
    title: "Flora Store | شنط وأحذية نسائية فاخرة في مصر",
    description: "فلورا ستور - متجرك المتخصص في الشنط والأحذية النسائية الفاخرة. تشكيلة واسعة من الحقائب الجلدية والأحذية الكاجوال والكعب العالي",
    images: [
      {
        url: "/logo-og.png", // صورة مخصصة للمشاركة 1200x630
        width: 1200,
        height: 630,
        alt: "Flora Store Egypt - شنط وأحذية نسائية",
      },
    ],
  },
  
  // ✅ Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Flora Store | شنط وأحذية نسائية في مصر",
    description: "فلورا ستور - متجرك المتخصص في الشنط والأحذية النسائية الفاخرة",
    images: ["/logo-og.png"],
  },
  
  // ✅ Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // ✅ Verification (أضف رموز التحقق الخاصة بك)
  verification: {
    google: 'your-google-verification-code', // استبدلها برمز Google Search Console
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* ✅ Canonical URL */}
        <link rel="canonical" href="https://floraegypt.com" />
        
        {/* ✅ Alternate Languages */}
        <link rel="alternate" hrefLang="ar" href="https://floraegypt.com/ar" />
        <link rel="alternate" hrefLang="en" href="https://floraegypt.com/en" />
        <link rel="alternate" hrefLang="x-default" href="https://floraegypt.com" />
      </head>
      
      <body>
        {/* ✅ Organization Schema - للوجو في Google */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Flora Store Egypt",
              alternateName: "فلورا ستور مصر",
              url: "https://floraegypt.com",
              logo: "https://floraegypt.com/logo-square.png", // مربعة 512x512
              image: "https://floraegypt.com/logo-square.png",
              description: "فلورا ستور - متجرك المتخصص في الشنط والأحذية النسائية الفاخرة في مصر",
              address: {
                "@type": "PostalAddress",
                addressCountry: "EG",
                addressLocality: "Cairo",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                availableLanguage: ["Arabic", "English"],
              },
              sameAs: [
                "https://www.facebook.com/share/1BT3kJVN5D",
                "https://www.instagram.com/flora.leather.product",
                "https://www.tiktok.com/@flora.leather.product",
              ],
            }),
          }}
        />

        {/* ✅ Website Schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Flora Store Egypt",
              alternateName: "فلورا ستور",
              url: "https://floraegypt.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://floraegypt.com/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* ✅ Local Business Schema */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Flora Store Egypt",
              image: "https://floraegypt.com/logo-square.png",
              description: "متجر متخصص في الشنط والأحذية النسائية الفاخرة",
              address: {
                "@type": "PostalAddress",
                addressCountry: "EG",
              },
              url: "https://floraegypt.com",
              priceRange: "$$",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "09:00",
                closes: "21:00",
              },
            }),
          }}
        />

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