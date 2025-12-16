import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UpdateOfferInput } from "@/types/offers";
import { Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ⭐ تغيير 1: params هو Promise
) {
  try {
    const { id } = await params; // ⭐ تغيير 2: await params أولاً
    const data: UpdateOfferInput = await req.json();

    const existingOffer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    // تحضير بيانات التحديث
    const updateData: UpdateOfferInput = {};

    // الحقول النصية
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;

    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.subtitleEn !== undefined) updateData.subtitleEn = data.subtitleEn;

    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.descriptionEn !== undefined)
      updateData.descriptionEn = data.descriptionEn;

    // ⭐ تغيير 3: معالجة حذف الصورة بشكل صحيح
    if (data.image !== undefined) {
      // استخدام as any لحل مشكلة TypeScript مع null
      updateData.image = (data.image === "" ? null : data.image) as
        | string
        | undefined;
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // الحقول التعدادية
    if (data.offerType !== undefined) updateData.offerType = data.offerType;

    // الحقول العددية
    if (data.discountPercentage !== undefined)
      updateData.discountPercentage = data.discountPercentage;
    if (data.discountAmount !== undefined)
      updateData.discountAmount = data.discountAmount;
    if (data.fixedPrice !== undefined) updateData.fixedPrice = data.fixedPrice;
    if (data.buyQuantity !== undefined)
      updateData.buyQuantity = data.buyQuantity;
    if (data.getQuantity !== undefined)
      updateData.getQuantity = data.getQuantity;

    // التواريخ
    if (data.startDate !== undefined)
      updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData as Prisma.OfferUpdateInput,
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "فشل في تحديث العرض",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ⭐ تغيير 4: params هو Promise
) {
  try {
    const { id } = await params; // ⭐ تغيير 5: await params أولاً

    await prisma.$transaction(async (tx) => {
      // 1. جلب كل المنتجات المرتبطة بهذا العرض
      const products = await tx.product.findMany({
        where: { offerId: id },
        select: { id: true, basePrice: true },
      });

      // 2. تحديث كل منتج على حدة
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "فشل في حذف العرض",
      },
      { status: 500 }
    );
  }
}
