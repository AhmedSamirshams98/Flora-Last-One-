"use client";
import { toast } from "sonner";
import AdminModal from "@/app/components/AdminModal";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
];

const Page = () => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالة لعرض popup
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("فشل في جلب الطلبات");
        const data = await res.json();
        setOrders(data);
      } catch {
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

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">لا توجد طلبات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "PROCESSING"
                            ? "bg-indigo-100 text-indigo-800"
                            : order.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

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
                              {status === "PENDING"
                                ? "قيد الانتظار"
                                : status === "CONFIRMED"
                                ? "مؤكد"
                                : status === "PROCESSING"
                                ? "قيد المعالجة"
                                : status === "SHIPPED"
                                ? "تم الشحن"
                                : status === "DELIVERED"
                                ? "تم التوصيل"
                                : "ملغي"}
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

                {/* Customer Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    معلومات العميل
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-sm text-gray-600">الاسم</p>
                      <p className="font-medium">{order.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-medium">{order.user.email}</p>
                    </div>
                  </div>
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
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "ar-SA"
                  )}
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
                  <span
                    className={`px-4 py-2 rounded-lg text-white font-medium ${
                      selectedOrder.status === "PENDING"
                        ? "bg-yellow-500"
                        : selectedOrder.status === "CONFIRMED"
                        ? "bg-blue-500"
                        : selectedOrder.status === "PROCESSING"
                        ? "bg-indigo-500"
                        : selectedOrder.status === "SHIPPED"
                        ? "bg-purple-500"
                        : selectedOrder.status === "DELIVERED"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {selectedOrder.status === "PENDING"
                      ? "قيد الانتظار"
                      : selectedOrder.status === "CONFIRMED"
                      ? "مؤكد"
                      : selectedOrder.status === "PROCESSING"
                      ? "قيد المعالجة"
                      : selectedOrder.status === "SHIPPED"
                      ? "تم الشحن"
                      : selectedOrder.status === "DELIVERED"
                      ? "تم التوصيل"
                      : "ملغي"}
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
              <h3 className="font-semibold text-lg mb-4">معلومات العميل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الاسم</p>
                  <p className="font-medium text-lg">
                    {selectedOrder.user.name}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    البريد الإلكتروني
                  </p>
                  <p className="font-medium text-lg">
                    {selectedOrder.user.email}
                  </p>
                </div>
              </div>
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
                                قيمة الخصم
                              </p>
                              <p className="font-medium text-green-600">
                                -{item.discountAmount.toFixed(2)} ج.م
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
                                {item.product.category}
                              </p>
                            </div>
                          </div>
                        )}
                        {item.product?.category && (
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-600">
                                كود المنتج
                              </p>
                              <p className="font-medium">{item.product.id}</p>
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

                          {item.variant.sizes &&
                            item.variant.sizes.length > 0 && (
                              <div className="flex items-center gap-3">
                                <Ruler className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="text-sm text-gray-600">
                                    المقاسات
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {item.variant.sizes.map((size) => (
                                      <span
                                        key={size}
                                        className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                                      >
                                        {size}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

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
                                تفاصيل إضافية
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
                    <p className="text-sm text-gray-600">قيمة الخصم الإجمالي</p>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedOrder.orderItems
                        .reduce(
                          (sum, item) => sum + (item.discountAmount || 0),
                          0
                        )
                        .toFixed(2)}{" "}
                      ج.م
                    </p>
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
