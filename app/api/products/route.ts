import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateProductInput } from "@/types/product";
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
// export async function POST(req: Request) {
//   try {
//     const data: CreateProductInput = await req.json();

//     // التحقق من البيانات الأساسية
//     if (!data.name || !data.category || !data.basePrice) {
//       return NextResponse.json(
//         { error: "الاسم، الكود، الفئة والسعر الأساسي مطلوبة" },
//         { status: 400 }
//       );
//     }

//     // ===== تحديد نوع التسعير =====
//     let pricingType: PricingType = PricingType.SINGLE_PRICE;
//     let finalPrice = data.basePrice;
//     let offerPrice: number | null = null;
//     let offerId: string | null = null;

//     // الحالة 1: سعر مخفض خاص
//     if (data.salePrice) {
//       pricingType = PricingType.SALE_PRICE;
//       finalPrice = data.salePrice;
//     }
//     // الحالة 2: مع عرض
//     else if (data.offerId) {
//       pricingType = PricingType.WITH_OFFER;
//       offerId = data.offerId;

//       // جلب العرض وحساب السعر
//       const offer = await prisma.offer.findUnique({
//         where: { id: data.offerId, isActive: true },
//       });

//       if (offer) {
//         offerPrice = calculateOfferPrice(data.basePrice, offer);
//         finalPrice = offerPrice;
//       }
//     }

//     // إنشاء المنتج
//     const product = await prisma.product.create({
//       data: {
//         name: data.name,
//         category: data.category,
//         subcategory: data.subcategory,

//         // التسعير
//         basePrice: data.basePrice,
//         salePrice: data.salePrice,
//         offerId: offerId,
//         offerPrice: offerPrice,
//         pricingType: pricingType,
//         finalPrice: finalPrice,

//         // الخيارات
//         isNew: data.isNew || false,
//         isFeatured: data.isFeatured || false,
//         inStock: data.inStock !== false,

//         // المتغيرات
//         variants: data.variants
//           ? {
//               create: data.variants.map((variant) => ({
//                 code:
//                   variant.code ||
//                   `VAR-${Math.random().toString(8).substring(2, 8)}`, // ← توليد تلقائي
//                 color: variant.color,
//                 sizes: variant.sizes ?? [], // ⚠️ تغيير من variant.size ? [variant.size] : [] إلى variant.sizes ?? []
//                 price: variant.price || finalPrice,
//                 images: variant.images || [],
//                 stock: variant.stock || 0,
//                 description: variant.description,
//               })),
//             }
//           : undefined,
//       },
//       include: {
//         variants: true,
//         offer: true,
//       },
//     });

//     return NextResponse.json(product);
//   } catch (error) {
//     console.error("Error creating product:", error);

//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P2002") {
//         return NextResponse.json(
//           { error: "كود المنتج موجود مسبقاً" },
//           { status: 400 }
//         );
//       }
//     }

//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "فشل في إنشاء المنتج",
//       },
//       { status: 500 }
//     );
//   }
// }
// const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/www/flora/uploads";
const getUploadDir = () => {
  // في التطوير: استخدم المسار النسبي
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "public", "uploads");
  }
  // في الإنتاج: استخدم المسار المطلق
  return process.env.UPLOAD_DIR || "/var/www/flora/uploads";
};

const UPLOAD_DIR = getUploadDir();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// دالة مساعدة لرفع الملفات
async function saveUploadedFile(file: File): Promise<string> {
  try {
    // التحقق من نوع الملف
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error("نوع الملف غير مدعوم");
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

    console.log("File saved to:", filePath);

    // إرجاع المسار العام للصورة
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("فشل في رفع الملف");
  }
}

// دالة مساعدة للحصول على URL عام للصورة
function getPublicUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    // استقبال FormData
    const formData = await request.formData();

    // استخراج البيانات النصية
    const dataString = formData.get("data") as string;
    if (!dataString) {
      return NextResponse.json(
        { error: "بيانات المنتج مطلوبة" },
        { status: 400 }
      );
    }

    // تحليل JSON
    const productData = JSON.parse(dataString);

    // استخراج الصور من FormData
    const imageFiles: File[] = [];
    const imageLinks: string[] = [];

    // جمع الملفات المرفوعة
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // جمع روابط الصور من بيانات المنتج
    if (productData.variants) {
      for (const variant of productData.variants) {
        if (variant.images && Array.isArray(variant.images)) {
          imageLinks.push(
            ...variant.images.filter(
              (img: string) =>
                typeof img === "string" &&
                (img.startsWith("http") || img.startsWith("/"))
            )
          );
        }
      }
    }

    // رفع الملفات إلى السيرفر
    const uploadedImageUrls: string[] = [];
    for (const imageFile of imageFiles) {
      try {
        const imageUrl = await saveUploadedFile(imageFile);
        uploadedImageUrls.push(imageUrl);
        console.log("✓ Image uploaded:", imageUrl);
      } catch (uploadError) {
        console.error("✗ Failed to upload image:", uploadError);
        // يمكنك المتابعة أو إرجاع خطأ حسب احتياجك
      }
    }

    // التحقق من البيانات الأساسية
    if (!productData.name || !productData.category || !productData.basePrice) {
      return NextResponse.json(
        { error: "الاسم، الفئة والسعر الأساسي مطلوبة" },
        { status: 400 }
      );
    }

    // ===== تحديد نوع التسعير =====
    let pricingType: PricingType = PricingType.SINGLE_PRICE;
    let finalPrice = productData.basePrice;
    let offerPrice: number | null = null;
    let offerId: string | null = null;

    // الحالة 1: سعر مخفض خاص
    if (productData.salePrice) {
      pricingType = PricingType.SALE_PRICE;
      finalPrice = productData.salePrice;
    }
    // الحالة 2: مع عرض
    else if (productData.offerId) {
      pricingType = PricingType.WITH_OFFER;
      offerId = productData.offerId;

      // جلب العرض وحساب السعر
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

    // معالجة المتغيرات وإضافة الصور
    const variantsWithImages =
      productData.variants?.map((variant: any, index: number) => {
        const variantImages: string[] = [];

        // إضافة الصور المرفوعة حديثاً لهذا المتغير (إذا تم تحديد)
        if (
          variant.uploadedImageIndexes &&
          Array.isArray(variant.uploadedImageIndexes)
        ) {
          variant.uploadedImageIndexes.forEach((imgIndex: number) => {
            if (uploadedImageUrls[imgIndex]) {
              variantImages.push(uploadedImageUrls[imgIndex]);
            }
          });
        }

        // إضافة روابط الصور الحالية
        if (variant.images && Array.isArray(variant.images)) {
          variant.images.forEach((img: string) => {
            if (
              typeof img === "string" &&
              (img.startsWith("http") || img.startsWith("/"))
            ) {
              variantImages.push(img);
            }
          });
        }

        // إذا لم تكن هناك صور، نضيف صورة افتراضية
        if (variantImages.length === 0 && uploadedImageUrls.length > 0) {
          // نأخذ أول صورة مرفوعة لهذا المنتج
          variantImages.push(uploadedImageUrls[0]);
        } else if (variantImages.length === 0) {
          // صورة افتراضية
          variantImages.push("/placeholder.jpg");
        }

        return {
          code: variant.code || `VAR-${Date.now()}-${index}`,
          color: variant.color || "Default",
          sizes: Array.isArray(variant.sizes)
            ? variant.sizes
            : variant.size
            ? [variant.size]
            : [],
          price: variant.price || finalPrice,
          images: variantImages, // 👈 الصور بعد المعالجة
          stock: variant.stock || 0,
          description: variant.description || "",
        };
      }) || [];

    // إنشاء المنتج
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        category: productData.category,
        subcategory: productData.subcategory,

        // التسعير
        basePrice: productData.basePrice,
        salePrice: productData.salePrice,
        offerId: offerId,
        offerPrice: offerPrice,
        pricingType: pricingType,
        finalPrice: finalPrice,

        // الخيارات
        isNew: productData.isNew || false,
        isFeatured: productData.isFeatured || false,
        inStock: productData.inStock !== false,

        // المتغيرات مع الصور
        variants: {
          create: variantsWithImages,
        },
      },
      include: {
        variants: true,
        offer: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء المنتج بنجاح",
      product: product,
      uploadedImages: uploadedImageUrls.length,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "تنسيق JSON غير صحيح" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("نوع الملف")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("حجم الملف")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "فشل في إنشاء المنتج",
      },
      { status: 500 }
    );
  }
}

// دعم HEAD للتحقق من وجود API
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

// دعم OPTIONS لـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, HEAD, OPTIONS",
      "Access-Control-Allow-Methods": "POST, HEAD, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
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
