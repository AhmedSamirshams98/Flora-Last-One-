"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  X,
  Eye,
  Package,
  Tag,
  Palette,
  Ruler,
  DollarSign,
  Calendar,
  User,
  Phone,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// استيراد ملفات الترجمة
import arTranslations from "@/messages/ar.json";
import enTranslations from "@/messages/en.json";

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
    images?: string[];
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
  shippingAddress?: string;
  shippingCity?: string;
  customerName?: string;
  customerPhone?: string;
  assignedAdminId?: string;
  assignedAdmin?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// حالة الطلب مع الترجمة
const ORDER_STATUSES = [
  { value: "PENDING", ar: "قيد الانتظار", en: "Pending" },
  { value: "CONFIRMED", ar: "مؤكد", en: "Confirmed" },
  { value: "PROCESSING", ar: "قيد المعالجة", en: "Processing" },
  { value: "SHIPPED", ar: "تم الشحن", en: "Shipped" },
  { value: "DELIVERED", ar: "تم التوصيل", en: "Delivered" },
  { value: "CANCELLED", ar: "ملغي", en: "Cancelled" },
];

const OrdersPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const pathname = usePathname();

  // تحديد اللغة بناءً على المسار
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  // استخدام الترجمات المناسبة
  const translations = lang === "ar" ? arTranslations : enTranslations;
  const t = translations.orders || {};
  const isRTL = lang === "ar";

  const [orders, setOrders] = useState<Order[]>([]);
  console.log(orders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالة لعرض popup
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // دالة ترجمة حالة الطلب
  const translateStatus = (status: string) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);
    if (!statusObj) return status;
    return lang === "ar" ? statusObj.ar : statusObj.en;
  };

  // دالة الحصول على لون حالة الطلب
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case "CONFIRMED":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "PROCESSING":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          icon: <Package className="w-4 h-4" />,
        };
      case "SHIPPED":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          icon: <Truck className="w-4 h-4" />,
        };
      case "DELIVERED":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "CANCELLED":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: <Clock className="w-4 h-4" />,
        };
    }
  };

  // دالة تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // دالة الحصول على صور المنتج
  const getProductImages = (item: OrderItem) => {
    // أولوية لصور المتغير
    if (item.variant?.images && item.variant.images.length > 0) {
      return item.variant.images;
    }
    // ثم صور المنتج الرئيسية
    if (item.product?.images && item.product.images.length > 0) {
      return item.product.images;
    }
    // صورة افتراضية
    return [];
  };

  // دالة فتح معرض الصور
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // دالة إغلاق معرض الصور
  const closeImageModal = () => {
    setSelectedImage(null);
    setShowImageModal(false);
  };

  // جلب طلبات المستخدم
  const fetchUserOrders = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/user/${session.user.id}`);
      if (!res.ok) throw new Error(t.fetchError || "Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(t.fetchError || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, t.fetchError]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserOrders();
    }
  }, [session?.user?.id, fetchUserOrders]);

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

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading || "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t.loginRequired || "Login Required"}
          </h1>
          <p className="text-gray-600 mb-6">
            {t.loginMessage || "Please login to view your orders"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t.error || "Error"}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserOrders}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.retry || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 font-gess"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-primary hover:text-gray-800 transition-colors"
            >
              {isRTL ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
              <span className="font-medium">{t.back ?? "Back"}</span>
            </button>
            <div className="text-center">
              <p className="text-sm text-primary">{t.welcome ?? "Welcome"}</p>
              <p className="font-semibold text-primary">
                {session?.user?.name ?? session?.user?.email}
              </p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1
              className={`text-3xl mb-2 ${
                lang === "ar"
                  ? "font-gess font-medium"
                  : "font-sans font-semibold"
              }`}
            >
              {t.pageTitle ?? "My Orders"}
            </h1>
            <p
              className={`text-xl mb-2 ${
                lang === "ar"
                  ? "font-gess font-medium"
                  : "font-sans font-semibold"
              }`}
            >
              {t.subtitle ?? "View and track all your orders"}
            </p>
          </div>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t.noOrders ?? "No Orders Yet"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t.noOrdersMessage ??
                "You haven't placed any orders yet. Start shopping to see your orders here."}
            </p>
            <button
              onClick={() => (window.location.href = `/${lang}/products`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.startShopping ?? "Start Shopping"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusColor = getStatusColor(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2
                          className={`${
                            lang === "ar"
                              ? "font-gess font-medium"
                              : "font-sans font-semibold"
                          } text-xl text-gray-900`}
                        >
                          {t.order ?? "Order"} #{order.orderNumber}
                        </h2>
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                        >
                          {statusColor.icon}
                          <span
                            className={`${
                              lang === "ar"
                                ? "font-gess font-medium"
                                : "font-sans font-semibold"
                            }`}
                          >
                            {translateStatus(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {t.orderDate ?? "Order Date"}:
                          </span>
                          <span className="font-medium">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            {t.amount ?? "Amount"}:
                          </span>
                          <span className="font-medium text-green-600">
                            {order.finalAmount.toFixed(2)}{" "}
                            {lang === "ar" ? "ج.م" : "EGP"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openOrderDetails(order)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">
                        {t.viewDetails ?? "View Details"}
                      </span>
                    </button>
                  </div>

                  {/* Items Summary */}
                  <div className="border-t border-gray-200 my-4"></div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {t.items ?? "Items"} (
                    {order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                    )
                  </h3>
                  <div className="space-y-4">
                    {order.orderItems.slice(0, 3).map((item) => {
                      const images = getProductImages(item);
                      const firstImage = images?.[0];

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row gap-4 items-start"
                        >
                          <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            {firstImage ? (
                              <Image
                                src={firstImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                sizes="80px"
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/api/placeholder/80/80";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.productName}
                                </p>
                                {item.variantDetails && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.variantDetails}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="text-gray-600">
                                    {t.quantity ?? "Quantity"}:{" "}
                                    <span className="font-medium">
                                      {item.quantity}
                                    </span>
                                  </span>
                                  <span className="text-gray-600">
                                    {t.price ?? "Price"}:{" "}
                                    <span className="font-medium">
                                      {item.price.toFixed(2)}{" "}
                                      {lang === "ar" ? "ج.م" : "EGP"}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-bold text-lg text-blue-600">
                                  {(item.price * item.quantity).toFixed(2)}{" "}
                                  {lang === "ar" ? "ج.م" : "EGP"}
                                </p>
                                {item.discountAmount &&
                                  item.discountAmount > 0 && (
                                    <p className="text-sm text-green-600">
                                      {t.saved ?? "Saved"}:{" "}
                                      {item.discountAmount.toFixed(2)}
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {order.orderItems.length > 3 && (
                      <div className="text-center pt-2 border-t border-gray-100">
                        <p className="text-sm text-blue-600">
                          + {order.orderItems.length - 3}{" "}
                          {t.moreItems ?? "more items"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Info */}
                  {(order.shippingAddress ||
                    order.customerName ||
                    order.customerPhone) && (
                    <>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          {t.shippingInfo ?? "Shipping Information"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {order.customerName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  {t.customerName ?? "Customer"}
                                </p>
                                <p className="font-medium">
                                  {order.customerName}
                                </p>
                              </div>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  {t.phone ?? "Phone"}
                                </p>
                                <p className="font-medium">
                                  {order.customerPhone}
                                </p>
                              </div>
                            </div>
                          )}
                          {order.shippingAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  {t.address ?? "Address"}
                                </p>
                                <p className="font-medium">
                                  {order.shippingAddress}, {order.shippingCity}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2
                  className={`${
                    lang === "ar" ? "font-gess" : "font-sans"
                  } text-2xl md:text-3xl font-bold text-primary`}
                >
                  {t.orderDetails || "Order Details"}
                </h2>
                <p
                  className={`${
                    lang === "ar" ? "font-gess" : "font-sans"
                  } text-lg md:text-xl text-gray-700 mt-1`}
                >
                  {selectedOrder.orderNumber}
                </p>
                <p className="text-gray-600 mt-1">
                  {t.orderDate || "Order Date"}:{" "}
                  {formatDate(selectedOrder.createdAt)}
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
            <div className="p-6 border-b flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {t.orderStatus || "Order Status"}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      getStatusColor(selectedOrder.status).bg
                    } ${getStatusColor(selectedOrder.status).text}`}
                  >
                    {getStatusColor(selectedOrder.status).icon}
                    <span className="font-medium">
                      {translateStatus(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.lastUpdated || "Last updated"}:{" "}
                    {formatDate(selectedOrder.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-600">
                  {t.totalAmount || "Total Amount"}
                </p>
                <p className="text-3xl md:text-4xl font-bold text-green-600">
                  {selectedOrder.finalAmount.toFixed(2)}{" "}
                  {lang === "ar" ? "ج.م" : "EGP"}
                </p>
              </div>
            </div>

            {/* Shipping Information */}
            {(selectedOrder.customerName ||
              selectedOrder.customerPhone ||
              selectedOrder.shippingAddress) && (
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-4">
                  {t.shippingInfo || "Shipping Information"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedOrder.customerName && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          {t.customerName || "Customer Name"}
                        </p>
                      </div>
                      <p
                        className={`${
                          lang === "ar" ? "font-gess" : "font-sans"
                        } font-medium text-lg`}
                      >
                        {selectedOrder.customerName}
                      </p>
                    </div>
                  )}
                  {selectedOrder.customerPhone && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          {t.phone || "Phone Number"}
                        </p>
                      </div>
                      <p
                        className={`${
                          lang === "ar" ? "font-gess" : "font-sans"
                        } font-medium text-lg`}
                      >
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          {t.shippingAddress || "Shipping Address"}
                        </p>
                      </div>
                      <p
                        className={`${
                          lang === "ar" ? "font-gess" : "font-sans"
                        } font-medium text-lg`}
                      >
                        {selectedOrder.shippingAddress}
                      </p>
                      {selectedOrder.shippingCity && (
                        <p className="text-gray-600">
                          {selectedOrder.shippingCity}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">
                {t.orderItems || "Order Items"}
              </h3>
              <div className="space-y-6">
                {selectedOrder.orderItems.map((item, index) => {
                  const images = getProductImages(item);
                  return (
                    <div
                      key={item.id}
                      className="border rounded-xl overflow-hidden"
                    >
                      <div className="bg-blue-50 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <h4
                          className={`${
                            lang === "ar" ? "font-gess" : "font-sans"
                          } font-bold text-lg`}
                        >
                          {t.item || "Item"} #{index + 1}: {item.productName}
                        </h4>
                        <div className="text-right">
                          <p className="text-2xl md:text-3xl font-bold text-green-600">
                            {item.price.toFixed(2)}{" "}
                            {lang === "ar" ? "ج.م" : "EGP"}
                          </p>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {item.originalPrice.toFixed(2)}{" "}
                                {lang === "ar" ? "ج.م" : "EGP"}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Images */}
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                          <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />{" "}
                            {t.productImages || "Product Images"}
                          </h5>
                          <div className="space-y-3">
                            {images.length > 0 ? (
                              <>
                                <div
                                  className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer border border-gray-200"
                                  onClick={() => openImageModal(images[0])}
                                >
                                  <Image
                                    src={images[0]}
                                    alt={`${item.productName} - Main`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    unoptimized
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/api/placeholder/400/400";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                                </div>
                                {images.length > 1 && (
                                  <div className="grid grid-cols-4 gap-2 mt-2">
                                    {images.slice(1).map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="relative h-20 rounded-md overflow-hidden cursor-pointer border border-gray-200"
                                        onClick={() => openImageModal(img)}
                                      >
                                        <Image
                                          src={img}
                                          alt={`${item.productName} - ${
                                            idx + 2
                                          }`}
                                          fill
                                          className="object-cover hover:scale-110 transition-transform duration-300"
                                          sizes="80px"
                                          unoptimized
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "/api/placeholder/80/80";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                <p className="text-gray-500">
                                  {t.noImages || "No images available"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="lg:col-span-2 space-y-4">
                          <p className="text-sm text-gray-600">
                            {t.quantity || "Quantity"}:{" "}
                            <span className="font-medium">
                              {item.quantity} {t.piece || "piece"}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            {t.total || "Total"}:{" "}
                            <span className="font-medium">
                              {(item.price * item.quantity).toFixed(2)}{" "}
                              {lang === "ar" ? "ج.م" : "EGP"}
                            </span>
                          </p>
                          {item.discountAmount && item.discountAmount > 0 && (
                            <p className="text-sm text-gray-600">
                              {t.discount || "Discount"}:
                              <span className="font-medium text-red-600">
                                -{item.discountAmount?.toFixed(2)}{" "}
                                {lang === "ar" ? "ج.م" : "EGP"}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  {t.totalItems || "Total Items"}
                </p>
                <p className="text-2xl font-bold">
                  {selectedOrder.orderItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  {t.differentItems || "Different Items"}
                </p>
                <p className="text-2xl font-bold">
                  {selectedOrder.orderItems.length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  {t.totalDiscount || "Total Discount"}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {selectedOrder.orderItems
                    .reduce((sum, item) => sum + (item.discountAmount || 0), 0)
                    .toFixed(2)}{" "}
                  {lang === "ar" ? "ج.م" : "EGP"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={closeOrderDetails}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t.close || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage}
                alt="Enlarged product image"
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/1200/800";
                }}
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-white text-sm">
                {t.clickOutsideToClose || "Click outside to close"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
