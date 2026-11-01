"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Plus,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-primary/70">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-gold" />
          <h2
            className={`${
              lang === "ar"
                ? "font-gess font-medium"
                : "font-sans font-semibold"
            } text-2xl font-bold text-center text-primary`}
          >
            {" "}
            {t.emptyTitle}
          </h2>

          <p
            className={`${
              lang === "ar"
                ? "font-gess font-medium"
                : "font-sans font-semibold"
            } text-md mb-2 mt-2  font-bold text-center text-primary`}
          >
            {" "}
            {t.emptyMessage}
          </p>

          <button
            onClick={() => router.push(`/${lang}/products`)}
            className={`fl-cta mt-4 ${lang === "ar" ? "font-gess" : ""}`}
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
      className="py-8 font-gess md:py-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${lang}/cart`)}
            className={`mb-6 flex min-h-11 items-center gap-2 text-primary/80 transition-colors hover:text-primary ${
              isRTL ? "flex-row" : "flex-row-reverse"
            }`}
          >
            {lang === "ar" && <ArrowRight className="w-5 h-5" />}

            <span
              className={`${
                lang === "ar"
                  ? "font-gess font-medium"
                  : "font-sans font-semibold"
              } text-primary`}
            >
              {t.backToCart}
            </span>

            {lang === "en" && <ArrowLeft className="w-5 h-5" />}
          </button>

          <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">
            {t.pageTitle}
          </h1>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
          {/* القسم الأيسر */}
          <div className="lg:col-span-2 space-y-6">
            {/* عنوان الشحن */}
            <div className="fl-pcard !p-6">
              <h2 lang={lang} className="fl-display mb-5 text-2xl text-primary">
                {" "}
                {t.shippingAddress}
              </h2>

              {addressLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="text-primary/70">{t.loading}</p>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border border-gold/40 p-4 transition-colors hover:bg-secondary/50 has-[:checked]:border-gold has-[:checked]:bg-gold/10 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 h-5 w-5 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {address.fullName}
                          </span>
                          {address.isDefault && (
                            <span className="rounded-full bg-gold/25 px-2 py-0.5 text-xs text-primary">
                              {t.default}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary/75">
                          {address.address}، {address.city}
                        </p>
                        <p className="text-sm text-primary/75">{address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="mx-auto mb-3 h-12 w-12 text-gold" />
                  <p
                    className={`${
                      lang === "ar"
                        ? "font-gess font-medium"
                        : "font-sans font-semibold"
                    } text-md font-bold text-center mb-2 text-primary`}
                  >
                    {t.noAddresses}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="fl-btn-oval mt-4 w-full justify-center"
              >
                <Plus className="w-5 h-5" />
                <span
                  className={`${
                    lang === "ar"
                      ? "font-gess font-medium"
                      : "font-sans font-semibold"
                  } text-xl font-bold text-center text-primary`}
                >
                  {t.addNewAddress}
                </span>
              </button>

              {showAddressForm && (
                <div className="mt-6 rounded-xl border border-gold/40 bg-secondary/40 p-5 md:p-6">
                  <h3
                    className={`${
                      lang === "ar"
                        ? "font-gess font-medium"
                        : "font-sans font-semibold"
                    } text-lg font-bold mb-4 text-primary`}
                  >
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
                      className="fl-input"
                    />
                    <input
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className={`fl-input ${
                        lang === "ar" ? "text-right" : "text-left"
                      }`}
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
                      className="fl-input"
                    />
                    <input
                      type="text"
                      placeholder={t.cityPlaceholder}
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="fl-input"
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
                        className="h-5 w-5 accent-primary"
                      />
                      <span
                        className={`${
                          lang === "ar"
                            ? "font-gess font-medium"
                            : "font-sans font-semibold"
                        } text-sm font-bold text-center text-primary`}
                      >
                        {t.setAsDefault}
                      </span>
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
                      className="fl-cta flex-1"
                    >
                      {addressLoading ? t.loading : t.saveAddress}
                    </button>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="fl-btn-oval flex-1 justify-center"
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
            <div className="fl-pcard !p-6 lg:sticky lg:top-24">
              <h2 lang={lang} className="fl-display mb-5 text-2xl text-primary">
                {" "}
                {t.orderSummary}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span
                    className={`${
                      lang === "ar"
                        ? "font-gess font-medium"
                        : "font-sans font-semibold"
                    } text-md font-bold text-center text-primary`}
                  >
                    {t.total}
                  </span>
                  <span
                    className={`font-semibold  ${
                      lang === "ar" ? "font-gess" : "font-sans"
                    } `}
                  >
                    {subtotal.toFixed(2)} {t.currency}
                  </span>
                </div>
                <div className="mt-1">
                  <span
                    className={`${
                      lang === "ar"
                        ? "font-gess font-medium"
                        : "font-sans font-semibold"
                    } text-md font-bold text-primary`}
                  >
                    {t.shipping}
                  </span>
                  <p
                    className={`mt-1 text-sm text-primary/70 ${
                      lang === "ar" ? "font-gess" : "font-sans"
                    }`}
                  >
                    {lang === "ar"
                      ? "مصاريف الشحن تختلف حسب شركة الشحن المختارة."
                      : "Shipping costs may vary depending on the shipping provider."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isLoading || !selectedAddress}
                className="fl-cta w-full"
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
                <p className="mt-3 text-center text-sm text-[#9b2c1f]">
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
