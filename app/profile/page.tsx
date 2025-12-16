"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import { X, ShoppingBag, User, Calendar, Package } from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  color?: string;
  size?: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  userId: string;
  assignedAdminId?: string;
  assignedAdmin?: {
    name: string;
    email: string;
    image?: string;
  };
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  orderItems: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  createdAt: string;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);

      if (session?.user) {
        setUserProfile({
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || undefined,
          role: session.user.role,
          createdAt: new Date().toISOString(),
        });
      }

      const response = await axios.get("/api/orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "فشل في تحميل البيانات");
      } else {
        toast.error("فشل في تحميل البيانات");
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    }
  }, [status, fetchProfileData]);

  const handleQuickStatusUpdate = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const response = await axios.patch(`/api/orders/${orderId}`, {
        status: newStatus,
        assignedAdminId: session?.user?.id,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? response.data.order : order
        )
      );

      // تحديث الطلب المحدد إذا كان مفتوحاً
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(response.data.order);
      }

      setEditingStatus(null);
      toast.success("تم تحديث حالة الطلب بنجاح");
    } catch (error) {
      console.error("Error updating order:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "فشل في تحديث حالة الطلب");
      } else {
        toast.error("فشل في تحديث حالة الطلب");
      }
    }
  };

  const canEditOrder = (order: Order) => {
    if (!session?.user) return false;

    if (session.user.role === "SUPERADMIN") return true;

    if (session.user.role === "ADMIN") {
      return (
        !order.assignedAdminId || order.assignedAdminId === session.user.id
      );
    }

    return false;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "قيد الانتظار";
      case "PROCESSING":
        return "جاري المعالجة";
      case "SHIPPED":
        return "تم الشحن";
      case "DELIVERED":
        return "تم التسليم";
      case "CANCELLED":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PENDING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Popup لعرض تفاصيل الطلب
  const OrderDetailsPopup = ({
    order,
    onClose,
  }: {
    order: Order;
    onClose: () => void;
  }) => {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">تفاصيل الطلب</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* معلومات الطلب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">رقم الطلب:</span>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  #{order.orderNumber}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    تاريخ الطلب:
                  </span>
                </div>
                <p className="text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* حالة الطلب */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">حالة الطلب</h3>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
                {canEditOrder(order) && (
                  <div className="relative">
                    {editingStatus === order.id ? (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleQuickStatusUpdate(order.id, e.target.value)
                        }
                        onBlur={() => setEditingStatus(null)}
                        autoFocus
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">قيد الانتظار</option>
                        <option value="PROCESSING">جاري المعالجة</option>
                        <option value="SHIPPED">تم الشحن</option>
                        <option value="DELIVERED">تم التسليم</option>
                        <option value="CANCELLED">ملغي</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingStatus(order.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        تغيير الحالة
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* معلومات العميل */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">معلومات العميل</h3>
              <div className="flex items-center gap-3">
                {order.user?.image ? (
                  <Image
                    src={order.user.image}
                    alt={order.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {order.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">{order.user?.email}</p>
                </div>
              </div>
            </div>

            {/* الأدمن المعين */}
            {order.assignedAdmin && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">
                  مسؤول المتابعة
                </h3>
                <div className="flex items-center gap-3">
                  {order.assignedAdmin.image ? (
                    <Image
                      src={order.assignedAdmin.image}
                      alt={order.assignedAdmin.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.assignedAdmin.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.assignedAdmin.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* المنتجات */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-4">
                المنتجات ({order.orderItems.length})
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    {/* صورة المنتج */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {item.productName}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.color && (
                          <span className="text-sm text-gray-600">
                            اللون: {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-sm text-gray-600">
                            المقاس: {item.size}
                          </span>
                        )}
                        <span className="text-sm text-gray-600">
                          الكمية: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {item.price.toFixed(2)} جنيه
                      </p>
                      <p className="text-sm text-gray-600">
                        المجموع: {(item.price * item.quantity).toFixed(2)} جنيه
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الإجمالي */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-800">
                  المبلغ الإجمالي
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {order.totalAmount.toFixed(2)} جنيه
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">غير مصرح</h2>
          <p className="text-gray-600">يجب تسجيل الدخول لعرض هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-gess">
      <div className="max-w-6xl mx-auto">
        {/* معلومات المستخدم */}
        <div className="bg-white rounded-xl shadow-sm border border-primary p-6 mb-6">
          <div className="flex flex-row justify-between ">
            <h1 className="text-xl font-bold text-primary mb-6">
              الملف الشخصي
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1 font-gess">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary">
                    {userProfile?.name}
                  </h2>
                  <p className="text-primary ">{userProfile?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الطلبات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">الطلبات</h2>
            <span className="text-gray-600 mt-2 md:mt-0">
              {orders.length} طلب
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">لا توجد طلبات حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        رقم الطلب - {order.orderNumber}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </p>

                      {order.assignedAdmin && (
                        <p className="text-sm text-blue-600 mt-1">
                          مسؤول متابعة: {order.assignedAdmin.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-4 lg:mt-0">
                      {/* حالة الطلب - قابلة للنقر للمسؤولين */}
                      {canEditOrder(order) ? (
                        <div
                          className="relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {editingStatus === order.id ? (
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleQuickStatusUpdate(
                                  order.id,
                                  e.target.value
                                )
                              }
                              onBlur={() => setEditingStatus(null)}
                              autoFocus
                              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                            >
                              <option value="PENDING">قيد الانتظار</option>
                              <option value="PROCESSING">جاري المعالجة</option>
                              <option value="SHIPPED">تم الشحن</option>
                              <option value="DELIVERED">تم التسليم</option>
                              <option value="CANCELLED">ملغي</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingStatus(order.id)}
                              className={`px-3 py-1 rounded-full text-sm font-medium border cursor-pointer transition-all hover:shadow-md ${getStatusColor(
                                order.status
                              )} min-w-[120px]`}
                            >
                              {getStatusText(order.status)}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            order.status
                          )} min-w-[120px] text-center`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* المنتجات */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">
                      المنتجات:
                    </h4>
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-gray-800">
                              {item.productName}
                            </span>
                            {item.color && (
                              <span className="text-gray-600 mr-2">
                                {" "}
                                - {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-gray-600">
                                {" "}
                                - {item.size}
                              </span>
                            )}
                            <span className="text-gray-500 mr-2">
                              {" "}
                              (×{item.quantity})
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {(item.price * item.quantity).toFixed(2)} جنيه
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row justify-between font-gess w-full">
                    <h1>الاجمالي </h1>
                    <span className="text-lg font-bold text-blue-600">
                      {order.totalAmount.toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup تفاصيل الطلب */}
      {selectedOrder && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
