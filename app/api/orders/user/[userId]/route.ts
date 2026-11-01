import { isAdminRole, requireUser } from "@/lib/require-session";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// ================================
// 📌 GET USER ORDERS
// ================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const gate = await requireUser();
  if (gate.error) return gate.error;
  const { userId } = await context.params;
  // a customer reads only their own orders
  if (!isAdminRole(gate.user.role) && gate.user.id !== userId) {
    return NextResponse.json({ error: "لا تملك صلاحية لهذا الإجراء" }, { status: 403 });
  }

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
