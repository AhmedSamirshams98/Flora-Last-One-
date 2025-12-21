import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// =====================================
// 📌 UPDATE PRODUCT - FormData Version
// =====================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // التحقق من وجود المنتج أولاً
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            // نضمن أننا نحصل على الصور القديمة
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // استقبال FormData بدلاً من JSON مباشرة
    const formData = await request.formData();

    // استخراج البيانات النصية من حقل 'data'
    const dataString = formData.get("data");
    if (!dataString || typeof dataString !== "string") {
      return NextResponse.json(
        { error: "بيانات المنتج مطلوبة في حقل 'data'" },
        { status: 400 }
      );
    }

    // تحويل JSON string إلى object
    const data = JSON.parse(dataString);

    // التحقق من البيانات الأساسية
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
    // تجهيز بيانات التحديث الأساسية
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
    // معالجة Variants - مع الحفاظ على الصور القديمة
    // ==========================
    if (data.variants && data.variants.length > 0) {
      // حذف المتغيرات القديمة أولاً
      await prisma.productVariant.deleteMany({ where: { productId: id } });

      // إنشاء المتغيرات الجديدة مع الحفاظ على الصور
      updateData.variants = {
        create: data.variants.map((variant: any, index: number) => {
          // البحث عن المتغير القديم المقابل (إذا كان هناك تطابق)
          const oldVariant =
            existingProduct.variants.find((v) => v.color === variant.color) ||
            existingProduct.variants[index];

          // إذا كانت الصور فارغة في البيانات الجديدة، نستخدم الصور القديمة
          let finalImages: string[] = [];

          if (variant.images && variant.images.length > 0) {
            // إذا كان هناك صور جديدة، نستخدمها
            finalImages = variant.images;
          } else if (oldVariant && oldVariant.images.length > 0) {
            // إذا لم يكن هناك صور جديدة، نستخدم الصور القديمة
            finalImages = oldVariant.images;
          } else {
            // إذا لم يكن هناك صور نهائياً، نستخدم صورة افتراضية
            finalImages = ["/placeholder.jpg"];
          }

          return {
            code:
              variant.code ||
              oldVariant?.code ||
              `VAR-${Math.random().toString(36).substring(2, 8)}`,
            color: variant.color,
            sizes: Array.isArray(variant.sizes)
              ? variant.sizes
              : oldVariant?.sizes || [],
            price: variant.price || calculatedFinalPrice,
            images: finalImages,
            stock: variant.stock ?? oldVariant?.stock ?? 0,
            description: variant.description ?? oldVariant?.description ?? null,
          };
        }),
      };
    } else {
      // إذا لم يتم إرسال variants، نحتفظ بالمعلومات القديمة
      updateData.variants = {
        create: existingProduct.variants.map((variant) => ({
          code: variant.code,
          color: variant.color,
          sizes: variant.sizes,
          price: variant.price,
          images: variant.images, // نحافظ على الصور القديمة
          stock: variant.stock,
          description: variant.description,
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

    return NextResponse.json({
      success: true,
      message: "تم تحديث المنتج بنجاح",
      product: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // معالجة أخطاء الـ JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "تنسيق JSON غير صحيح في حقل 'data'" },
        { status: 400 }
      );
    }

    // معالجة أخطاء Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "كود المنتج موجود مسبقاً" },
          { status: 400 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "المنتج غير موجود" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "فشل في تحديث المنتج",
      },
      { status: 500 }
    );
  }
}

// ==========================
// دالة حساب سعر العرض
// ==========================
function calculateOfferPrice(basePrice: number, offer: any): number {
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

// ==========================
// GET - جلب منتج واحد
// ==========================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        offer: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2023") {
        return NextResponse.json(
          { error: "معرف المنتج غير صحيح" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "فشل في جلب المنتج" }, { status: 500 });
  }
}

// ==========================
// DELETE - حذف منتج
// ==========================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // التحقق من وجود المنتج
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // حذف المنتج (سيحذف المتغيرات تلقائياً إذا العلاقة cascade)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "المنتج غير موجود" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ error: "فشل في حذف المنتج" }, { status: 500 });
  }
}
