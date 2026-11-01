import type { Metadata } from "next";
import AdminLogin from "@/app/components/AdminLogin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ params }: { params: Promise<{ lang: "ar" | "en" }> }) {
  const { lang } = await params;
  return <AdminLogin lang={lang === "en" ? "en" : "ar"} />;
}
