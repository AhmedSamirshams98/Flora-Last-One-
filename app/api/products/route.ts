import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  ProductType,
  ProductSubtype,
  PricingType,
  OfferType,
} from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

// ==============================
// 📌 إعدادات الرفع
// ==============================
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ==============================
// 📌 دوال مساعدة
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

    default:
      finalPrice = basePrice;
      break;
  }

  return Math.round(finalPrice * 100) / 100;
}

async function saveUploadedFile(file: File): Promise<string> {
  // التحقق من نوع الملف
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم. المسموح: JPEG, PNG, WebP, GIF");
  }

  // التحقق من حجم الملف
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم الملف أكبر من 5MB");
  }

  // قراءة الملف
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // إنشاء اسم فريد للملف
  const timestamp = Date.now();
  const randomStr = randomBytes(4).toString("hex");
  const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const filename = `${timestamp}-${randomStr}-${originalName}`;

  // التأكد من وجود مجلد الرفع
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // حفظ الملف
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);

  console.log("✅ تم حفظ الملف:", filePath);

  // إرجاع المسار العام للصورة
  return `/uploads/${filename}`;
}

// ==============================
// 📌 POST إنشاء منتج جديد
// ==============================
export async function POST(request: NextRequest) {
  try {
    console.log("📥 بدء استقبال طلب إنشاء منتج...");

    // استقبال FormData
    const formData = await request.formData();

    // لرؤية كل الحقول الواردة
    console.log("📋 الحقول المستلمة:");
    for (const [key, value] of formData.entries()) {
      console.log(
        `  ${key}: ${value instanceof File ? `[ملف: ${value.name}]` : value}`
      );
    }

    const dataString = formData.get("data") as string;

    if (!dataString) {
      console.error("❌ بيانات المنتج مفقودة");
      return NextResponse.json(
        { error: "بيانات المنتج مطلوبة" },
        { status: 400 }
      );
    }

    // تحليل بيانات المنتج
    const productData = JSON.parse(dataString);
    console.log("📊 بيانات المنتج:", productData);

    // التحقق من البيانات الأساسية
    if (!productData.name || !productData.category || !productData.basePrice) {
      return NextResponse.json(
        { error: "الاسم، الفئة والسعر الأساسي مطلوبة" },
        { status: 400 }
      );
    }

    // ===== معالجة التسعير =====
    let pricingType: PricingType = PricingType.SINGLE_PRICE;
    let finalPrice = productData.basePrice;
    let offerPrice: number | null = null;
    let offerId: string | null = null;

    if (productData.salePrice) {
      pricingType = PricingType.SALE_PRICE;
      finalPrice = productData.salePrice;
    } else if (productData.offerId) {
      pricingType = PricingType.WITH_OFFER;
      offerId = productData.offerId;

      const offer = await prisma.offer.findUnique({
        where: { id: productData.offerId, isActive: true },
      });

      if (offer) {
        offerPrice = calculateOfferPrice(productData.basePrice, offer);
        finalPrice = offerPrice;
      } else {
        return NextResponse.json(
          { error: "العرض المحدد غير موجود أو غير نشط" },
          { status: 400 }
        );
      }
    }

    // ===== رفع الصور =====
    const uploadedImageUrls: string[] = [];

    // جمع جميع الملفات من FormData
    console.log("📸 البحث عن الملفات المرفوعة...");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        console.log(
          `  📎 معالجة الملف: ${key} (${value.name}, ${value.size} bytes)`
        );
        try {
          const imageUrl = await saveUploadedFile(value);
          uploadedImageUrls.push(imageUrl);
          console.log(`  ✅ تم رفع: ${imageUrl}`);
        } catch (uploadError) {
          console.error(`  ❌ فشل في رفع الملف ${key}:`, uploadError);
        }
      }
    }

    console.log(`📊 عدد الصور المرفوعة: ${uploadedImageUrls.length}`);
    console.log("🔗 روابط الصور:", uploadedImageUrls);

    // ===== معالجة المتغيرات =====
    const variantsToCreate =
      productData.variants?.map((variant: any, index: number) => {
        let variantImages: string[] = [];

        console.log(`🔄 معالجة المتغير ${index}:`, variant);

        // 1. إضافة الصور المرفوعة حديثاً
        if (variant.imageFiles && Array.isArray(variant.imageFiles)) {
          console.log(`  📎 مؤشرات الصور: ${variant.imageFiles}`);
          variant.imageFiles.forEach((fileIndex: number) => {
            if (uploadedImageUrls[fileIndex]) {
              variantImages.push(uploadedImageUrls[fileIndex]);
              console.log(
                `  ✅ أضيفت صورة من الملف ${fileIndex}: ${uploadedImageUrls[fileIndex]}`
              );
            }
          });
        }

        // 2. إضافة روابط الصور الحالية (غير blob)
        if (variant.images && Array.isArray(variant.images)) {
          variant.images.forEach((img: string, imgIndex: number) => {
            // التحقق من أن الرابط ليس blob URL
            if (img && (img.startsWith("http") || img.startsWith("/"))) {
              if (!img.startsWith("blob:")) {
                variantImages.push(img);
                console.log(`  ✅ أضيفت صورة حالية ${imgIndex}: ${img}`);
              } else {
                console.log(`  ⚠️ تجاهل blob URL: ${img}`);
              }
            }
          });
        }

        console.log(`  📊 إجمالي صور المتغير: ${variantImages.length}`);

        // 3. إذا لم توجد صور، نضيف صورة افتراضية
        if (variantImages.length === 0) {
          variantImages.push("/placeholder.jpg");
          console.log(`  ℹ️ أضيفت صورة افتراضية`);
        }

        return {
          code: variant.code || `VAR-${Date.now()}-${index}`,
          color: variant.color || "Default",
          sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
          price: variant.price || finalPrice,
          images: variantImages,
          stock: variant.stock || 0,
          description: variant.description || "",
        };
      }) || [];

    console.log("🎯 بيانات إنشاء المتغيرات:", variantsToCreate);

    // ===== إنشاء المنتج =====
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        category: productData.category,
        subcategory: productData.subcategory,
        basePrice: productData.basePrice,
        salePrice: productData.salePrice,
        offerId,
        offerPrice,
        pricingType,
        finalPrice,
        isNew: productData.isNew || false,
        isFeatured: productData.isFeatured || false,
        inStock: productData.inStock !== false,
        variants: {
          create: variantsToCreate,
        },
      },
      include: {
        variants: true,
        offer: true,
      },
    });

    console.log("✅ تم إنشاء المنتج بنجاح:", product.id);

    return NextResponse.json({
      success: true,
      message: "✅ تم إنشاء المنتج بنجاح",
      product,
      uploadedImages: uploadedImageUrls,
    });
  } catch (error) {
    console.error("❌ خطأ في إنشاء المنتج:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "تنسيق JSON غير صحيح" },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "كود المنتج موجود مسبقاً" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل في إنشاء المنتج" },
      { status: 500 }
    );
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

    const where: Prisma.ProductWhereInput = {};

    if (category) where.category = { equals: category as ProductType };
    if (subcategory)
      where.subcategory = { equals: subcategory as ProductSubtype };

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
    console.error("❌ خطأ في جلب المنتجات:", error);
    return NextResponse.json({ error: "فشل في جلب المنتجات" }, { status: 500 });
  }
}

// ==============================
// 📌 OPTIONS للـ CORS
// ==============================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
