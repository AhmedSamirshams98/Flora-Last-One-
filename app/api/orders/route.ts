import { requireAdmin, requireUser } from "@/lib/require-session";
import { OrderError, placeOrder } from "@/lib/create-order";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// أنواع البيانات
interface CreateOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  size?: string | null;
  price?: number; // ignored: the price is always worked out on the server
  originalPrice?: number;
  productName: string;
  variantDetails?: string;
}

interface CreateOrderInput {
  userId: string;
  shippingAddressId: string;
  items: CreateOrderItem[];
  notes?: string;
}

// ================================
// 📌 CREATE ORDER - النظام المحسن
// ================================
export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.error) return gate.error;
  try {
    const data: CreateOrderInput = await req.json();

    if (!data.shippingAddressId || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "بيانات الطلب غير مكتملة" }, { status: 400 });
    }

    // the address must be the signed-in customer's own
    const address = await prisma.address.findUnique({ where: { id: data.shippingAddressId } });
    if (!address || address.userId !== gate.user.id) {
      return NextResponse.json({ error: "عنوان الشحن غير موجود" }, { status: 404 });
    }

    // prices, stock and offers are read from the database: only colour, size and quantity come from the browser
    const order = await placeOrder(
      {
        userId: gate.user.id,
        name: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        shippingAddressId: address.id,
        notes: typeof data.notes === "string" ? data.notes.slice(0, 300) : null,
      },
      data.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, size: i.size ?? null }))
    );

    await prisma.cartItem.deleteMany({ where: { userId: gate.user.id } });

    return NextResponse.json({ success: true, order, message: "تم إنشاء الطلب بنجاح" });
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "فشل في إنشاء الطلب" }, { status: 500 });
  }
}

// ================================
// 📌 GET ALL ORDERS
// ================================
export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true, // ✅ جميع حقول المنتج
            variant: true, // ✅ جميع حقول المتغير
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shippingAddressRef: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "فشل في جلب الطلبات" }, { status: 500 });
  }
}
