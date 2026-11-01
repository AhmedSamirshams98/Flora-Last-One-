"use client";

import { Clapperboard, LayoutGrid, Package, ScrollText, ShoppingBag, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ITEMS = [
  { title: "الطلبات", description: "متابعة طلبات العملاء وتحديث حالتها", icon: ShoppingBag, href: "orders" },
  { title: "المنتجات", description: "إضافة المنتجات وتعديلها والمخزون", icon: Package, href: "products" },
  { title: "العروض", description: "العروض والتخفيضات", icon: Tag, href: "offers" },
  { title: "الأقسام", description: "أقسام الصفحة الرئيسية", icon: LayoutGrid, href: "categories" },
  { title: "الشريط المتحرك", description: "النص الذي يظهر أعلى الموقع", icon: ScrollText, href: "marquee" },
  { title: "الريلز", description: "روابط الفيديوهات في الصفحة الرئيسية", icon: Clapperboard, href: "reels" },
  { title: "التقارير", description: "المبيعات والتحليلات", icon: TrendingUp, href: "analytics" },
];

export default function DashboardPage() {
  const { lang } = useParams<{ lang: string }>();

  return (
    <div className="fl-admin-page">
      <div className="container mx-auto px-4 py-10 md:py-14" dir="rtl">
        <h1 className="mb-8 text-3xl md:text-5xl">لوحة التحكم</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {ITEMS.map(({ title, description, icon: Icon, href }) => (
            <Link key={href} href={`/${lang}/dashboard/${href}`} className="fl-admin-tile">
              <span className="fl-admin-tile-icon">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-semibold text-primary">{title}</span>
                <span className="mt-1 block text-sm text-primary/70">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
