// import { prisma } from "@/lib/prisma";
// import { UpdateOrderInput } from "@/types/order";
// import { NextResponse } from "next/server";

// // أنواع البيانات

// // ================================
// // 📌 GET SINGLE ORDER
// // ================================
// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { id: params.id },
//       include: {
//         orderItems: {
//           include: {
//             product: true, // ✅ تصحيح: استخدام include بدلاً من select
//             variant: true, // ✅ سيحصل على جميع حقول المتغير
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         assignedAdmin: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         shippingAddressRef: true,
//       },
//     });

//     if (!order) {
//       return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
//     }

//     return NextResponse.json(order);
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     return NextResponse.json({ error: "فشل في جلب الطلب" }, { status: 500 });
//   }
// }

// // ================================
// // 📌 UPDATE ORDER
// // ================================
// // export async function PUT(
// //   req: Request,
// //   { params }: { params: { id: string } }
// // ) {
// //   try {
// //     const data: UpdateOrderInput = await req.json();
// //     const adminId = req.headers.get("x-admin-id");

// //     const order = await prisma.order.findUnique({
// //       where: { id: params.id },
// //     });

// //     if (!order) {
// //       return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
// //     }

// //     // إذا تم إرسال adminId، التحقق من صلاحيات الأدمن
// //     if (adminId) {
// //       const admin = await prisma.user.findUnique({
// //         where: { id: adminId, role: { in: ["ADMIN", "SUPERADMIN"] } },
// //       });

// //       if (!admin) {
// //         return NextResponse.json(
// //           { error: "الأدمن غير موجود أو ليس لديه صلاحية" },
// //           { status: 404 }
// //         );
// //       }

// //       // التحقق من صلاحية التعديل
// //       if (
// //         order.assignedAdminId &&
// //         order.assignedAdminId !== adminId &&
// //         admin.role !== "SUPERADMIN"
// //       ) {
// //         return NextResponse.json(
// //           { error: "ليس لديك صلاحية لتعديل هذا الطلب" },
// //           { status: 403 }
// //         );
// //       }
// //     }

// //     // تحديث سجل الحالة
// //     const statusHistory = [...(order.statusHistory || []), order.status];

// //     const updatedOrder = await prisma.order.update({
// //       where: { id: params.id },
// //       data: {
// //         assignedAdminId: data.assignedAdminId,
// //         lastUpdatedBy: adminId,
// //         statusHistory,
// //         notes: data.notes,
// //       },
// //       include: {
// //         orderItems: {
// //           include: {
// //             product: true, // ✅ تصحيح
// //             variant: true, // ✅ تصحيح
// //           },
// //         },
// //         assignedAdmin: true,
// //         shippingAddressRef: true,
// //       },
// //     });

// //     return NextResponse.json(updatedOrder);
// //   } catch (error) {
// //     console.error("Error updating order:", error);
// //     return NextResponse.json(
// //       {
// //         error: error instanceof Error ? error.message : "فشل في تحديث الطلب",
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const data: UpdateOrderInput = await req.json();
//     const adminId = req.headers.get("x-admin-id");
//     console.log(adminId);

//     if (!adminId) {
//       return NextResponse.json(
//         { error: "يجب إرسال معرف الأدمن x-admin-id في الهيدر" },
//         { status: 400 }
//       );
//     }

//     // جلب الطلب الحالي
//     const order = await prisma.order.findUnique({
//       where: { id: params.id },
//     });

//     if (!order) {
//       return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
//     }

//     // جلب بيانات الأدمن
//     const admin = await prisma.user.findUnique({
//       where: { id: adminId },
//     });

//     if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN")) {
//       return NextResponse.json(
//         { error: "لا تملك صلاحية لإجراء هذا التعديل" },
//         { status: 403 }
//       );
//     }

//     // ------------------------------------------
//     // 🔥 قواعد التحكم بالصلاحيات
//     // ------------------------------------------
//     if (
//       order.assignedAdminId &&
//       order.assignedAdminId !== adminId &&
//       admin.role !== "SUPERADMIN"
//     ) {
//       return NextResponse.json(
//         { error: "لا يمكنك تعديل حالة هذا الطلب لأنه مسند لأدمن آخر" },
//         { status: 403 }
//       );
//     }

//     // أول أدمن يعدل الطلب يصبح مسؤولًا عنه
//     const assignedAdminIdToSet = order.assignedAdminId || adminId;

//     // ------------------------------------------
//     // 🔥 تحديث سجل الحالة
//     // ------------------------------------------
//     const statusHistory = [...(order.statusHistory || [])];
//     if (data.status && data.status !== order.status) {
//       statusHistory.push(order.status);
//     }

//     // ------------------------------------------
//     // 🔥 تحديث الطلب في قاعدة البيانات
//     // ------------------------------------------
//     const updatedOrder = await prisma.order.update({
//       where: { id: params.id },
//       data: {
//         status: data.status, // ✅ الآن النوع متوافق مع Enum
//         notes: data.notes,
//         lastUpdatedBy: adminId,
//         assignedAdminId: assignedAdminIdToSet,
//         statusHistory,
//       },
//       include: {
//         orderItems: {
//           include: {
//             product: true,
//             variant: true,
//           },
//         },
//         assignedAdmin: true,
//         user: true,
//       },
//     });

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     console.error("Error updating order:", error);
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "فشل في تحديث الطلب",
//       },
//       { status: 500 }
//     );
//   }
// }

// // ================================
// // 📌 DELETE ORDER
// // ================================
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // التحقق من وجود الطلب أولاً
//     const order = await prisma.order.findUnique({
//       where: { id: params.id },
//       include: {
//         orderItems: true,
//       },
//     });

//     if (!order) {
//       return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
//     }

//     // استعادة المخزون قبل الحذف (اختياري)
//     for (const item of order.orderItems) {
//       if (item.variantId) {
//         await prisma.productVariant.update({
//           where: { id: item.variantId },
//           data: {
//             stock: {
//               increment: item.quantity,
//             },
//           },
//         });
//       }
//     }

//     // حذف عناصر الطلب أولاً
//     await prisma.orderItem.deleteMany({
//       where: { orderId: params.id },
//     });

//     // حذف الطلب
//     await prisma.order.delete({
//       where: { id: params.id },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "تم حذف الطلب بنجاح",
//     });
//   } catch (error) {
//     console.error("Error deleting order:", error);
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "فشل في حذف الطلب",
//       },
//       { status: 500 }
//     );
//   }
// }

// // ================================
// // 📌 GET ORDER BY ORDER NUMBER (اختياري)
// // ================================
// export async function GETByOrderNumber(
//   req: Request,
//   { params }: { params: { orderNumber: string } }
// ) {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { orderNumber: params.orderNumber },
//       include: {
//         orderItems: {
//           include: {
//             product: true,
//             variant: true,
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         assignedAdmin: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         shippingAddressRef: true,
//       },
//     });

//     if (!order) {
//       return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
//     }

//     return NextResponse.json(order);
//   } catch (error) {
//     console.error("Error fetching order by number:", error);
//     return NextResponse.json({ error: "فشل في جلب الطلب" }, { status: 500 });
//   }
// }

import { isAdminRole, requireAdmin, requireUser } from "@/lib/require-session";
import { prisma } from "@/lib/prisma";
import { UpdateOrderInput } from "@/types/order";
import { NextResponse, NextRequest } from "next/server";

// ================================
// 📌 GET SINGLE ORDER
// ================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireUser();
  if (gate.error) return gate.error;
  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true },
        },
        shippingAddressRef: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    // a customer may read only their own order; the admins read any
    if (!isAdminRole(gate.user.role) && order.userId !== gate.user.id) {
      return NextResponse.json({ error: "لا تملك صلاحية لهذا الإجراء" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "فشل في جلب الطلب" }, { status: 500 });
  }
}

// ================================
// 📌 UPDATE ORDER
// ================================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { id } = await context.params;

  try {
    const data: UpdateOrderInput = await req.json();
    const adminId = gate.user.id; // from the signed session, not from a header the browser could fake

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN")) {
      return NextResponse.json(
        { error: "لا تملك صلاحية لإجراء هذا التعديل" },
        { status: 403 }
      );
    }

    if (
      order.assignedAdminId &&
      order.assignedAdminId !== adminId &&
      admin.role !== "SUPERADMIN"
    ) {
      return NextResponse.json(
        { error: "لا يمكنك تعديل الطلب لأنه مسند لأدمن آخر" },
        { status: 403 }
      );
    }

    const assignedAdminIdToSet = order.assignedAdminId || adminId;

    const statusHistory = [...(order.statusHistory || [])];
    if (data.status && data.status !== order.status) {
      statusHistory.push(order.status);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        lastUpdatedBy: adminId,
        assignedAdminId: assignedAdminIdToSet,
        statusHistory,
      },
      include: {
        orderItems: { include: { product: true, variant: true } },
        assignedAdmin: true,
        user: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل في تحديث الطلب" },
      { status: 500 }
    );
  }
}

// ================================
// 📌 DELETE ORDER
// ================================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    for (const item of order.orderItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "تم حذف الطلب بنجاح",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "فشل في حذف الطلب" },
      { status: 500 }
    );
  }
}
