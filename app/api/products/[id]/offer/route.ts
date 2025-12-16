import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Offer } from "@prisma/client";

// =====================================
// 📌 APPLY/REMOVE OFFER TO PRODUCT
// =====================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;

    const { offerId } = await req.json();

    // جلب المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    let pricingType: "SINGLE_PRICE" | "WITH_OFFER" = "SINGLE_PRICE";
    let offerPrice: number | null = null;
    let finalPrice = product.basePrice;

    if (offerId) {
      pricingType = "WITH_OFFER";

      // جلب العرض المستخدم
      const offer = await prisma.offer.findUnique({
        where: { id: offerId, isActive: true },
      });

      if (offer) {
        offerPrice = calculateOfferPrice(product.basePrice, offer);
        finalPrice = offerPrice;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        offerId: offerId || null,
        offerPrice,
        pricingType,
        finalPrice,
      },
      include: {
        variants: true,
        offer: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل في تحديث العرض" },
      { status: 500 }
    );
  }
}

function calculateOfferPrice(basePrice: number, offer: Offer) {
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
      finalPrice = basePrice;
      break;
  }

  return finalPrice;
}
