// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - الحصول على قائمة المفضلة للمستخدم
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    // الحصول على المستخدم
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // الحصول على قائمة المفضلة مع تفاصيل المنتجات
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            variants: {
              take: 1,
            },
            offer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // تحويل البيانات إلى الشكل المطلوب
    const formattedItems = wishlistItems.map((item) => {
      const product = item.product;
      const variant = product.variants[0];

      return {
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt.toISOString(),
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          finalPrice: product.finalPrice,
          basePrice: product.basePrice,
          pricingType: product.pricingType,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          variants: product.variants.map((v) => ({
            id: v.id,
            color: v.color,
            images: v.images,
            sizes: v.sizes,
            stock: v.stock,
          })),
          offer: product.offer
            ? {
                id: product.offer.id,
                title: product.offer.title,
                offerType: product.offer.offerType,
                discountPercentage: product.offer.discountPercentage,
              }
            : undefined,
        },
      };
    });

    return NextResponse.json({
      items: formattedItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "فشل في جلب قائمة المفضلة" },
      { status: 500 }
    );
  }
}

// POST - إضافة منتج إلى المفضلة
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { productId } = data;

    if (!productId) {
      return NextResponse.json(
        { error: "معرّف المنتج مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          take: 1,
        },
        offer: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // الحصول على المستخدم
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من عدم وجود المنتج بالفعل في المفضلة
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existingWishlistItem) {
      return NextResponse.json(
        { error: "المنتج موجود بالفعل في المفضلة" },
        { status: 400 }
      );
    }

    // إضافة المنتج إلى المفضلة
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId: productId,
      },
    });

    // الحصول على المنتج مع تفاصيله
    const productWithDetails = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          take: 1,
        },
        offer: true,
      },
    });

    if (!productWithDetails) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const variant = productWithDetails.variants[0];

    return NextResponse.json({
      id: wishlistItem.id,
      userId: wishlistItem.userId,
      productId: wishlistItem.productId,
      createdAt: wishlistItem.createdAt.toISOString(),
      product: {
        id: productWithDetails.id,
        name: productWithDetails.name,
        category: productWithDetails.category,
        finalPrice: productWithDetails.finalPrice,
        basePrice: productWithDetails.basePrice,
        pricingType: productWithDetails.pricingType,
        isNew: productWithDetails.isNew,
        isFeatured: productWithDetails.isFeatured,
        variants: productWithDetails.variants.map((v) => ({
          id: v.id,
          color: v.color,
          images: v.images,
          sizes: v.sizes,
          stock: v.stock,
        })),
        offer: productWithDetails.offer
          ? {
              id: productWithDetails.offer.id,
              title: productWithDetails.offer.title,
              offerType: productWithDetails.offer.offerType,
              discountPercentage: productWithDetails.offer.discountPercentage,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);

    // إذا كان المنتج موجود بالفعل (خطأ فريد في Prisma)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "المنتج موجود بالفعل في المفضلة" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "فشل في إضافة المنتج إلى المفضلة" },
      { status: 500 }
    );
  }
}

// DELETE - إزالة منتج من المفضلة
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "معرّف المنتج مطلوب" },
        { status: 400 }
      );
    }

    // الحصول على المستخدم
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من وجود المنتج في المفضلة
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (!existingWishlistItem) {
      return NextResponse.json(
        { error: "المنتج غير موجود في المفضلة" },
        { status: 404 }
      );
    }

    // حذف المنتج من المفضلة
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "تمت إزالة المنتج من المفضلة",
    });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "فشل في إزالة المنتج من المفضلة" },
      { status: 500 }
    );
  }
}

// OPTIONS لـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
