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
   (no account) shows the same as a signed-in one. Compact: name and phone side by side on a phone. */
function CustomerBlock({ order }: { order: Order }) {
  const name = order.customerName || order.user?.name;
  const phone = order.customerPhone;
  // Egypt is +20 and the number keeps its 0: 01012345678 -> 201012345678
  const wa = phone ? `https://wa.me/2${phone}` : null;
  const cell = "rounded-xl bg-secondary/50 p-3";
  const label = "mb-0.5 text-xs text-primary/70";
  const pill = "inline-flex min-h-11 items-center rounded-full border border-primary/30 px-3 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground";
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <div className={cell}>
        <p className={label}>الاسم</p>
        <p className="break-words font-medium text-primary">{name || "—"}</p>
      </div>
      <div className={cell}>
        <p className={label}>الهاتف</p>
        {phone ? (
          <p className="flex flex-wrap items-center gap-2">
            <a href={`tel:+2${phone}`} dir="ltr" className={pill}>{phone}</a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={pill}>واتساب</a>
            )}
          </p>
        ) : (
          <p className="font-medium">—</p>
        )}
      </div>
      <div className={`${cell} col-span-2`}>
        <p className={label}>العنوان</p>
        <p className="font-medium text-primary">{[order.shippingAddress, order.shippingCity].filter(Boolean).join("، ") || "—"}</p>
      </div>
      {order.notes && (
        <div className={`${cell} col-span-2 md:col-span-4`}>
          <p className={label}>ملاحظات العميل</p>
          <p className="font-medium text-primary">{order.notes}</p>
        </div>
      )}
      {!isGuest(order) && order.user?.email && (
        <div className={`${cell} col-span-2 md:col-span-4`}>
          <p className={label}>البريد الإلكتروني (حساب Google)</p>
          <p dir="ltr" className="break-all font-medium text-primary">{order.user.email}</p>
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
        <h1 className="text-3xl md:text-4xl">إدارة الطلبات</h1>
        <p className="mt-2 text-sm text-primary/70">
          {session.user.role === "SUPERADMIN" ? "سوبر أدمن" : "أدمن"} · {session.user.name || session.user.email}
        </p>
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
            placeholder="ابحث: رقم الطلب أو الاسم أو الهاتف"
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
          <p className="text-primary/70 text-lg">لا توجد طلبات حتى الآن</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <p className="py-12 text-center text-primary/70">لا توجد طلبات تطابق البحث</p>
      ) : (
        <div className="space-y-6">
          {visibleOrders.slice(0, shown).map((order) => {
            const canEditStatus =
              session.user.role === "SUPERADMIN" ||
              (session.user.role === "ADMIN" && (!order.assignedAdminId || order.assignedAdminId === session.user.id));
            const adminDisplayName = getAdminDisplayName(order);
            const isAssignedToMe = order.assignedAdminId === session.user.id;
            const pieces = order.orderItems.reduce((n, i) => n + i.quantity, 0);
            const offerDiscount = order.totalAmount - order.finalAmount;

            return (
              <article key={order.id} className="fl-pcard !p-4 md:!p-6">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="fl-display text-2xl text-primary">الطلب #{order.orderNumber}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS[order.status]?.chip ?? "bg-secondary/60 text-primary"}`}>
                        {statusAr(order.status)}
                      </span>
                      {isGuest(order) && <span className="rounded-full bg-gold/25 px-2 py-0.5 text-xs text-primary">طلب كضيف</span>}
                    </div>
                    <p className="mt-1 text-sm text-primary/70">
                      {fmtDate(order.createdAt)} · {pieces} قطعة
                    </p>
                    <p className="text-sm text-primary/80">
                      المسؤول: <span className={`font-medium ${isAssignedToMe ? "text-primary" : ""}`}>{adminDisplayName}</span>
                    </p>
                  </div>

                  <div className="w-full sm:w-56">
                    {canEditStatus ? (
                      <>
                        <label htmlFor={`st-${order.id}`} className="mb-1 block text-xs text-primary/70">حالة الطلب</label>
                        <select
                          id={`st-${order.id}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="fl-input"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusAr(status)}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-primary/70">
                          {isAssignedToMe ? "أنت المسؤول عن هذا الطلب" : "تستطيع تعديل هذا الطلب"}
                        </p>
                      </>
                    ) : (
                      <p className="rounded-xl bg-secondary/50 p-3 text-sm text-primary/80">
                        لا يمكنك تعديل هذا الطلب. المسؤول: {adminDisplayName}
                      </p>
                    )}
                  </div>
                </header>

                <div className="my-4 h-px bg-gold/40" />

                <CustomerBlock order={order} />

                <ul className="mt-4 divide-y divide-gold/30 rounded-xl bg-secondary/40 px-3">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {item.variant?.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.variant.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-primary">{item.productName}</p>
                        <p className="text-sm text-primary/70">
                          {[item.variantDetails, `× ${item.quantity}`].filter(Boolean).join("  ·  ")}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-primary">{(item.price * item.quantity).toFixed(2)} ج.م</p>
                    </li>
                  ))}
                </ul>

                <footer className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <div>
                      <dt className="text-xs text-primary/70">المجموع</dt>
                      <dd className="font-medium text-primary">{order.totalAmount.toFixed(2)} ج.م</dd>
                    </div>
                    {offerDiscount > 0 && (
                      <div>
                        <dt className="text-xs text-primary/70">خصم العرض (قطع مجانية)</dt>
                        <dd className="font-medium text-[#9b2c1f]">-{offerDiscount.toFixed(2)} ج.م</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-primary/70">المبلغ النهائي</dt>
                      <dd className="fl-display text-2xl text-primary">{order.finalAmount.toFixed(2)} ج.م</dd>
                    </div>
                  </dl>
                  <button onClick={() => openOrderDetails(order)} className="fl-btn-oval !min-h-11 w-full text-sm sm:w-auto">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    عرض التفاصيل الكاملة
                  </button>
                </footer>
              </article>
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
                <h2 className="fl-display text-2xl text-primary">
                  تفاصيل الطلب #{selectedOrder.orderNumber}
                </h2>
                <p className="text-primary/75 mt-1">
                  تاريخ الطلب:{" "}
                  {fmtDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="text-primary/70 hover:text-primary/85 p-2 rounded-full hover:bg-secondary/60"
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
                  <p className="text-primary/75">الإجمالي</p>
                  <p className="fl-display text-3xl text-primary">
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
                    <div className="bg-secondary/60 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">
                          المنتج #{index + 1}: {item.productName}
                        </h4>
                        <div className="text-right">
                          <p className="fl-display text-2xl text-primary">
                            {item.price.toFixed(2)} ج.م
                          </p>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <p className="text-sm text-primary/70 line-through">
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
                          <Package className="w-5 h-5 text-primary/70" />
                          <div>
                            <p className="text-sm text-primary/75">الكمية</p>
                            <p className="font-medium">{item.quantity} قطعة</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-primary/70" />
                          <div>
                            <p className="text-sm text-primary/75">الإجمالي</p>
                            <p className="font-medium text-lg">
                              {(item.price * item.quantity).toFixed(2)} ج.م
                            </p>
                          </div>
                        </div>

                        {item.discountAmount && item.discountAmount > 0 && (
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-gold" />
                            <div>
                              <p className="text-sm text-primary/75">
                                خصم السعر على هذا المنتج
                              </p>
                              <p className="font-medium text-primary">
                                -{(item.discountAmount * item.quantity).toFixed(2)} ج.م
                              </p>
                            </div>
                          </div>
                        )}

                        {item.product?.code && (
                          <div className="flex items-center gap-3">
                            <Hash className="w-5 h-5 text-primary/70" />
                            <div>
                              <p className="text-sm text-primary/75">
                                كود المنتج
                              </p>
                              <p className="font-medium">{item.product.code}</p>
                            </div>
                          </div>
                        )}

                        {item.product?.category && (
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-primary/70" />
                            <div>
                              <p className="text-sm text-primary/75">الفئة</p>
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
                            <Palette className="w-5 h-5 text-primary/70" />
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-primary/75">اللون:</p>
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
                              <Package className="w-5 h-5 text-primary/70" />
                              <div>
                                <p className="text-sm text-primary/75">
                                  المخزون الحالي
                                </p>
                                <p
                                  className={`font-medium ${
                                    item.variant.stock > 10
                                      ? "text-primary"
                                      : item.variant.stock > 0
                                      ? "text-primary"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.variant.stock} قطعة
                                </p>
                              </div>
                            </div>
                          )}

                          {item.variantDetails && (
                            <div className="mt-4 p-3 bg-secondary/40 rounded-lg">
                              <p className="text-sm text-primary/75 mb-1">
                                المطلوب (اللون / المقاس)
                              </p>
                              <p className="text-primary">
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
                    <p className="fl-display text-3xl text-primary">
                      {selectedOrder.finalAmount.toFixed(2)} ج.م
                    </p>
                    {selectedOrder.totalAmount !==
                      selectedOrder.finalAmount && (
                      <p className="text-sm text-primary/70 line-through">
                        {selectedOrder.totalAmount.toFixed(2)} ج.م
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary/60 p-4 rounded-lg">
                    <p className="text-sm text-primary/75">عدد المنتجات</p>
                    <p className="text-2xl font-bold">
                      {selectedOrder.orderItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </p>
                  </div>

                  <div className="bg-secondary/60 p-4 rounded-lg">
                    <p className="text-sm text-primary/75">المنتجات المختلفة</p>
                    <p className="text-2xl font-bold">
                      {selectedOrder.orderItems.length}
                    </p>
                  </div>

                  <div className="bg-secondary/60 p-4 rounded-lg">
                    <p className="text-sm text-primary/75">إجمالي الخصم</p>
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
                className="fl-cta w-full"
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
