import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OfferType } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

// ==============================
// 📌 إعدادات الرفع
// ==============================
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم الملف أكبر من 5MB");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const randomStr = randomBytes(4).toString("hex");
  const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const filename = `${timestamp}-${randomStr}-${originalName}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}

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
    default:
      finalPrice = basePrice;
  }

  return Math.round(finalPrice * 100) / 100;
}

// ==============================
// 📌 GET منتج واحد
// ==============================
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
    console.error("❌ خطأ في جلب المنتج:", error);
    return NextResponse.json({ error: "فشل في جلب المنتج" }, { status: 500 });
  }
}

// ==============================
// 📌 PUT تحديث منتج
// ==============================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // التحقق من وجود المنتج
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // استقبال FormData
    const formData = await request.formData();
    const dataString = formData.get("data") as string;

    if (!dataString) {
      return NextResponse.json(
        { error: "بيانات المنتج مطلوبة" },
        { status: 400 }
      );
    }

    const data = JSON.parse(dataString);

    // ===== رفع الصور الجديدة =====
    const uploadedImageUrls: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        try {
          const imageUrl = await saveUploadedFile(value);
          uploadedImageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error(`❌ فشل في رفع الملف ${key}:`, uploadError);
        }
      }
    }

    // ===== حساب السعر النهائي =====
    let calculatedOfferPrice: number | null = null;
    let calculatedFinalPrice: number = data.basePrice;

    if (data.offerId) {
      const offer = await prisma.offer.findUnique({
        where: { id: data.offerId, isActive: true },
      });
      if (offer) {
        calculatedOfferPrice = calculateOfferPrice(data.basePrice, offer);
        calculatedFinalPrice = calculatedOfferPrice;
      }
    } else if (data.salePrice !== undefined) {
      calculatedFinalPrice = data.salePrice;
    }

    // ===== إعداد بيانات التحديث =====
    const updateData: Prisma.ProductUpdateInput = {
      name: data.name,
      category: data.category,
      subcategory: data.subcategory ?? null,
      basePrice: data.basePrice,
      salePrice: data.salePrice ?? null,
      offerPrice: calculatedOfferPrice,
      finalPrice: calculatedFinalPrice,
      isNew: data.isNew ?? false,
      isFeatured: data.isFeatured ?? false,
      inStock: data.inStock ?? true,
      offer: data.offerId
        ? { connect: { id: data.offerId } }
        : { disconnect: true },
    };

    // ===== معالجة المتغيرات =====
    if (data.variants && data.variants.length > 0) {
      // حذف المتغيرات القديمة
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // إنشاء المتغيرات الجديدة
      updateData.variants = {
        create: data.variants.map((variant: any, index: number) => {
          const variantImages: string[] = [];

          // 1. إضافة الصور الجديدة
          if (variant.imageFiles && Array.isArray(variant.imageFiles)) {
            variant.imageFiles.forEach((fileIndex: number) => {
              if (uploadedImageUrls[fileIndex]) {
                variantImages.push(uploadedImageUrls[fileIndex]);
              }
            });
          }

          // 2. إضافة الصور القديمة (غير المحذوفة)
          if (variant.images && Array.isArray(variant.images)) {
            variant.images.forEach((img: string) => {
              if (img && (img.startsWith("http") || img.startsWith("/"))) {
                variantImages.push(img);
              }
            });
          }

          // 3. صورة افتراضية إذا لم توجد صور
          if (variantImages.length === 0) {
            variantImages.push("/placeholder.jpg");
          }

          return {
            code: variant.code || `VAR-${Date.now()}-${index}`,
            color: variant.color,
            sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
            price: variant.price || calculatedFinalPrice,
            images: variantImages,
            stock: variant.stock || 0,
            description: variant.description || "",
          };
        }),
      };
    }

    // ===== تنفيذ التحديث =====
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        variants: true,
        offer: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "✅ تم تحديث المنتج بنجاح",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("❌ خطأ في تحديث المنتج:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "تنسيق JSON غير صحيح" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "فشل في تحديث المنتج" },
      { status: 500 }
    );
  }
}

// ==============================
// 📌 DELETE حذف منتج
// ==============================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // حذف المنتج
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "✅ تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("❌ خطأ في حذف المنتج:", error);
    return NextResponse.json({ error: "فشل في حذف المنتج" }, { status: 500 });
  }
}