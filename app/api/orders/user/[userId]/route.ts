import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// ================================
// 📌 GET USER ORDERS
// ================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                category: true,
              },
            },
            variant: {
              select: {
                color: true,
                images:true,
              },
            },
          },
        },
        assignedAdmin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "فشل في جلب طلبات المستخدم" },
      { status: 500 }
    );
  }
}
