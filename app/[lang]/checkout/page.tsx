"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MapPin, Plus, ShoppingBag } from "lucide-react";
import axios from "axios";
import { Address, CartItem } from "@/types/cart";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

export default function CheckoutPage() {
  const pathname = usePathname();
  const router = useRouter();

  // تحديد اللغة بناءً على المسار
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  const translations = lang === "ar" ? ar : en;
  const t = translations.checkout;

  const isRTL = lang === "ar";

  const { data: session, status } = useSession();
  const { items: cart, getTotalPrice, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const [newAddress, setNewAddress] = useState({
    fullName: session?.user?.name || "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error(t.loginRequired);
      router.push(`/${lang}/auth/signin?callbackUrl=${lang}/checkout`);
    }
  }, [status, router, lang, t.loginRequired]);

  const fetchAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      const response = await axios.get("/api/addresses");
      setAddresses(response.data);

      if (response.data.length > 0) {
        const defaultAddress = response.data.find(
          (addr: Address) => addr.isDefault
        );
        setSelectedAddress(defaultAddress?.id || response.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error(t.addressLoadFailed);
    } finally {
      setAddressLoading(false);
    }
  }, [t.addressLoadFailed]);
  useEffect(() => {
    if (session?.user?.id) {
      fetchAddresses();
    }
  }, [session, fetchAddresses]);

  const handleAddAddress = async () => {
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.address ||
      !newAddress.city
    ) {
      toast.error(t.allFieldsRequired);
      return;
    }

    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      toast.error(t.invalidPhone);
      return;
    }

    try {
      setAddressLoading(true);
      const response = await axios.post("/api/addresses", newAddress);

      setAddresses((prev) => [...prev, response.data]);
      setSelectedAddress(response.data.id);
      setShowAddressForm(false);

      setNewAddress({
        fullName: session?.user?.name || "",
        phone: "",
        address: "",
        city: "",
        isDefault: false,
      });

      toast.success(t.addressAdded);
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error(t.addressAddFailed);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!session || !selectedAddress) {
      toast.error(t.selectAddress);
      return;
    }

    const selectedAddr = addresses.find((addr) => addr.id === selectedAddress);
    if (!selectedAddr) {
      toast.error(t.invalidAddress);
      return;
    }

    setIsLoading(true);

    try {
      // تحضير بيانات الطلب
      const orderData = {
        userId: session.user.id,
        shippingAddressId: selectedAddr.id,
        customerName: selectedAddr.fullName,
        customerPhone: selectedAddr.phone,
        shippingAddress: selectedAddr.address,
        shippingCity: selectedAddr.city,
        items: cart.map((item: CartItem) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          productName: item.name,
          variantDetails: item.color
            ? `${t.color}: ${item.color}${
                item.size ? `, ${t.size}: ${item.size}` : ""
              }`
            : undefined,
        })),
      };

      const response = await axios.post("/api/orders", orderData);

      if (response.data.success) {
        toast.success(`${t.orderCreated}: ${response.data.order.orderNumber}`);
        clearCart();
        setTimeout(() => {
          router.push(`/${lang}`);
        }, 1500);
      } else {
        toast.error(response.data.error || t.orderFailed);
      }
    } catch (error: unknown) {
      console.error("Error creating order:", error);

      let errorMessage = t.unknownError;

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error || error.message || t.unknownError;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t.emptyCartTitle}
          </h2>
          <p className="text-gray-600 mb-6">{t.emptyCartMessage}</p>
          <button
            onClick={() => router.push(`/${lang}/products`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.browseProducts}
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 500 ? 0 : 30;
  const total = subtotal + shipping;

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 font-gess"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${lang}/cart`)}
            className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6 ${
              isRTL ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? "" : "rotate-180"}`} />
            <span className="font-medium">{t.backToCart}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* القسم الأيسر */}
          <div className="lg:col-span-2 space-y-6">
            {/* عنوان الشحن */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t.shippingAddress}
              </h2>

              {addressLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">{t.loading}</p>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {address.fullName}
                          </span>
                          {address.isDefault && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                              {t.default}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.address}، {address.city}
                        </p>
                        <p className="text-gray-600 text-sm">{address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">{t.noAddresses}</p>
                </div>
              )}

              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 border-2 border-dashed border-blue-200 rounded-lg py-4"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">{t.addNewAddress}</span>
              </button>

              {showAddressForm && (
                <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-lg mb-4">
                    {t.addNewAddress}
                  </h3>
                  <div className="grid gap-4">
                    <input
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder={t.addressPlaceholder}
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder={t.cityPlaceholder}
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            isDefault: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{t.setAsDefault}</span>
                    </label>
                  </div>
                  <div
                    className={`flex gap-3 mt-6 ${
                      isRTL ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <button
                      onClick={handleAddAddress}
                      disabled={addressLoading}
                      className={`flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors ${
                        addressLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {addressLoading ? t.loading : t.saveAddress}
                    </button>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* القسم الأيمن - ملخص الطلب */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {t.orderSummary}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.subtotal}</span>
                  <span
                    className={`font-semibold  ${
                      lang === "ar" ? "font-gess" : "font-sans"
                    } `}
                  >
                    {subtotal.toFixed(2)} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.shipping}</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">{t.free}</span>
                    ) : (
                      `${shipping.toFixed(2)} ${t.currency}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t.total}</span>
                    <span
                      className={`text-2xl font-bold text-blue-600 ${
                        lang === "ar" ? "font-gess" : "font-sans"
                      } `}
                    >
                      {total.toFixed(2)} {t.currency}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isLoading || !selectedAddress}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.creatingOrder}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {t.confirmOrder}
                  </>
                )}
              </button>

              {!selectedAddress && (
                <p className="text-red-600 text-sm mt-3 text-center">
                  {t.selectAddressWarning}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
