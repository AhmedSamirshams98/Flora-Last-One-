// "use client";
// import React from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// const salesData = [
//   { month: "يناير", sales: 4200, orders: 42 },
//   { month: "فبراير", sales: 5100, orders: 51 },
//   { month: "مارس", sales: 6800, orders: 68 },
//   { month: "أبريل", sales: 5900, orders: 59 },
//   { month: "مايو", sales: 7200, orders: 72 },
//   { month: "يونيو", sales: 8100, orders: 81 },
// ];

// const topProducts = [
//   { name: "شنطة جلد كلاسيكية", sales: 124, revenue: 23436 },
//   { name: "كعب موديل", sales: 89, revenue: 22161 },
//   { name: "بوت موضة", sales: 67, revenue: 22043 },
//   { name: "حقيبة ظهر جلد", sales: 56, revenue: 15624 },
//   { name: "حقيبة يد أنيقة", sales: 45, revenue: 13455 },
// ];

// const recentOrders = [
//   {
//     id: "#ORD-1234",
//     customer: "سارة جونسون",
//     total: 478,
//     status: "تم التوصيل",
//   },
//   {
//     id: "#ORD-1235",
//     customer: "مايكل تشين",
//     total: 329,
//     status: "قيد المعالجة",
//   },
//   { id: "#ORD-1236", customer: "إيما ديفيس", total: 567, status: "تم الشحن" },
//   { id: "#ORD-1237", customer: "جيمس ويلسون", total: 189, status: "معلق" },
//   {
//     id: "#ORD-1238",
//     customer: "أوليفيا براون",
//     total: 249,
//     status: "تم التوصيل",
//   },
// ];

// export default function AdminDashboard() {
//   return (
//     <div className="p-6 space-y-8">
//       {/* بطاقات الإحصائيات */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* إجمالي الإيرادات */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-sm font-medium text-gray-600">
//               إجمالي الإيرادات
//             </h3>
//             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//               <span className="text-blue-600 text-lg">$</span>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">$45,231</div>
//           <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
//             <span>↑</span>
//             <span>+20.1%</span> من الشهر الماضي
//           </p>
//         </div>

//         {/* إجمالي الطلبات */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-sm font-medium text-gray-600">
//               إجمالي الطلبات
//             </h3>
//             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//               <span className="text-green-600 text-lg">🛒</span>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">+573</div>
//           <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
//             <span>↑</span>
//             <span>+18.2%</span> من الشهر الماضي
//           </p>
//         </div>

//         {/* إجمالي المنتجات */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-sm font-medium text-gray-600">
//               إجمالي المنتجات
//             </h3>
//             <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//               <span className="text-purple-600 text-lg">📦</span>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">234</div>
//           <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
//             <span>↑</span>
//             <span>+12</span> جديد هذا الشهر
//           </p>
//         </div>

//         {/* إجمالي العملاء */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-sm font-medium text-gray-600">
//               إجمالي العملاء
//             </h3>
//             <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
//               <span className="text-orange-600 text-lg">👥</span>
//             </div>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">1,429</div>
//           <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
//             <span>↓</span>
//             <span>-2.3%</span> من الشهر الماضي
//           </p>
//         </div>
//       </div>

//       {/* الرسوم البيانية */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* مخطط المبيعات */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">نظرة عامة على المبيعات</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={salesData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="sales"
//                 stroke="#3b82f6"
//                 strokeWidth={2}
//                 name="المبيعات"
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* مخطط الطلبات */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">الطلبات حسب الشهر</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={salesData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="orders" fill="#10b981" name="الطلبات" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* الجداول */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         {/* المنتجات الأكثر مبيعاً */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">المنتجات الأكثر مبيعاً</h3>
//           <div className="space-y-4">
//             {topProducts.map((product, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0 last:pb-0"
//               >
//                 <div>
//                   <p className="font-medium text-gray-900">{product.name}</p>
//                   <p className="text-sm text-gray-500">
//                     {product.sales} عملية بيع
//                   </p>
//                 </div>
//                 <p className="text-blue-600 font-semibold">
//                   ${product.revenue.toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* الطلبات الحديثة */}
//         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">الطلبات الحديثة</h3>
//           <div className="space-y-4">
//             {recentOrders.map((order, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-0 last:pb-0"
//               >
//                 <div>
//                   <p className="font-medium text-gray-900">{order.id}</p>
//                   <p className="text-sm text-gray-500">{order.customer}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-blue-600 font-semibold">${order.total}</p>
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${
//                       order.status === "تم التوصيل"
//                         ? "bg-green-100 text-green-700"
//                         : order.status === "تم الشحن"
//                         ? "bg-blue-100 text-blue-700"
//                         : order.status === "قيد المعالجة"
//                         ? "bg-yellow-100 text-yellow-700"
//                         : "bg-gray-100 text-gray-700"
//                     }`}
//                   >
//                     {order.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useOffersStore } from "@/store/offers-store";
import { useProductsStore } from "@/store/products-store";
import { ProductType } from "@/types/product";
import React, { useCallback, useEffect, useMemo } from "react";

const Page = () => {
  const {
    products,

    fetchProducts,
  } = useProductsStore();
  const { fetchOffers } = useOffersStore();
  const fetchData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchOffers()]);
  }, [fetchProducts, fetchOffers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInStock = products.filter((p) => p.inStock).length;
    const totalFeatured = products.filter((p) => p.isFeatured).length;
    const totalNew = products.filter((p) => p.isNew).length;
    const totalBags = products.filter(
      (p) => p.category === ProductType.BAG
    ).length;
    const totalShoes = products.filter(
      (p) => p.category === ProductType.SHOE
    ).length;

    return {
      totalProducts,
      totalInStock,
      totalFeatured,
      totalNew,
      totalBags,
      totalShoes,
    };
  }, [products]);

  return (
    <div className="container mx-auto mt-2" style={{ direction: "rtl" }}>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary">
            {stats.totalProducts}
          </div>
          <div className="text-sm text-gray-600">إجمالي المنتجات</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalInStock}
          </div>
          <div className="text-sm text-gray-600">متوفر بالمخزون</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.totalFeatured}
          </div>
          <div className="text-sm text-gray-600">مميز</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalNew}
          </div>
          <div className="text-sm text-gray-600">جديد</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-2xl font-bold">{stats.totalBags}</div>
          <div className="text-sm text-gray-600">شنط</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-2xl font-bold">{stats.totalShoes}</div>
          <div className="text-sm text-gray-600">أحذية</div>
        </div>
      </div>
    </div>
  );
};

export default Page;
