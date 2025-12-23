"use client";

import { ShoppingBag, Package, BarChart3, Tag } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const menuItems = [
    {
      title: "الطلبات",
      description: "إدارة طلبات العملاء",
      icon: ShoppingBag,
      href: "/dashboard/orders",
      color: "bg-blue-500",
    },
       {
      title: "الريلز",
      description: "إدارة طلبات الريلز",
      icon: ShoppingBag,
      href: "/dashboard/reels",
      color: "bg-blue-200",
    },
    {
      title: "المنتجات",
      description: "إدارة المنتجات والمخزون",
      icon: Package,
      href: "/dashboard/products",
      color: "bg-green-500",
    },

    {
      title: "العروض",
      description: "إدارة العروض والتخفيضات",
      icon: Tag,
      href: "/dashboard/offers",
      color: "bg-orange-500",
    },
    {
      title: "التقارير",
      description: "تقارير وتحليلات المبيعات",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-red-500",
    },
    {
      title: "الشريط  المتحرك ",
      description: "ادارة الشريط المتحرك    ",
      icon: BarChart3,
      href: "/dashboard/marquee",
      color: "bg-yellow-500",
    },
      {
      title: "الاقسام   ",
      description: "ادارة الاقسام     ",
      icon: BarChart3,
      href: "/dashboard/categories",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 " style={{ direction: "rtl" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-gess">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
            >
              <div className="flex items-center gap-4">
                <div className={`${item.color} p-3 rounded-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
