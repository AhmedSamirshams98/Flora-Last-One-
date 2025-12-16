import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateProductInput } from "@/types/product";
import {
  Prisma,
  ProductType,
  ProductSubtype,
  PricingType,
  OfferType,
} from "@prisma/client";

// ==============================
// 📌 GET ALL PRODUCTS
// ==============================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const offerId = searchParams.get("offerId");
    const pricingType = searchParams.get("pricingType");
    const isNew = searchParams.get("isNew");
    const isFeatured = searchParams.get("isFeatured");

    // بناء where بأمان باستخدام Prisma types
    const where: Prisma.ProductWhereInput = {};

    if (category) where.category = { equals: category as ProductType };
    if (subcategory)
      where.subcategory = { equals: subcategory as ProductSubtype };
    if (offerId) where.offerId = offerId;
    if (pricingType) where.pricingType = { equals: pricingType as PricingType };
    if (isNew !== null) where.isNew = isNew === "true";
    if (isFeatured !== null) where.isFeatured = isFeatured === "true";

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        offer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "فشل في جلب المنتجات" }, { status: 500 });
  }
}

// ==============================
// 📌 CREATE PRODUCT - النظام الجديد
// ==============================
export async function POST(req: Request) {
  try {
    const data: CreateProductInput = await req.json();

    // التحقق من البيانات الأساسية
    if (!data.name || !data.category || !data.basePrice) {
      return NextResponse.json(
        { error: "الاسم، الكود، الفئة والسعر الأساسي مطلوبة" },
        { status: 400 }
      );
    }

    // ===== تحديد نوع التسعير =====
    let pricingType: PricingType = PricingType.SINGLE_PRICE;
    let finalPrice = data.basePrice;
    let offerPrice: number | null = null;
    let offerId: string | null = null;

    // الحالة 1: سعر مخفض خاص
    if (data.salePrice) {
      pricingType = PricingType.SALE_PRICE;
      finalPrice = data.salePrice;
    }
    // الحالة 2: مع عرض
    else if (data.offerId) {
      pricingType = PricingType.WITH_OFFER;
      offerId = data.offerId;

      // جلب العرض وحساب السعر
      const offer = await prisma.offer.findUnique({
        where: { id: data.offerId, isActive: true },
      });

      if (offer) {
        offerPrice = calculateOfferPrice(data.basePrice, offer);
        finalPrice = offerPrice;
      }
    }

    // إنشاء المنتج
    const product = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,

        // التسعير
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        offerId: offerId,
        offerPrice: offerPrice,
        pricingType: pricingType,
        finalPrice: finalPrice,

        // الخيارات
        isNew: data.isNew || false,
        isFeatured: data.isFeatured || false,
        inStock: data.inStock !== false,

        // المتغيرات
        variants: data.variants
          ? {
              create: data.variants.map((variant) => ({
                code:
                  variant.code ||
                  `VAR-${Math.random().toString(8).substring(2, 8)}`, // ← توليد تلقائي
                color: variant.color,
                colorHex: variant.colorHex,
                sizes: variant.sizes ?? [], // ⚠️ تغيير من variant.size ? [variant.size] : [] إلى variant.sizes ?? []
                price: variant.price || finalPrice,
                images: variant.images || [],
                stock: variant.stock || 0,
                description: variant.description,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
        offer: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "كود المنتج موجود مسبقاً" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "فشل في إنشاء المنتج",
      },
      { status: 500 }
    );
  }
}

// ==============================
// 📌 دالة حساب سعر العرض
// ==============================
function calculateOfferPrice(
  basePrice: number,
  offer: {
    offerType: OfferType;
    discountPercentage?: number | null;
    discountAmount?: number | null;
    fixedPrice?: number | null;
  }
): number {
  let finalPrice = basePrice;

  switch (offer.offerType) {
    case OfferType.PERCENTAGE_DISCOUNT:
      if (offer.discountPercentage) {
        finalPrice = basePrice * (1 - offer.discountPercentage / 100);
      }
      break;

    case OfferType.FIXED_AMOUNT_DISCOUNT:
      if (offer.discountAmount) {
        finalPrice = Math.max(0, basePrice - offer.discountAmount);
      }
      break;

    case OfferType.FIXED_PRICE:
      if (offer.fixedPrice) {
        finalPrice = offer.fixedPrice;
      }
      break;

    case OfferType.BUY_X_GET_Y:
    case OfferType.FREE_SHIPPING:
    case OfferType.SIMPLE:
      // هذه العروض لا تؤثر على سعر المنتج مباشرة
      finalPrice = basePrice;
      break;
  }

  // تقريب إلى منزلتين عشريتين
  return Math.round(finalPrice * 100) / 100;
}
