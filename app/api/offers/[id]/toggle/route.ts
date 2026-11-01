import { requireAdmin } from "@/lib/require-session";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  try {
    const { id } = await context.params;

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { isActive: !offer.isActive },
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error("Error toggling offer:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "فشل في تغيير حالة العرض",
      },
      { status: 500 }
    );
  }
}
