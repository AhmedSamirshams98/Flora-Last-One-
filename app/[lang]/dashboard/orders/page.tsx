"use client";
import { toast } from "sonner";
import AdminModal from "@/app/components/AdminModal";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { confirmAction } from "@/app/components/AdminConfirm";
import {
  X,
  Eye,
  Package,
  Tag,
  Palette,
  Ruler,
  DollarSign,
  Hash,
} from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  variantDetails?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  product?: {
    id: string;
    name: string;
    category: string;
    code?: string;
  };
  variant?: {
    id: string;
    color: string;
    colorHex?: string;
    sizes?: string[];
    images?: string[];
    stock?: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  user: {
    name: string;
    email: string;
  };
  // who to deliver to (on the order itself; for a guest order this is the only place it is)
  customerName?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  notes?: string | null;
  assignedAdminId?: string;
  assignedAdmin?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  createdAt: string;
}

// قائمة الحالات
const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

// the Arabic word and the colours of every status, used by the list, the filter and the details
const STATUS: Record<string, { ar: string; chip: string; solid: string }> = {
  PENDING: { ar: "قيد الانتظار", chip: "bg-yellow-100 text-yellow-800", solid: "bg-yellow-600" },
  CONFIRMED: { ar: "مؤكد", chip: "bg-blue-100 text-blue-800", solid: "bg-blue-600" },
  PROCESSING: { ar: "قيد المعالجة", chip: "bg-indigo-100 text-indigo-800", solid: "bg-indigo-600" },
  SHIPPED: { ar: "تم الشحن", chip: "bg-purple-100 text-purple-800", solid: "bg-purple-600" },
  DELIVERED: { ar: "تم التوصيل", chip: "bg-green-100 text-green-800", solid: "bg-green-600" },
  CANCELLED: { ar: "ملغي", chip: "bg-red-100 text-red-800", solid: "bg-red-600" },
  REFUNDED: { ar: "مسترجع", chip: "bg-red-100 text-red-800", solid: "bg-red-600" },
};
const statusAr = (s: string) => STATUS[s]?.ar ?? s;
const CLOSED = ["CANCELLED", "REFUNDED"];

// Gregorian date and time in Arabic words with western digits ("ar-SA" would print the Hijri calendar)
const fmtDate = (d: string) =>
  new Date(d).toLocaleString("ar-EG-u-nu-latn", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
const CATEGORY_AR: Record<string, string> = { SHOE: "أحذية", BAG: "شنط" };
const PAGE = 15;

const GUEST_EMAIL = "guest-orders@flora.invalid";
const isGuest = (o: Order) => o.user?.email === GUEST_EMAIL;

/* Everything the person who packs and delivers the order needs: who, phone (tap to call, or WhatsApp),
   where, and the customer's note. The name and phone come from the order itself, so a guest order
   (no account) shows the same as a signed-in one. */
function CustomerBlock({ order }: { order: Order }) {
  const name = order.customerName || order.user?.name;
  const phone = order.customerPhone;
  // Egypt is +20 and the number keeps its 0: 01012345678 -> 201012345678
  const wa = phone ? `https://wa.me/2${phone}` : null;
  const row = "rounded-lg bg-secondary/40 p-3";
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className={row}>
        <p className="text-sm text-gray-600">الاسم</p>
        <p className="font-medium">{name || "—"}</p>
      </div>
      <div className={row}>
        <p className="text-sm text-gray-600">الهاتف</p>
        {phone ? (
          <p className="flex flex-wrap items-center gap-3 font-medium">
            <a href={`tel:+2${phone}`} dir="ltr" className="underline decoration-gold underline-offset-4">{phone}</a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline decoration-gold underline-offset-4">
                واتساب
              </a>
            )}
          </p>
        ) : (
          <p className="font-medium">—</p>
        )}
      </div>
      <div className={`${row} md:col-span-2`}>
        <p className="text-sm text-gray-600">العنوان</p>
        <p className="font-medium">
          {[order.shippingAddress, order.shippingCity].filter(Boolean).join("، ") || "—"}
        </p>
      </div>
      {order.notes && (
        <div className={`${row} md:col-span-2`}>
          <p className="text-sm text-gray-600">ملاحظات العميل</p>
          <p className="font-medium">{order.notes}</p>
        </div>
      )}
      {!isGuest(order) && order.user?.email && (
        <div className={`${row} md:col-span-2`}>
          <p className="text-sm text-gray-600">البريد الإلكتروني (حساب Google)</p>
          <p dir="ltr" className="font-medium">{order.user.email}</p>
        </div>
      )}
    </div>
  );
}

const Page = () => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالة لعرض popup
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  // the list: search, a status filter, and "show more" (15 at a time)
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("فشل في جلب الطلبات");
        const data = await res.json();
        setOrders(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "فشل في جلب الطلبات");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!session?.user?.id) {
      toast.error("يجب تسجيل الدخول كأدمن أولاً");
      return;
    }

    const current = orders.find((o) => o.id === orderId);
    if (current && !CLOSED.includes(current.status) && CLOSED.includes(newStatus)) {
      const ok = await confirmAction(
        `سيتم ${newStatus === "CANCELLED" ? "إلغاء" : "استرجاع"} الطلب وإرجاع قطعه إلى المخزون. هل أنت متأكد؟`,
        newStatus === "CANCELLED" ? "إلغاء الطلب" : "استرجاع الطلب"
      );
      if (!ok) return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "فشل في تحديث الحالة");
      }

      const updatedOrder = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );

      toast.success("تم تحديث حالة الطلب");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل في تحديث الحالة");
    }
  };

  // دالة مساعدة للحصول على اسم المسؤول
  const getAdminDisplayName = (order: Order) => {
    if (!order.assignedAdminId) return "غير مسند";

    if (order.assignedAdmin) {
      return order.assignedAdmin.name || order.assignedAdmin.email || "مسؤول";
    }

    if (order.assignedAdminId === session?.user?.id) {
      return "أنت";
    }

    return `مسؤول (${order.assignedAdminId.substring(0, 8)}...)`;
  };

  // فتح popup لعرض تفاصيل الطلب
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // إغلاق popup
  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const q = query.trim().toLowerCase();
  const visibleOrders = orders.filter(
    (o) =>
      (filter === "ALL" || o.status === filter) &&
      (!q ||
        [o.orderNumber, o.customerName, o.customerPhone, o.user?.name, o.user?.email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)))
  );

  if (loading) return <p className="p-8 text-center text-primary/70">جاري تحميل الطلبات...</p>;
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-[#9b2c1f]">{error}</p>
        <button onClick={() => location.reload()} className="fl-btn-oval">إعادة المحاولة</button>
      </div>
    );
  }

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return (
      <div className="container mx-auto min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح بالدخول</h1>
        <p className="mt-4">
          يجب أن تكون أدمن أو سوبر أدمن للوصول إلى هذه الصفحة
        </p>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto min-h-screen p-4"
      style={{ direction: "rtl" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">مسجل دخولك كـ:</p>
            <p className="font-semibold text-blue-700">
              {session.user.role === "SUPERADMIN" ? "سوبر أدمن" : "أدمن"}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">اسمك:</p>
            <p className="font-semibold text-green-700">
              {session.user.name || session.user.email}
            </p>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="mb-6 space-y-3">
          <label htmlFor="orders-q" className="sr-only">بحث في الطلبات</label>
          <input
            id="orders-q"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف"
            className="fl-input"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحالة">
            {["ALL", ...ORDER_STATUSES].map((st) => {
              const n = st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length;
              if (st !== "ALL" && n === 0) return null;
              const on = filter === st;
              return (
                <button
                  key={st}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setFilter(st);
                    setShown(PAGE);
                  }}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
                    on ? "border-primary bg-primary text-primary-foreground" : "border-primary/25 text-primary hover:border-primary/60"
                  }`}
                >
                  {st === "ALL" ? "الكل" : statusAr(st)}
                  <span className="text-xs opacity-80">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد طلبات حتى الآن</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <p className="py-12 text-center text-primary/70">لا توجد طلبات تطابق البحث</p>
      ) : (
        <div className="space-y-6">
          {visibleOrders.slice(0, shown).map((order) => {
            const canEditStatus =
              session.user.role === "SUPERADMIN" ||
              (session.user.role === "ADMIN" &&
                (!order.assignedAdminId ||
                  order.assignedAdminId === session.user.id));

            const adminDisplayName = getAdminDisplayName(order);
            const isAssignedToMe = order.assignedAdminId === session.user.id;

            return (
              <div
                key={order.id}
                className="border rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white"
              >
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-bold text-lg text-gray-800">
                        الطلب #{order.orderNumber}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS[order.status]?.chip ?? "bg-gray-100 text-gray-800"}`}>
                        {statusAr(order.status)}
                      </span>
                    </div>

                    <p className="mb-2 text-sm text-primary/75">
                      {fmtDate(order.createdAt)} · {order.orderItems.reduce((n, i) => n + i.quantity, 0)} قطعة
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">المسؤول:</span>
                        <span
                          className={`font-medium ${
                            isAssignedToMe ? "text-blue-600" : "text-gray-800"
                          }`}
                        >
                          {adminDisplayName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="flex flex-col items-end gap-3">
                    {canEditStatus ? (
                      <>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusAr(status)}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isAssignedToMe ? "bg-green-500" : "bg-blue-500"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-600">
                            {isAssignedToMe
                              ? "أنت المسؤول عن هذا الطلب"
                              : "تستطيع تعديل هذا الطلب"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">
                          لا يمكنك التعديل
                        </p>
                        <p className="text-xs text-gray-500">
                          مسؤول عن التعديل: {adminDisplayName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Customer Info: name, phone, address, city, notes (the e-mail only for a real account) */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    معلومات العميل والتوصيل {isGuest(order) && <span className="ms-2 rounded-full bg-gold/25 px-2 py-0.5 text-xs">طلب كضيف</span>}
                  </h3>
                  <CustomerBlock order={order} />
                </div>

                {/* Order Summary */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    ملخص الطلب
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-sm text-gray-600">المجموع</p>
                      <p className="font-medium text-lg">
                        {order.totalAmount.toFixed(2)} ج.م
                      </p>
                    </div>
                    {order.totalAmount > order.finalAmount && (
                      <div>
                        <p className="text-sm text-gray-600">خصم العرض (قطع مجانية)</p>
                        <p className="font-medium text-lg text-[#9b2c1f]">
                          -{(order.totalAmount - order.finalAmount).toFixed(2)} ج.م
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">المبلغ النهائي</p>
                      <p className="font-medium text-lg text-green-600">
                        {order.finalAmount.toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items - Clickable Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700">عناصر الطلب</h3>
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">عرض التفاصيل الكاملة</span>
                    </button>
                  </div>

                  <div
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => openOrderDetails(order)}
                  >
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                        >
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.variantDetails && (
                              <p className="text-sm text-gray-600">
                                {item.variantDetails}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              الكمية: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {item.price.toFixed(2)} ج.م
                            </p>
                            <p className="text-sm text-gray-600">
                              الإجمالي:{" "}
                              {(item.price * item.quantity).toFixed(2)} ج.م
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-blue-600">
                        انقر لعرض جميع تفاصيل المنتجات
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {visibleOrders.length > shown && (
            <div className="text-center">
              <button onClick={() => setShown((n) => n + PAGE)} className="fl-btn-oval">
                عرض المزيد ({visibleOrders.length - shown})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Details Popup */}
      {showOrderDetails && selectedOrder && (
        <AdminModal onClose={closeOrderDetails} label="تفاصيل الطلب" wide>
          <div>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  تفاصيل الطلب #{selectedOrder.orderNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  تاريخ الطلب:{" "}
                  {fmtDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Order Status */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">حالة الطلب</h3>
                  <span className={`px-4 py-2 rounded-lg text-white font-medium ${STATUS[selectedOrder.status]?.solid ?? "bg-gray-600"}`}>
                    {statusAr(selectedOrder.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">الإجمالي</p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedOrder.finalAmount.toFixed(2)} ج.م
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-6 border-b">
              <h3 className="font-semibold text-lg mb-4">
                معلومات العميل والتوصيل {isGuest(selectedOrder) && <span className="ms-2 rounded-full bg-gold/25 px-2 py-0.5 text-xs">طلب كضيف</span>}
              </h3>
              <CustomerBlock order={selectedOrder} />
            </div>

            {/* Order Items Details */}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">تفاصيل المنتجات</h3>
              <div className="space-y-6">
                {selectedOrder.orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-xl overflow-hidden"
                  >
                    <div className="bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">
                          المنتج #{index + 1}: {item.productName}
                        </h4>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {item.price.toFixed(2)} ج.م
                          </p>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {item.originalPrice.toFixed(2)} ج.م
                              </p>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">الكمية</p>
                            <p className="font-medium">{item.quantity} قطعة</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">الإجمالي</p>
                            <p className="font-medium text-lg">
                              {(item.price * item.quantity).toFixed(2)} ج.م
                            </p>
                          </div>
                        </div>

                        {item.discountAmount && item.discountAmount > 0 && (
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                خصم السعر على هذا المنتج
                              </p>
                              <p className="font-medium text-green-600">
                                -{(item.discountAmount * item.quantity).toFixed(2)} ج.م
                              </p>
                            </div>
                          </div>
                        )}

                        {item.product?.code && (
                          <div className="flex items-center gap-3">
                            <Hash className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                كود المنتج
                              </p>
                              <p className="font-medium">{item.product.code}</p>
                            </div>
                          </div>
                        )}

                        {item.product?.category && (
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">الفئة</p>
                              <p className="font-medium">
                                {CATEGORY_AR[item.product.category] ?? item.product.category}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Variant Details */}
                      {item.variant && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Palette className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-600">اللون:</p>
                              <p className="font-medium">
                                {item.variant.color}
                              </p>
                              {item.variant.colorHex && (
                                <div
                                  className="w-6 h-6 rounded-full border"
                                  style={{
                                    backgroundColor: item.variant.colorHex,
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {item.variant.stock !== undefined && (
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  المخزون الحالي
                                </p>
                                <p
                                  className={`font-medium ${
                                    item.variant.stock > 10
                                      ? "text-green-600"
                                      : item.variant.stock > 0
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.variant.stock} قطعة
                                </p>
                              </div>
                            </div>
                          )}

                          {item.variantDetails && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">
                                المطلوب (اللون / المقاس)
                              </p>
                              <p className="text-gray-800">
                                {item.variantDetails}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">ملخص الطلب</h4>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {selectedOrder.finalAmount.toFixed(2)} ج.م
                    </p>
                    {selectedOrder.totalAmount !==
                      selectedOrder.finalAmount && (
                      <p className="text-sm text-gray-500 line-through">
                        {selectedOrder.totalAmount.toFixed(2)} ج.م
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">عدد المنتجات</p>
                    <p className="text-2xl font-bold">
                      {selectedOrder.orderItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">المنتجات المختلفة</p>
                    <p className="text-2xl font-bold">
                      {selectedOrder.orderItems.length}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">إجمالي الخصم</p>
                    <p className="text-2xl font-bold text-red-600">
                      {(
                        selectedOrder.orderItems.reduce((sum, item) => sum + (item.discountAmount || 0) * item.quantity, 0) +
                        (selectedOrder.totalAmount - selectedOrder.finalAmount)
                      ).toFixed(2)}{" "}
                      ج.م
                    </p>
                    {selectedOrder.totalAmount > selectedOrder.finalAmount && (
                      <p className="mt-1 text-xs text-primary/75">
                        منه {(selectedOrder.totalAmount - selectedOrder.finalAmount).toFixed(2)} ج.م خصم عرض (قطع مجانية)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={closeOrderDetails}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
};

export default Page;
