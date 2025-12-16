import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CreateOfferInput } from "@/types/offers";

// ==================================
// 📌 GET ALL OFFERS
// ==================================
export async function GET() {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(offers);
}

// ==================================
// 📌 CREATE OFFER - النظام المبسط
// ==================================
export async function POST(req: Request) {
  try {
    const data: CreateOfferInput = await req.json();

    // التحقق من البيانات الأساسية
    if (!data.title || !data.offerType) {
      return NextResponse.json(
        { error: "العنوان ونوع العرض مطلوبان" },
        { status: 400 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        title: data.title,
        titleEn:data.titleEn,
        subtitle: data.subtitle,
        subtitleEn:data.subtitleEn,
        description: data.description,
        descriptionEn:data.descriptionEn,
        image: data.image, // صورة واحدة فقط
        isActive: data.isActive ?? true,

        // نوع العرض الأساسي
        offerType: data.offerType,

        // التفاصيل حسب النوع
        discountPercentage: data.discountPercentage,
        discountAmount: data.discountAmount,
        fixedPrice: data.fixedPrice,
        buyQuantity: data.buyQuantity,
        getQuantity: data.getQuantity,

        // الفترة الزمنية
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
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
