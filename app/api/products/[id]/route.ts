import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateProductInput } from "@/types/product";
import { Offer, Prisma } from "@prisma/client";

// =====================================
// 📌 UPDATE PRODUCT
// =====================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data: UpdateProductInput = await request.json();

    if (!data.basePrice && data.basePrice !== 0) {
      return NextResponse.json(
        { error: "السعر الأساسي (basePrice) مطلوب" },
        { status: 400 }
      );
    }

    // ==========================
    // حساب السعر النهائي
    // ==========================
    let calculatedOfferPrice: number | null = null;
    let calculatedFinalPrice: number = data.basePrice || 0;

    if (data.offerId) {
      const offer = await prisma.offer.findUnique({
        where: { id: data.offerId, isActive: true },
      });
      if (offer) {
        calculatedOfferPrice = calculateOfferPrice(data.basePrice, offer);
        calculatedFinalPrice = calculatedOfferPrice;
      }
    } else if (data.offerId === null) {
      calculatedOfferPrice = null;
      calculatedFinalPrice = data.salePrice ?? data.basePrice;
    } else if (data.salePrice !== undefined) {
      calculatedFinalPrice = data.salePrice;
    }

    // ==========================
    // تجهيز بيانات التحديث
    // ==========================
    const updateData: Prisma.ProductUpdateInput = {
      name: data.name,
      category: data.category,
      subcategory: data.subcategory ?? null,
      basePrice: data.basePrice,
      salePrice: data.salePrice ?? null,
      pricingType: data.pricingType ?? "SINGLE_PRICE",
      offerPrice: calculatedOfferPrice,
      finalPrice: calculatedFinalPrice,
      isNew: data.isNew ?? false,
      isFeatured: data.isFeatured ?? false,
      inStock: data.inStock ?? true,
      offer:
        data.offerId !== undefined
          ? data.offerId
            ? { connect: { id: data.offerId } }
            : { disconnect: true }
          : undefined,
    };

    // ==========================
    // تحديث Variants (مع الكود، الوصف، المقاسات، الصور)
    // ==========================
    if (data.variants && data.variants.length > 0) {
      // حذف القديم أولاً
      await prisma.productVariant.deleteMany({ where: { productId: id } });

      // إنشاء الجديد
      updateData.variants = {
        create: data.variants.map((variant) => ({
          code:
            variant.code || `VAR-${Math.random().toString(36).substring(2, 8)}`,
          color: variant.color,
          colorHex: variant.colorHex ?? null,
          sizes: variant.sizes ?? [], // ⚠️ تغيير من variant.size ? [variant.size] : [] إلى variant.sizes ?? []
          price: variant.price,
          images: variant.images ?? [],
          stock: variant.stock ?? 0,
          description: variant.description ?? null,
        })),
      };
    }

    // ==========================
    // تنفيذ التحديث
    // ==========================
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: true, offer: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "كود المنتج موجود مسبقاً" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل في تحديث المنتج" },
      { status: 500 }
    );
  }
}

// ==========================
// دالة حساب سعر العرض
// ==========================
function calculateOfferPrice(basePrice: number, offer: Offer): number {
  let finalPrice = basePrice;

  switch (offer.offerType) {
    case "PERCENTAGE_DISCOUNT":
      if (offer.discountPercentage) {
        finalPrice = basePrice * (1 - offer.discountPercentage / 100);
      }
      break;

    case "FIXED_AMOUNT_DISCOUNT":
      if (offer.discountAmount) {
        finalPrice = Math.max(0, basePrice - offer.discountAmount);
      }
      break;

    case "FIXED_PRICE":
      if (offer.fixedPrice) {
        finalPrice = offer.fixedPrice;
      }
      break;

    case "BUY_X_GET_Y":
    case "FREE_SHIPPING":
    case "SIMPLE":
      finalPrice = basePrice;
      break;
  }

  return Math.round(finalPrice * 100) / 100;
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        offer: true,
        // يمكنك إضافة المزيد من العلاقات حسب الحاجة
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2023") {
        return NextResponse.json(
          { error: "Invalid product ID format" },
          { status: 400 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}
