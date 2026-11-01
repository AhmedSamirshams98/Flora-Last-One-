"use client";

/* Order without an account. The customer gives a name, a phone, an address and a city; the order is
   sent to /api/orders/guest, which works out every price and checks the stock on the server. Only
   the colour, size and quantity leave the browser. Payment is on delivery (a confirmed service). */

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { useLivePrices } from "./useLivePrices";
import "./HomeComponents/home.css";

const money = (n: number) => `EGP ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const PHONE = /^01[0125]\d{8}$/;
const WHATSAPP = "201090770881";

export default function GuestCheckout({ lang, onSignIn }: { lang: "ar" | "en"; onSignIn: () => void }) {
  const isAr = lang === "ar";
  const font = isAr ? "font-gess" : "";
  const { items, clearCart } = useCartStore();
  const { unit, total: liveTotal, subtotal: liveSubtotal, discount: liveDiscount } = useLivePrices();
  const offerDiscount = liveDiscount(items);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; total: number } | null>(null);

  const T = isAr
    ? {
        title: "إتمام الشراء",
        sub: "اطلب بدون حساب: اكتب بيانات التوصيل فقط، والدفع عند الاستلام.",
        haveAccount: "لديك حساب؟",
        signIn: "سجّل الدخول",
        name: "الاسم بالكامل",
        phone: "رقم الهاتف",
        phoneHint: "11 رقمًا يبدأ بـ 01",
        address: "العنوان بالتفصيل",
        city: "المدينة",
        notes: "ملاحظات (اختياري)",
        summary: "ملخص الطلب",
        total: "الإجمالي",
        priceNote: "السعر النهائي يُحسب عند تأكيد الطلب حسب العروض الحالية.",
        send: "تأكيد الطلب",
        sending: "جاري إرسال الطلب...",
        badPhone: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقمًا",
        fill: "أكمل الاسم والعنوان والمدينة",
        doneTitle: "تم استلام طلبك",
        orderNo: "رقم الطلب",
        keep: "احتفظ برقم الطلب. الدفع عند الاستلام.",
        wa: "تواصل معنا عبر واتساب",
        waMsg: (n: string) => `مرحبًا، رقم طلبي ${n}`,
        shop: "متابعة التسوق",
        qty: "الكمية",
        empty: "سلة التسوق فارغة",
        emptyMsg: "ابدأ التسوق لإضافة منتجات رائعة إلى سلتك",
        browse: "تصفح المنتجات",
      }
    : {
        title: "Checkout",
        sub: "Order without an account: just your delivery details. Payment is on delivery.",
        haveAccount: "Have an account?",
        signIn: "Sign in",
        name: "Full name",
        phone: "Phone number",
        phoneHint: "11 digits starting with 01",
        address: "Full address",
        city: "City",
        notes: "Notes (optional)",
        summary: "Order summary",
        total: "Total",
        priceNote: "The final price is worked out when the order is confirmed, with today's offers.",
        send: "Confirm order",
        sending: "Sending your order...",
        badPhone: "Invalid phone number. It must start with 01 and have 11 digits",
        fill: "Please fill in your name, address and city",
        doneTitle: "We received your order",
        orderNo: "Order number",
        keep: "Keep your order number. Payment is on delivery.",
        wa: "Message us on WhatsApp",
        waMsg: (n: string) => `Hello, my order number is ${n}`,
        shop: "Continue shopping",
        qty: "Qty",
        empty: "Your cart is empty",
        emptyMsg: "Start shopping to add products to your cart",
        browse: "Browse products",
      };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!PHONE.test(phone)) return void toast.error(T.badPhone);
    if (form.name.trim().length < 2 || form.address.trim().length < 5 || form.city.trim().length < 2) {
      return void toast.error(T.fill);
    }
    setBusy(true);
    try {
      const res = await axios.post("/api/orders/guest", {
        ...form,
        phone,
        // only which colour, which size and how many: the price is never sent
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, size: i.size || null })),
      });
      clearCart();
      setDone({ orderNumber: res.data.order.orderNumber, total: res.data.order.totalAmount });
    } catch (err) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error || "حدث خطأ غير متوقع" : "حدث خطأ غير متوقع");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className={`container mx-auto min-h-[60vh] px-4 py-14 text-center ${font}`} dir={isAr ? "rtl" : "ltr"}>
        <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-gold" aria-hidden="true" />
        <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">{T.doneTitle}</h1>
        <p className="mt-6 text-primary/70">{T.orderNo}</p>
        <p dir="ltr" className="fl-display mt-1 text-4xl tracking-widest text-primary" lang="en">{done.orderNumber}</p>
        <p dir="ltr" className="mt-3 text-lg text-primary">{money(done.total)}</p>
        <p className="mx-auto mt-4 max-w-md text-primary/75">{T.keep}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(T.waMsg(done.orderNumber))}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`fl-cta ${font}`}
          >
            {T.wa}
          </a>
          <Link href={`/${lang}/products`} className={`fl-btn-oval ${font}`}>{T.shop}</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`container mx-auto min-h-[60vh] px-4 py-16 text-center ${font}`} dir={isAr ? "rtl" : "ltr"}>
        <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-gold" aria-hidden="true" />
        <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">{T.empty}</h1>
        <p className="mx-auto mt-4 max-w-md text-primary/75">{T.emptyMsg}</p>
        <Link href={`/${lang}/products`} className={`fl-cta mt-8 ${font}`}>{T.browse}</Link>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 md:py-12 ${font}`} dir={isAr ? "rtl" : "ltr"}>
      <h1 lang={lang} className="fl-display text-3xl text-primary md:text-5xl">{T.title}</h1>
      <p className="mt-3 text-primary/75">{T.sub}</p>
      <p className="mt-1 text-sm text-primary/75">
        {T.haveAccount}{" "}
        <button type="button" onClick={onSignIn} className="min-h-11 px-1 text-primary underline decoration-gold underline-offset-4 hover:text-gold">
          {T.signIn}
        </button>
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
        <form onSubmit={submit} className="fl-pcard !p-6 space-y-4" noValidate>
          <div>
            <label htmlFor="g-name" className="mb-1.5 block text-sm text-primary/80">{T.name}</label>
            <input id="g-name" className="fl-input" value={form.name} onChange={set("name")} autoComplete="name" maxLength={80} required />
          </div>
          <div>
            <label htmlFor="g-phone" className="mb-1.5 block text-sm text-primary/80">
              {T.phone} <span className="text-primary/60">({T.phoneHint})</span>
            </label>
            <input id="g-phone" dir="ltr" inputMode="tel" className="fl-input" value={form.phone} onChange={set("phone")} autoComplete="tel" maxLength={14} required />
          </div>
          <div>
            <label htmlFor="g-address" className="mb-1.5 block text-sm text-primary/80">{T.address}</label>
            <input id="g-address" className="fl-input" value={form.address} onChange={set("address")} autoComplete="street-address" maxLength={200} required />
          </div>
          <div>
            <label htmlFor="g-city" className="mb-1.5 block text-sm text-primary/80">{T.city}</label>
            <input id="g-city" className="fl-input" value={form.city} onChange={set("city")} autoComplete="address-level2" maxLength={60} required />
          </div>
          <div>
            <label htmlFor="g-notes" className="mb-1.5 block text-sm text-primary/80">{T.notes}</label>
            <textarea id="g-notes" className="fl-input !min-h-24 py-2" value={form.notes} onChange={set("notes")} maxLength={300} />
          </div>
          <button type="submit" disabled={busy} className={`fl-cta w-full ${font}`}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ShoppingBag className="h-5 w-5" aria-hidden="true" />}
            {busy ? T.sending : T.send}
          </button>
        </form>

        <aside className="fl-pcard !p-6 lg:sticky lg:top-24">
          <h2 lang={lang} className="fl-display mb-4 text-2xl text-primary">{T.summary}</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 text-primary">
                  {i.name}
                  <span className="block text-primary/70">
                    {[i.color, i.size].filter(Boolean).join(" · ")} · {T.qty} {i.quantity}
                  </span>
                </span>
                <span dir="ltr" className="shrink-0 text-primary">{money(unit(i) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          {offerDiscount > 0 && (
            <div className="mt-3 flex items-center justify-between text-sm text-primary">
              <span>{isAr ? "خصم العرض (اشترِ واحصل على مجانًا)" : "Offer discount (buy X, get Y free)"}</span>
              <span dir="ltr">-{money(offerDiscount)}</span>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-gold/40 pt-4">
            <span className="text-lg text-primary">{T.total}</span>
            <span dir="ltr" lang="en" className="fl-display text-2xl text-primary">{money(liveTotal(items))}</span>
          </div>
          <p className="mt-3 text-xs leading-6 text-primary/70">{T.priceNote}</p>
        </aside>
      </div>
    </div>
  );
}
