// import type { Metadata } from "next";
// import "./globals.css";
// import MainNav from "./components/Nav/MainNav";
// import { Providers } from "./providers";
// import MarqueeBanner from "./[lang]/Marquee";
// import Footer from "./[lang]/footer/Footer";

// export const metadata: Metadata = {
//   title: "Flora Store Website",
//   description:
//     "Flora KafrElShiekh Ecommerce Store For Stylish Shoes and Bags . فلورا كفر الشيخ لأفضل صيحات الموضة في الشنط والأحذية ",
//   keywords: [
//     "شنط نسائية",
//     "أحذية نسائية",
//     "فلورا كفر الشيخ",
//     "موضة",
//     "تسوق أونلاين مصر",
//     "فلورا ستور",
//     "flora store egypt",
//     "flora kafrelshiekh",
//     "woman shoes",
//     "woman bags",
//   ],
//   metadataBase: new URL("https://floraegypt.com"),
//   icons: "/logo.png", // ⭐ سطر واحد فقط
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="ar">
//       <body className="">
//         <Providers>
//           <div className="sticky top-0 left-0 right-0 z-50 w-full">
//             <MarqueeBanner />
//             <MainNav />
//           </div>
//           <main>{children}</main>
//           <Footer />
//         </Providers>
//       </body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import "./globals.css";
import MainNav from "./components/Nav/MainNav";
import { Providers } from "./providers";
import MarqueeBanner from "./[lang]/Marquee";
import Footer from "./[lang]/footer/Footer";
import { Toaster } from "sonner"; // أضف هذا الاستيراد

export const metadata: Metadata = {
  title: "Flora Store Website",
  description:
    "Flora KafrElShiekh Ecommerce Store For Stylish Shoes and Bags . فلورا كفر الشيخ لأفضل صيحات الموضة في الشنط والأحذية ",
  keywords: [
    "شنط نسائية",
    "أحذية نسائية",
    "فلورا كفر الشيخ",
    "موضة",
    "تسوق أونلاين مصر",
    "فلورا ستور",
    "flora store egypt",
    "flora kafrelshiekh",
    "woman shoes",
    "woman bags",
  ],
  metadataBase: new URL("https://floraegypt.com"),
  icons: "/logo.png", // ⭐ سطر واحد فقط
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body className="">
        <Providers>
          <div className="sticky top-0 left-0 right-0 z-50 w-full">
            <MarqueeBanner />
            <MainNav />
          </div>
          <main>{children}</main>

          {/* إضافة Toaster هنا */}
          <Toaster
            position="top-center"
            expand={false}
            richColors
            closeButton
            dir="rtl"
            theme="light" // أو "dark" أو "system"
            toastOptions={{
              className: "font-gess", // إذا كان لديك font مخصص
              duration: 4000, // مدة ظهور الـ toast (بالميلي ثانية)
            }}
          />

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
