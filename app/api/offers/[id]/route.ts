import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfferType } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

// ==================================
// 📌 تكوين مجلد الرفع
// ==================================
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

// ==================================
// 📌 دالة مساعدة لرفع الملفات
// ==================================
async function saveUploadedFile(file: File): Promise<string> {
  try {
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

    console.log("Offer image saved to:", filePath);

    return `/api/images/offers/${filename}`;
  } catch (error) {
    console.error("Error saving offer image:", error);
    throw new Error("فشل في رفع ملف العرض");
  }
}

// ==================================
// 📌 UPDATE OFFER - مع دعم FormData
// ==================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "معرّف العرض مطلوب" }, { status: 400 });
    }

    // التحقق من وجود العرض
    const existingOffer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    // استقبال FormData
    const formData = await request.formData();
    const dataString = formData.get("data") as string;

    if (!dataString) {
      return NextResponse.json(
        { error: "بيانات العرض مطلوبة" },
        { status: 400 }
      );
    }

    const updateData = JSON.parse(dataString);

    // ===== معالجة الصورة =====
    let imageUrl: string | null | undefined = undefined;
    const imageFile = formData.get("image") as File | null;

    // الحالة 1: رفع صورة جديدة
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await saveUploadedFile(imageFile);
        console.log("✓ New offer image uploaded:", imageUrl);
      } catch (uploadError) {
        console.error("✗ Failed to upload offer image:", uploadError);
        return NextResponse.json(
          { error: "فشل في رفع صورة العرض" },
          { status: 400 }
        );
      }
    }
    // الحالة 2: حذف الصورة (إذا أرسل null)
    else if (updateData.image === null) {
      imageUrl = null;
      console.log("✓ Offer image will be removed");
    }
    // الحالة 3: استخدام الصورة الحالية أو رابط جديد
    else if (updateData.image !== undefined) {
      if (typeof updateData.image === "string") {
        imageUrl = updateData.image;
      } else {
        imageUrl = existingOffer.image;
      }
    }

    // ===== التحقق من البيانات حسب نوع العرض =====
    if (updateData.offerType !== undefined) {
      switch (updateData.offerType) {
        case OfferType.PERCENTAGE_DISCOUNT:
          if (
            updateData.discountPercentage !== undefined &&
            (updateData.discountPercentage <= 0 ||
              isNaN(updateData.discountPercentage))
          ) {
            return NextResponse.json(
              { error: "نسبة الخصم غير صالحة" },
              { status: 400 }
            );
          }
          break;

        case OfferType.FIXED_AMOUNT_DISCOUNT:
          if (
            updateData.discountAmount !== undefined &&
            (updateData.discountAmount <= 0 || isNaN(updateData.discountAmount))
          ) {
            return NextResponse.json(
              { error: "مبلغ الخصم غير صالح" },
              { status: 400 }
            );
          }
          break;

        case OfferType.FIXED_PRICE:
          if (
            updateData.fixedPrice !== undefined &&
            (updateData.fixedPrice <= 0 || isNaN(updateData.fixedPrice))
          ) {
            return NextResponse.json(
              { error: "السعر الثابت غير صالح" },
              { status: 400 }
            );
          }
          break;

        case OfferType.BUY_X_GET_Y:
          if (
            updateData.buyQuantity !== undefined &&
            (updateData.buyQuantity <= 0 || isNaN(updateData.buyQuantity))
          ) {
            return NextResponse.json(
              { error: "كمية الشراء غير صالحة" },
              { status: 400 }
            );
          }
          if (
            updateData.getQuantity !== undefined &&
            (updateData.getQuantity <= 0 || isNaN(updateData.getQuantity))
          ) {
            return NextResponse.json(
              { error: "كمية الحصول غير صالحة" },
              { status: 400 }
            );
          }
          break;
      }
    }

    // ===== تحضير بيانات التحديث =====
    const updatePayload: any = {};

    // الحقول النصية
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.titleEn !== undefined)
      updatePayload.titleEn = updateData.titleEn;
    if (updateData.subtitle !== undefined)
      updatePayload.subtitle = updateData.subtitle;
    if (updateData.subtitleEn !== undefined)
      updatePayload.subtitleEn = updateData.subtitleEn;
    if (updateData.description !== undefined)
      updatePayload.description = updateData.description;
    if (updateData.descriptionEn !== undefined)
      updatePayload.descriptionEn = updateData.descriptionEn;

    // حالة التفعيل
    if (updateData.isActive !== undefined)
      updatePayload.isActive = updateData.isActive;

    // نوع العرض
    if (updateData.offerType !== undefined)
      updatePayload.offerType = updateData.offerType;

    // الحقول العددية
    if (updateData.discountPercentage !== undefined) {
      updatePayload.discountPercentage = updateData.discountPercentage;
    }
    if (updateData.discountAmount !== undefined) {
      updatePayload.discountAmount = updateData.discountAmount;
    }
    if (updateData.fixedPrice !== undefined) {
      updatePayload.fixedPrice = updateData.fixedPrice;
    }
    if (updateData.buyQuantity !== undefined) {
      updatePayload.buyQuantity = updateData.buyQuantity;
    }
    if (updateData.getQuantity !== undefined) {
      updatePayload.getQuantity = updateData.getQuantity;
    }

    // التواريخ
    if (updateData.startDate !== undefined) {
      updatePayload.startDate = updateData.startDate
        ? new Date(updateData.startDate)
        : null;
    }
    if (updateData.endDate !== undefined) {
      updatePayload.endDate = updateData.endDate
        ? new Date(updateData.endDate)
        : null;
    }

    // تحديث الصورة (إذا تم تحديد قيمة)
    if (imageUrl !== undefined) {
      updatePayload.image = imageUrl;
    }

    // ===== تنفيذ التحديث =====
    const offer = await prisma.offer.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث العرض بنجاح",
      offer: offer,
      imageUpdated: imageUrl !== undefined,
    });
  } catch (error) {
    console.error("Error updating offer:", error);

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
        error: error instanceof Error ? error.message : "فشل في تحديث العرض",
      },
      { status: 500 }
    );
  }
}

// ==================================
// 📌 DELETE OFFER
// ==================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "معرّف العرض مطلوب" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. جلب المنتجات المرتبطة بالعرض
      const products = await tx.product.findMany({
        where: { offerId: id },
        select: { id: true, basePrice: true },
      });

      // 2. تحديث المنتجات (إزالة العرض منها)
      for (const product of products) {
        await tx.product.update({
          where: { id: product.id },
          data: {
            offerId: null,
            pricingType: "SINGLE_PRICE",
            finalPrice: product.basePrice,
          },
        });
      }

      // 3. حذف العرض
      await tx.offer.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف العرض وإزالة تطبيقه من المنتجات بنجاح",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);

    // التحقق من error.code بأمان
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "فشل في حذف العرض",
      },
      { status: 500 }
    );
  }
}
