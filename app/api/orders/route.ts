import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// أنواع البيانات
interface CreateOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
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
  try {
    const data: CreateOrderInput = await req.json();

    console.log("Order data received:", data);

    // التحقق من البيانات الأساسية
    if (
      !data.userId ||
      !data.shippingAddressId ||
      !data.items ||
      data.items.length === 0
    ) {
      return NextResponse.json(
        { error: "بيانات الطلب غير مكتملة" },
        { status: 400 }
      );
    }

    // جلب عنوان الشحن والعميل
    const address = await prisma.address.findUnique({
      where: { id: data.shippingAddressId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "عنوان الشحن غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من المخزون وجمع معلومات المنتجات
    const itemDetails = [];

    for (const item of data.items) {
      let variant = null;
      let product = null;

      if (item.variantId) {
        variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: true,
          },
        });

        if (!variant) {
          return NextResponse.json(
            { error: `المتغير غير موجود` },
            { status: 400 }
          );
        }

        product = variant.product;

        // التحقق من المخزون
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `المخزون غير كافي للمنتج ${product.name}` },
            { status: 400 }
          );
        }
      } else {
        // إذا لم يكن هناك variant، جلب المنتج مباشرة
        product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
      }

      if (!product) {
        return NextResponse.json(
          { error: `المنتج غير موجود` },
          { status: 400 }
        );
      }

      itemDetails.push({
        ...item,
        variant,
        product,
      });
    }

    // حساب المبلغ الإجمالي
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // رقم الطلب الفريد
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // إنشاء الطلب مع جميع البيانات
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        totalAmount,
        finalAmount: totalAmount,

        // معلومات الشحن
        shippingAddressId: data.shippingAddressId,
        customerName: address.fullName,
        customerPhone: address.phone,
        shippingAddress: address.address,
        shippingCity: address.city,
        notes: data.notes,

        // حالة الطلب
        statusHistory: ["PENDING"],

        // عناصر الطلب
        orderItems: {
          create: itemDetails.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice || item.price,
            discountAmount: item.originalPrice
              ? item.originalPrice - item.price
              : 0,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantDetails: item.variantDetails,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true, // ✅ سيحصل على جميع حقول المنتج
            variant: true, // ✅ سيحصل على جميع حقول المتغير
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shippingAddressRef: true,
      },
    });

    // تحديث كميات المنتجات (المتغيرات فقط)
    for (const item of itemDetails) {
      if (item.variant) {
        await prisma.productVariant.update({
          where: { id: item.variant.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // تحديث حالة المنتج الرئيسي إذا نفذ المخزون
        const updatedVariant = await prisma.productVariant.findUnique({
          where: { id: item.variant.id },
        });

        if (updatedVariant && updatedVariant.stock <= 0) {
          // يمكنك تحديث المنتج الرئيسي إذا أردت
          // await prisma.product.update({
          //   where: { id: item.product.id },
          //   data: { inStock: false }
          // });
        }
      }
    }

    // حذف عناصر السلة بعد إنشاء الطلب
    await prisma.cartItem.deleteMany({
      where: { userId: data.userId },
    });

    return NextResponse.json({
      success: true,
      order,
      message: "تم إنشاء الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error creating order:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "فشل في إنشاء الطلب حيث ان الكميه غير متاحة" }, { status: 500 });
  }
}

// ================================
// 📌 GET ALL ORDERS
// ================================
export async function GET() {
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
