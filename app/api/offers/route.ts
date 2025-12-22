import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfferType } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

const getUploadDir = () => {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "public", "uploads", "offers");
  }
  return process.env.UPLOAD_DIR || "/var/www/flora/uploads/offers";
};

const UPLOAD_DIR = getUploadDir();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

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

    console.log("Offer image saved to:", filePath);

    // إرجاع المسار العام للصورة
    return `/api/images/offers/${filename}`;
  } catch (error) {
    console.error("Error saving offer image:", error);
    throw new Error("فشل في رفع ملف العرض");
  }
}

// ==================================
// 📌 GET ALL OFFERS
// ==================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const offerType = searchParams.get("offerType");

    const where: any = {};

    if (isActive !== null) where.isActive = isActive === "true";
    if (offerType) where.offerType = offerType;

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            finalPrice: true,
            basePrice: true,
          },
        },
      },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json({ error: "فشل في جلب العروض" }, { status: 500 });
  }
}

// ==================================
// 📌 CREATE OFFER - مع دعم رفع الصور
// ==================================
export async function POST(request: NextRequest) {
  try {
    // استقبال FormData
    const formData = await request.formData();

    // استخراج البيانات النصية
    const dataString = formData.get("data") as string;
    if (!dataString) {
      return NextResponse.json(
        { error: "بيانات العرض مطلوبة" },
        { status: 400 }
      );
    }

    // تحليل JSON
    const offerData = JSON.parse(dataString);

    // التحقق من البيانات الأساسية
    if (!offerData.title || !offerData.offerType) {
      return NextResponse.json(
        { error: "العنوان ونوع العرض مطلوبان" },
        { status: 400 }
      );
    }

    // ===== معالجة صورة العرض =====
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;

    // إذا كان هناك ملف صورة مرفوع
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await saveUploadedFile(imageFile);
        console.log("✓ Offer image uploaded:", imageUrl);
      } catch (uploadError) {
        console.error("✗ Failed to upload offer image:", uploadError);
        return NextResponse.json(
          { error: "فشل في رفع صورة العرض" },
          { status: 400 }
        );
      }
    } else if (offerData.image && typeof offerData.image === "string") {
      // إذا كان هناك رابط صورة موجود
      imageUrl = offerData.image;
    }

    // ===== التحقق من البيانات حسب نوع العرض =====
    switch (offerData.offerType) {
      case OfferType.PERCENTAGE_DISCOUNT:
        if (
          !offerData.discountPercentage ||
          offerData.discountPercentage <= 0
        ) {
          return NextResponse.json(
            { error: "نسبة الخصم مطلوبة لنوع العرض هذا" },
            { status: 400 }
          );
        }
        break;

      case OfferType.FIXED_AMOUNT_DISCOUNT:
        if (!offerData.discountAmount || offerData.discountAmount <= 0) {
          return NextResponse.json(
            { error: "مبلغ الخصم مطلوب لنوع العرض هذا" },
            { status: 400 }
          );
        }
        break;

      case OfferType.FIXED_PRICE:
        if (!offerData.fixedPrice || offerData.fixedPrice <= 0) {
          return NextResponse.json(
            { error: "السعر الثابت مطلوب لنوع العرض هذا" },
            { status: 400 }
          );
        }
        break;

      case OfferType.BUY_X_GET_Y:
        if (!offerData.buyQuantity || !offerData.getQuantity) {
          return NextResponse.json(
            { error: "الكميات مطلوبة لنوع العرض هذا" },
            { status: 400 }
          );
        }
        break;
    }

    // ===== إنشاء العرض =====
    const offer = await prisma.offer.create({
      data: {
        title: offerData.title,
        titleEn: offerData.titleEn,
        subtitle: offerData.subtitle,
        subtitleEn: offerData.subtitleEn,
        description: offerData.description,
        descriptionEn: offerData.descriptionEn,
        image: imageUrl, // صورة العرض
        isActive: offerData.isActive ?? true,

        // نوع العرض الأساسي
        offerType: offerData.offerType,

        // التفاصيل حسب النوع
        discountPercentage: offerData.discountPercentage,
        discountAmount: offerData.discountAmount,
        fixedPrice: offerData.fixedPrice,
        buyQuantity: offerData.buyQuantity,
        getQuantity: offerData.getQuantity,

        // الفترة الزمنية
        startDate: offerData.startDate ? new Date(offerData.startDate) : null,
        endDate: offerData.endDate ? new Date(offerData.endDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء العرض بنجاح",
      offer: offer,
      uploadedImage: imageUrl ? true : false,
    });
  } catch (error) {
    console.error("Error creating offer:", error);

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
        error: error instanceof Error ? error.message : "فشل في إنشاء العرض",
      },
      { status: 500 }
    );
  }
}
