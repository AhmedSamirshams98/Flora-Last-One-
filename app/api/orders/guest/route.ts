import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderError, placeOrder } from "@/lib/create-order";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/* An order without an account: the customer gives a name, a phone, an address and a city, and pays on
   delivery. Open to anyone, so: the price comes from the database (placeOrder), the phone must be an
   Egyptian mobile number, the text fields have a length limit, and one visitor may place only a few
   orders in a short time. The order is filed under one internal "guest" user; the customer's own
   details are on the order itself (name, phone, address), which is what the dashboard shows. */

const GUEST_EMAIL = "guest-orders@flora.invalid";
const PHONE = /^01[0125]\d{8}$/;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`guest-order:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "تم تجاوز عدد المحاولات، حاول مرة أخرى بعد قليل" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const name = clean(body?.name, 80);
    const phone = clean(body?.phone, 20).replace(/[\s-]/g, "");
    const address = clean(body?.address, 200);
    const city = clean(body?.city, 60);
    const notes = clean(body?.notes, 300);

    if (name.length < 2) return NextResponse.json({ error: "اكتب اسمك" }, { status: 400 });
    if (!PHONE.test(phone)) {
      return NextResponse.json({ error: "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقمًا" }, { status: 400 });
    }
    if (address.length < 5) return NextResponse.json({ error: "اكتب العنوان بالتفصيل" }, { status: 400 });
    if (city.length < 2) return NextResponse.json({ error: "اكتب المدينة" }, { status: 400 });

    // also at most 3 orders a day from one phone number
    const perPhone = rateLimit(`guest-phone:${phone}`, 3, 24 * 60 * 60 * 1000);
    if (!perPhone.ok) {
      return NextResponse.json({ error: "تم إرسال عدة طلبات بهذا الرقم اليوم، تواصل معنا هاتفيًا" }, { status: 429 });
    }

    const guest = await prisma.user.upsert({
      where: { email: GUEST_EMAIL },
      update: {},
      create: { email: GUEST_EMAIL, name: "Guest orders", role: "USER" },
      select: { id: true },
    });

    const items = Array.isArray(body?.items)
      ? body.items.map((i: Record<string, unknown>) => ({
          productId: String(i.productId ?? ""),
          variantId: i.variantId ? String(i.variantId) : null,
          quantity: Number(i.quantity),
          size: i.size ? String(i.size) : null,
        }))
      : [];

    const order = await placeOrder({ userId: guest.id, name, phone, address, city, notes }, items);

    return NextResponse.json({
      success: true,
      order: { orderNumber: order.orderNumber, totalAmount: order.finalAmount },
      message: "تم استلام طلبك",
    });
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error creating guest order:", error);
    return NextResponse.json({ error: "فشل في إنشاء الطلب" }, { status: 500 });
  }
}
