import { requireAdmin } from "@/lib/require-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  ProductType,
  ProductSubtype,
  PricingType,
} from "@prisma/client";
import { saveProductImage } from "@/lib/saveProductImage";
import { calculateFinalPrice } from "@/lib/pricing";

// ==============================
// 📌 POST إنشاء منتج
// ==============================
export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  try {
    const formData = await request.formData();
    const dataString = formData.get("data") as string;

    if (!dataString) {
      return NextResponse.json(
        { error: "بيانات المنتج مطلوبة" },
        { status: 400 }
      );
    }

    const data = JSON.parse(dataString);

    if (!data.name || !data.category || !data.basePrice) {
      return NextResponse.json(
        { error: "الاسم، الفئة، والسعر الأساسي مطلوبة" },
        { status: 400 }
      );
    }

    // ==============================
    // 📸 رفع الصور
    // ==============================
    const uploadedImages: string[] = [];

    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const imageUrl = await saveProductImage(value);
        uploadedImages.push(imageUrl);
      }
    }

    // ==============================
    // 💰 حساب السعر
    // ==============================
    const pricing = await calculateFinalPrice({
      basePrice: data.basePrice,
      salePrice: data.salePrice,
      offerId: data.offerId,
    });

    // ==============================
    // 🎯 المتغيرات
    // ==============================
    const variants =
      data.variants?.map((variant: any, index: number) => {
        const images: string[] = [];

        if (variant.imageFiles) {
          variant.imageFiles.forEach((i: number) => {
            if (uploadedImages[i]) images.push(uploadedImages[i]);
          });
        }

        if (variant.images) {
          variant.images.forEach((img: string) => {
            if (!img.startsWith("blob:")) images.push(img);
          });
        }

        if (images.length === 0) images.push("/placeholder.jpg");

        return {
          code: variant.code || `VAR-${Date.now()}-${index}`,
          color: variant.color || "Default",
          sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
          price: variant.price || pricing.finalPrice,
          images,
          stock: variant.stock || 0,
          description: variant.description || "",
        };
      }) || [];

    // ==============================
    // 🧱 إنشاء المنتج
    // ==============================
    const product = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        offerId: pricing.offerId,
        offerPrice: pricing.offerPrice,
        pricingType: pricing.pricingType as PricingType,
        finalPrice: pricing.finalPrice,
        isNew: data.isNew || false,
        isFeatured: data.isFeatured || false,
        inStock: data.inStock !== false,
        variants: {
          create: variants,
        },
      },
      include: {
        variants: true,
        offer: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ إنشاء المنتج:", error);
    return NextResponse.json({ error: "فشل في إنشاء المنتج" }, { status: 500 });
  }
}

// ==============================
// 📌 GET جميع المنتجات
// ==============================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const exclude = searchParams.get("exclude"); // ✅ جديد

    const where: Prisma.ProductWhereInput = {};

    if (category) where.category = { equals: category as ProductType };
    if (subcategory)
      where.subcategory = { equals: subcategory as ProductSubtype };

    if (exclude) {
      where.id = { not: exclude }; // ✅ جديد
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: true, offer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "فشل في جلب المنتجات" }, { status: 500 });
  }
}
